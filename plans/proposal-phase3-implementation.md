# Phase 3 + Analytics: Detailed Implementation Plan

## 1. Revision History System

### Database Schema

```sql
-- New table: proposal_revisions
CREATE TABLE proposal_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_type VARCHAR(50) NOT NULL, -- 'status_change', 'content_edit', 'quote_update', 'admin_notes'
  changed_fields JSONB NOT NULL, -- ['status', 'description', 'budget_range']
  previous_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  change_reason TEXT,
  snapshot JSONB NOT NULL, -- Complete proposal state at this point
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_proposal_revisions_proposal_id ON proposal_revisions(proposal_id);
CREATE INDEX idx_proposal_revisions_created_at ON proposal_revisions(created_at);

-- Add current_revision_number to proposals for quick lookup
ALTER TABLE proposals ADD COLUMN current_revision_number INTEGER DEFAULT 1;
```

### Backend Implementation

**Middleware/Hook Approach:**
Create a revision tracking middleware that captures changes before/after updates:

```typescript
// src/middleware/revisionTracker.ts
export async function trackProposalRevision(
  proposalId: string,
  changedBy: string,
  changeType: string,
  before: Record<string, any>,
  after: Record<string, any>,
  reason?: string
) {
  const changedFields = Object.keys(after).filter(key => before[key] !== after[key]);
  
  const { data: current } = await supabaseAdmin
    .from('proposals')
    .select('current_revision_number')
    .eq('id', proposalId)
    .single();
    
  const newRevisionNumber = (current?.current_revision_number || 0) + 1;
  
  await supabaseAdmin.from('proposal_revisions').insert({
    proposal_id: proposalId,
    revision_number: newRevisionNumber,
    changed_by: changedBy,
    change_type: changeType,
    changed_fields: changedFields,
    previous_values: Object.fromEntries(changedFields.map(f => [f, before[f]])),
    new_values: Object.fromEntries(changedFields.map(f => [f, after[f]])),
    change_reason: reason,
    snapshot: after
  });
  
  await supabaseAdmin
    .from('proposals')
    .update({ current_revision_number: newRevisionNumber })
    .eq('id', proposalId);
}
```

**Routes to Update:**
- `PATCH /api/proposals/:id/status` - Track status changes
- Quote creation/update endpoints - Track quote changes
- Any future proposal update endpoints

**New Routes:**
```typescript
// GET /api/proposals/:id/revisions - List all revisions
// GET /api/proposals/:id/revisions/:revisionId - Get specific revision
// GET /api/proposals/:id/revisions/compare?from=1&to=3 - Compare two revisions
```

### Frontend Implementation

**Components Needed:**
1. **RevisionTimeline** - Vertical timeline showing revision history
2. **RevisionDiff** - Side-by-side or inline diff view
3. **RevisionBadge** - Show revision number on proposal detail
4. **RevertToRevision** - Button to restore previous version (admin only)

**UI Placement:**
- New "History" tab on proposal detail page
- Show latest revision info in proposal header

---

## 2. Proposal Templates System

### Database Schema

```sql
-- New table: proposal_templates
CREATE TABLE proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'web_app', 'mobile_app', 'ecommerce', 'saas', 'other'
  icon VARCHAR(50), -- Lucide icon name
  default_title VARCHAR(200),
  default_description TEXT,
  questions JSONB, -- Array of guided questions
  suggested_budget_range VARCHAR(50),
  suggested_timeline VARCHAR(50),
  document_checklist JSONB, -- Suggested documents to upload
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Example questions JSON structure:
-- [
--   { "id": "1", "question": "What is your target launch date?", "type": "date", "required": true },
--   { "id": "2", "question": "Do you have existing brand guidelines?", "type": "boolean", "required": false },
--   { "id": "3", "question": "Who are your main competitors?", "type": "text", "required": false }
-- ]
```

### Backend Implementation

**New Routes:**
```typescript
// GET /api/proposal-templates - List active templates
// GET /api/proposal-templates/:id - Get template details
// POST /api/proposal-templates - Create template (admin)
// PATCH /api/proposal-templates/:id - Update template (admin)
// DELETE /api/proposal-templates/:id - Soft delete (admin)
```

