-- Migration: SLA Tracking and Time Duration Tables
-- Created: 2026-03-05

-- ============================================
-- Table: sla_config
-- Stores SLA targets for each proposal status
-- ============================================
CREATE TABLE IF NOT EXISTS sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL UNIQUE,
  target_hours INTEGER NOT NULL,
  warning_threshold_hours INTEGER, -- When to show warning (e.g., 80% of target)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE sla_config IS 'Stores SLA target times for each proposal status';
COMMENT ON COLUMN sla_config.status IS 'Proposal status (submitted, under_review, etc.)';
COMMENT ON COLUMN sla_config.target_hours IS 'Maximum hours allowed in this status before SLA breach';
COMMENT ON COLUMN sla_config.warning_threshold_hours IS 'Hours before target to start showing warning';

-- Insert default SLA configurations
INSERT INTO sla_config (status, target_hours, warning_threshold_hours) VALUES
  ('submitted', 48, 36),        -- Review submitted proposals within 48 hours
  ('under_review', 72, 54),     -- Complete review within 72 hours
  ('in_discussion', 168, 120),  -- Discussion phase within 1 week
  ('quoted', 336, 288),         -- Quote valid for 2 weeks
  ('accepted', 48, 36)          -- Convert to project within 48 hours of acceptance
ON CONFLICT (status) DO NOTHING;

-- ============================================
-- Table: proposal_status_durations
-- Tracks time spent in each status for every proposal
-- ============================================
CREATE TABLE IF NOT EXISTS proposal_status_durations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  exited_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER, -- Calculated when status changes
  assigned_to UUID REFERENCES profiles(id),
  sla_target_hours INTEGER, -- Snapshot of SLA at entry time
  sla_met BOOLEAN, -- Calculated on exit
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments
COMMENT ON TABLE proposal_status_durations IS 'Tracks time proposals spend in each status';
COMMENT ON COLUMN proposal_status_durations.duration_seconds IS 'Auto-calculated when status changes';
COMMENT ON COLUMN proposal_status_durations.sla_met IS 'Whether SLA was met for this status period';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_status_durations_proposal 
  ON proposal_status_durations(proposal_id);

CREATE INDEX IF NOT EXISTS idx_status_durations_status 
  ON proposal_status_durations(status);

CREATE INDEX IF NOT EXISTS idx_status_durations_assigned 
  ON proposal_status_durations(assigned_to);

CREATE INDEX IF NOT EXISTS idx_status_durations_entered 
  ON proposal_status_durations(entered_at);

-- Index for finding active (not exited) durations
CREATE INDEX IF NOT EXISTS idx_status_durations_active 
  ON proposal_status_durations(proposal_id, status) 
  WHERE exited_at IS NULL;

-- ============================================
-- Add current_status_tracking to proposals table
-- ============================================
ALTER TABLE proposals 
  ADD COLUMN IF NOT EXISTS current_status_entered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS current_status_assigned_to UUID REFERENCES profiles(id);

-- Update existing proposals with default values
UPDATE proposals 
  SET current_status_entered_at = created_at 
  WHERE current_status_entered_at IS NULL;

-- Create index for SLA queries
CREATE INDEX IF NOT EXISTS idx_proposals_status_entered 
  ON proposals(status, current_status_entered_at) 
  WHERE current_status_entered_at IS NOT NULL;

-- ============================================
-- Function: Update timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables
DROP TRIGGER IF EXISTS update_sla_config_updated_at ON sla_config;
CREATE TRIGGER update_sla_config_updated_at
  BEFORE UPDATE ON sla_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_status_durations_updated_at ON proposal_status_durations;
CREATE TRIGGER update_status_durations_updated_at
  BEFORE UPDATE ON proposal_status_durations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- View: proposal_sla_status
-- Convenience view for checking current SLA status
-- ============================================
CREATE OR REPLACE VIEW proposal_sla_status AS
SELECT 
  p.id as proposal_id,
  p.status,
  p.current_status_entered_at,
  p.current_status_assigned_to,
  EXTRACT(EPOCH FROM (now() - p.current_status_entered_at))/3600 as hours_in_status,
  sc.target_hours as sla_target_hours,
  sc.warning_threshold_hours,
  CASE 
    WHEN sc.target_hours IS NULL THEN 'no_sla'
    WHEN EXTRACT(EPOCH FROM (now() - p.current_status_entered_at))/3600 > sc.target_hours THEN 'breached'
    WHEN EXTRACT(EPOCH FROM (now() - p.current_status_entered_at))/3600 > sc.warning_threshold_hours THEN 'warning'
    ELSE 'on_track'
  END as sla_status,
  sc.target_hours - EXTRACT(EPOCH FROM (now() - p.current_status_entered_at))/3600 as hours_remaining
FROM proposals p
LEFT JOIN sla_config sc ON p.status = sc.status AND sc.is_active = true
WHERE p.current_status_entered_at IS NOT NULL
  AND p.status NOT IN ('draft', 'converted', 'rejected');

COMMENT ON VIEW proposal_sla_status IS 'Real-time SLA status for all active proposals';

-- ============================================
-- Function: Calculate duration on exit
-- ============================================
CREATE OR REPLACE FUNCTION calculate_duration_on_exit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.exited_at IS NOT NULL AND OLD.exited_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.exited_at - NEW.entered_at));
    
    -- Determine if SLA was met
    IF NEW.sla_target_hours IS NOT NULL THEN
      NEW.sla_met = (NEW.duration_seconds / 3600.0) <= NEW.sla_target_hours;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_calculate_duration ON proposal_status_durations;
CREATE TRIGGER trigger_calculate_duration
  BEFORE UPDATE ON proposal_status_durations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_duration_on_exit();