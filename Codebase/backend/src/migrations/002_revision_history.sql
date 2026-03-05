-- Migration: Proposal Revision History
-- Created: 2026-03-05

-- ============================================
-- Table: proposal_revisions
-- Tracks every change made to proposals
-- ============================================
CREATE TABLE IF NOT EXISTS proposal_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_type VARCHAR(50) NOT NULL, -- 'status_change', 'content_edit', 'quote_update', 'admin_notes', 'document_upload'
  changed_fields JSONB NOT NULL DEFAULT '[]', -- Array of field names that changed
  previous_values JSONB NOT NULL DEFAULT '{}', -- Previous values of changed fields
  new_values JSONB NOT NULL DEFAULT '{}', -- New values of changed fields
  change_reason TEXT, -- Optional reason for the change
  snapshot JSONB NOT NULL DEFAULT '{}', -- Complete proposal state at this point
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE proposal_revisions IS 'Complete audit trail of all changes to proposals';
COMMENT ON COLUMN proposal_revisions.change_type IS 'Category of change: status_change, content_edit, quote_update, admin_notes, document_upload';
COMMENT ON COLUMN proposal_revisions.changed_fields IS 'Array of field names that were modified';
COMMENT ON COLUMN proposal_revisions.snapshot IS 'Complete proposal JSON state at time of revision';
COMMENT ON COLUMN proposal_revisions.change_reason IS 'Optional explanation for why the change was made';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_proposal_revisions_proposal_id 
  ON proposal_revisions(proposal_id);

CREATE INDEX IF NOT EXISTS idx_proposal_revisions_revision_number 
  ON proposal_revisions(proposal_id, revision_number);

CREATE INDEX IF NOT EXISTS idx_proposal_revisions_created_at 
  ON proposal_revisions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposal_revisions_changed_by 
  ON proposal_revisions(changed_by);

-- Composite index for fetching revision history
CREATE INDEX IF NOT EXISTS idx_proposal_revisions_history 
  ON proposal_revisions(proposal_id, created_at DESC);

-- ============================================
-- Add current_revision_number to proposals table
-- ============================================
ALTER TABLE proposals 
  ADD COLUMN IF NOT EXISTS current_revision_number INTEGER DEFAULT 1;

-- Update existing proposals with default revision number
UPDATE proposals 
  SET current_revision_number = 1 
  WHERE current_revision_number IS NULL;

-- ============================================
-- Function: Create initial revision for existing proposals
-- ============================================
CREATE OR REPLACE FUNCTION create_initial_revisions()
RETURNS void AS $$
DECLARE
  proposal_record RECORD;
BEGIN
  FOR proposal_record IN 
    SELECT p.id, p.client_id, p.created_at
    FROM proposals p
    WHERE NOT EXISTS (
      SELECT 1 FROM proposal_revisions pr 
      WHERE pr.proposal_id = p.id
    )
  LOOP
    INSERT INTO proposal_revisions (
      proposal_id,
      revision_number,
      changed_by,
      change_type,
      changed_fields,
      previous_values,
      new_values,
      change_reason,
      snapshot,
      created_at
    )
    SELECT 
      proposal_record.id,
      1,
      proposal_record.client_id,
      'initial',
      '[]'::jsonb,
      '{}'::jsonb,
      to_jsonb(proposals.*),
      'Initial proposal creation',
      to_jsonb(proposals.*),
      proposal_record.created_at
    FROM proposals
    WHERE id = proposal_record.id;
  END LOOP;
END;
$$ language 'plpgsql';

-- Run the function to backfill initial revisions
SELECT create_initial_revisions();

-- ============================================
-- Function: Increment revision number safely
-- ============================================
CREATE OR REPLACE FUNCTION get_next_revision_number(p_proposal_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_rev INTEGER;
BEGIN
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO current_rev
  FROM proposal_revisions
  WHERE proposal_id = p_proposal_id;
  
  RETURN current_rev;
END;
$$ language 'plpgsql';

-- ============================================
-- View: proposal_revision_history
-- Convenience view for displaying revision history
-- ============================================
CREATE OR REPLACE VIEW proposal_revision_history AS
SELECT 
  pr.id,
  pr.proposal_id,
  pr.revision_number,
  pr.changed_by,
  pr.change_type,
  pr.changed_fields,
  pr.previous_values,
  pr.new_values,
  pr.change_reason,
  pr.snapshot,
  pr.created_at,
  p.full_name as changed_by_name,
  p.email as changed_by_email,
  p.avatar_url as changed_by_avatar
FROM proposal_revisions pr
LEFT JOIN profiles p ON pr.changed_by = p.id
ORDER BY pr.proposal_id, pr.revision_number DESC;

COMMENT ON VIEW proposal_revision_history IS 'Revision history with user details';

-- ============================================
-- Function: Compare two revisions
-- ============================================
CREATE OR REPLACE FUNCTION compare_revisions(
  p_proposal_id UUID,
  p_from_revision INTEGER,
  p_to_revision INTEGER
)
RETURNS TABLE (
  field_name TEXT,
  old_value JSONB,
  new_value JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH from_rev AS (
    SELECT snapshot
    FROM proposal_revisions
    WHERE proposal_id = p_proposal_id AND revision_number = p_from_revision
  ),
  to_rev AS (
    SELECT snapshot
    FROM proposal_revisions
    WHERE proposal_id = p_proposal_id AND revision_number = p_to_revision
  )
  SELECT 
    key as field_name,
    (SELECT snapshot->key FROM from_rev) as old_value,
    (SELECT snapshot->key FROM to_rev) as new_value
  FROM jsonb_object_keys((SELECT snapshot FROM to_rev)) as key
  WHERE (SELECT snapshot->key FROM from_rev) IS DISTINCT FROM (SELECT snapshot->key FROM to_rev);
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION compare_revisions IS 'Compare two revisions and return differing fields';