### Frontend Implementation

**Components Needed:**
1. **TemplateGallery** - Grid of template cards with icons
2. **TemplateCard** - Individual template preview
3. **GuidedProposalForm** - Step-by-step form based on template
4. **TemplateEditor** - Admin interface to create/edit templates

**User Flow:**
```
Client clicks "New Proposal" 
    ↓
Sees Template Gallery (E-commerce, SaaS, Mobile App, etc.)
    ↓
Selects Template
    ↓
Guided form with pre-filled content and specific questions
    ↓
Submit
```

**New Pages:**
- `/client/proposals/templates` - Template selection page
- `/admin/proposal-templates` - Template management
- `/admin/proposal-templates/new` - Create template
- `/admin/proposal-templates/:id/edit` - Edit template

---

## 3. SLA & Time Tracking System

### Database Schema

```sql
-- New table: proposal_status_durations
CREATE TABLE proposal_status_durations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  exited_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER, -- Calculated field
  assigned_to UUID REFERENCES profiles(id),
  sla_target_hours INTEGER, -- SLA target for this status
  sla_met BOOLEAN, -- Whether SLA was met
  notes TEXT
);

CREATE INDEX idx_status_durations_proposal ON proposal_status_durations(proposal_id);
CREATE INDEX idx_status_durations_status ON proposal_status_durations(status);

-- New table: sla_config
CREATE TABLE sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL UNIQUE,
  target_hours INTEGER NOT NULL,
  warning_threshold_hours INTEGER, -- When to show warning (e.g., 80% of target)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Default SLA config
INSERT INTO sla_config (status, target_hours, warning_threshold_hours) VALUES
  ('submitted', 48, 36),      -- Review within 48 hours
  ('under_review', 72, 54),   -- Complete review in 72 hours
  ('in_discussion', 168, 120), -- Discussion within a week
  ('quoted', 336, 288);       -- Quote valid for 2 weeks default
```

### Backend Implementation

**Automatic Tracking:**
Hook into status change events to track time:

```typescript
// When status changes:
async function onStatusChange(proposalId: string, newStatus: string, assignedTo?: string) {
  // Close previous status duration
  await supabaseAdmin
    .from('proposal_status_durations')
    .update({ 
      exited_at: new Date().toISOString(),
      duration_seconds: calculateDurationSeconds(entry.entered_at)
    })
    .eq('proposal_id', proposalId)
    .is('exited_at', null);
    
  // Start new status duration
  const slaConfig = await getSLAConfig(newStatus);
  await supabaseAdmin.from('proposal_status_durations').insert({
    proposal_id: proposalId,
    status: newStatus,
    entered_at: new Date().toISOString(),
    assigned_to: assignedTo,
    sla_target_hours: slaConfig?.target_hours
  });
}
```

**New Routes:**
```typescript
// GET /api/proposals/:id/timeline - Get time tracking data
// GET /api/analytics/sla-performance - SLA metrics
// GET /api/analytics/aging-report - Proposals by time in status
// PATCH /api/sla-config - Update SLA targets (admin)
```

### Frontend Implementation

**Components Needed:**
1. **SLAIndicator** - Badge showing time remaining vs SLA
2. **AgingWarning** - Alert for overdue proposals
3. **TimeInStatus** - Display duration in current status
4. **SLAConfigPanel** - Admin configuration interface
5. **ProposalTimeline** - Visual timeline with duration bars

**UI Elements:**
- Color-coded proposals (green = on track, yellow = warning, red = overdue)
- Hover tooltips showing SLA details
- Admin dashboard widget: "Proposals at Risk"

---

## 4. Analytics Dashboard

### Database Schema

```sql
-- Materialized view for fast analytics queries
CREATE MATERIALIZED VIEW proposal_analytics AS
WITH status_transitions AS (
  SELECT 
    p.id as proposal_id,
    p.category,
    p.status as current_status,
    p.created_at,
    p.updated_at,
    EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/3600 as total_hours,
    COUNT(DISTINCT pr.id) as revision_count,
    EXISTS(SELECT 1 FROM quotes q WHERE q.proposal_id = p.id) as has_quote
  FROM proposals p
  LEFT JOIN proposal_revisions pr ON pr.proposal_id = p.id
  GROUP BY p.id
)
SELECT * FROM status_transitions;

-- Create indexes on materialized view
CREATE INDEX idx_analytics_category ON proposal_analytics(category);
CREATE INDEX idx_analytics_status ON proposal_analytics(current_status);
CREATE INDEX idx_analytics_created ON proposal_analytics(created_at);

-- Refresh schedule (run every hour)
-- Can use pg_cron or trigger-based refresh
```

### Backend Implementation

**Analytics Service:**
```typescript
// src/services/analytics.ts
export class ProposalAnalytics {
  async getConversionFunnel(startDate: Date, endDate: Date) {
    // Return counts at each stage
  }
  
  async getAverageTimeByStatus(startDate: Date, endDate: Date) {
    // Return avg hours per status
  }
  
  async getPipelineValue() {
    // Sum of quoted amounts by status
  }
  
  async getWinLossRatio(startDate: Date, endDate: Date) {
    // Conversion rate calculation
  }
  
  async getTopPerformers() {
    // Team members with best conversion rates
  }
}
```

**New Routes:**
```typescript
// GET /api/analytics/dashboard - Main dashboard metrics
// GET /api/analytics/conversion-funnel?from=&to= - Funnel data
// GET /api/analytics/pipeline-value - Pipeline metrics
// GET /api/analytics/performance?userId= - Individual performance
// GET /api/analytics/export?format=csv - Export data
```

### Frontend Implementation

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline Value: $XXX,XXX    Conversion: XX%    Avg Time: Xd │
├─────────────────────────────────────────────────────────────┤
│  [Conversion Funnel Chart]      [Pipeline by Status Pie]    │
├─────────────────────────────────────────────────────────────┤
│  [Proposals Over Time Line]     [Category Breakdown Bar]    │
├─────────────────────────────────────────────────────────────┤
│  [Team Performance Table]       [Aging Report List]         │
└─────────────────────────────────────────────────────────────┘
```

**Components Needed:**
1. **ConversionFunnel** - Visual funnel chart
2. **PipelineChart** - Value in each status
3. **TrendLine** - Proposals over time
4. **PerformanceTable** - Team member stats
5. **AgingReport** - Overdue proposals list
6. **KPICards** - Key metrics at top
7. **DateRangePicker** - Filter analytics by date

**New Pages:**
- `/admin/analytics` - Main analytics dashboard
- `/admin/analytics/proposals` - Detailed proposal analytics
- `/admin/analytics/team` - Team performance

---

## Implementation Order

### Sprint 1: Foundation
1. Create all database schemas/migrations
2. Set up SLA tracking hooks
3. Create revision tracking middleware
4. Basic analytics materialized view

### Sprint 2: SLA & Time Tracking
1. Implement status duration tracking
2. Build SLA indicators in UI
3. Create SLA config admin panel
4. Aging reports

### Sprint 3: Revision History
1. Integrate revision tracking into existing routes
2. Build revision timeline UI
3. Diff view component
4. Revision comparison feature

### Sprint 4: Templates
1. Template CRUD API
2. Template gallery UI
3. Guided proposal form
4. Template management admin

### Sprint 5: Analytics Dashboard
1. Analytics service endpoints
2. Dashboard layout and charts
3. Export functionality
4. Real-time updates (optional)

---

## Technical Notes

### Performance Considerations
- Use database indexes on frequently queried fields
- Materialized views for heavy analytics calculations
- Lazy load revision history (pagination)
- Cache template list (rarely changes)

### Security
- Only admins can view SLA config
- Clients can only see their own proposal revisions
- Analytics restricted to admin role
- Template editing restricted to admin role

### Migration Strategy
```sql
-- Run these in order:
1. Create new tables (revisions, templates, sla_config, status_durations)
2. Add columns to existing tables (current_revision_number)
3. Backfill data if needed (set revision_number = 1 for existing)
4. Create materialized view
5. Set up cron job for view refresh
```

Would you like me to elaborate on any specific feature or create the actual implementation tickets?