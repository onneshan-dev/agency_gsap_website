-- Migration: Analytics Dashboard
-- Created: 2026-03-05
-- Comprehensive analytics covering all proposal system topics

-- ============================================
-- Materialized View: proposal_analytics_summary
-- Core metrics for dashboard KPIs
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS proposal_analytics_summary AS
WITH proposal_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE status NOT IN ('draft', 'converted', 'rejected')) as active_proposals,
    COUNT(*) FILTER (WHERE status = 'converted') as converted_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status = 'quoted') as quoted_count,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
    COUNT(*) as total_proposals,
    COUNT(DISTINCT client_id) as unique_clients,
    MIN(created_at) as earliest_proposal,
    MAX(created_at) as latest_proposal
  FROM proposals
),
sla_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE proposal_sla_status.sla_status = 'on_track') as on_track_count,
    COUNT(*) FILTER (WHERE proposal_sla_status.sla_status = 'warning') as warning_count,
    COUNT(*) FILTER (WHERE proposal_sla_status.sla_status = 'breached') as breached_count,
    AVG(proposal_sla_status.hours_in_status) FILTER (WHERE proposal_sla_status.sla_target_hours IS NOT NULL) as avg_hours_in_status,
    AVG(CASE WHEN proposal_status_durations.sla_met = true THEN 1.0 ELSE 0.0 END) * 100 as sla_compliance_rate
  FROM proposal_sla_status
  LEFT JOIN proposal_status_durations
    ON proposal_sla_status.proposal_id = proposal_status_durations.proposal_id
  WHERE proposal_status_durations.exited_at IS NOT NULL
),
time_stats AS (
  SELECT
    AVG(duration_seconds / 3600.0) FILTER (WHERE status = 'submitted') as avg_time_to_review,
    AVG(duration_seconds / 3600.0) FILTER (WHERE status = 'under_review') as avg_review_duration,
    AVG(duration_seconds / 3600.0) FILTER (WHERE status = 'in_discussion') as avg_discussion_duration,
    AVG(duration_seconds / 3600.0) FILTER (WHERE status = 'quoted') as avg_quote_acceptance_time
  FROM proposal_status_durations
  WHERE exited_at IS NOT NULL
)
SELECT
  ps.active_proposals,
  ps.converted_count,
  ps.rejected_count,
  ps.quoted_count,
  ps.accepted_count,
  ps.total_proposals,
  ps.unique_clients,
  COALESCE(ss.on_track_count, 0) as on_track_count,
  COALESCE(ss.warning_count, 0) as warning_count,
  COALESCE(ss.breached_count, 0) as breached_count,
  COALESCE(ss.sla_compliance_rate, 100) as sla_compliance_rate,
  ts.avg_time_to_review,
  ts.avg_review_duration,
  ts.avg_discussion_duration,
  ts.avg_quote_acceptance_time,
  CASE 
    WHEN ps.total_proposals > 0 
    THEN (ps.converted_count::float / NULLIF(ps.total_proposals - ps.rejected_count, 0)) * 100
    ELSE 0 
  END as conversion_rate,
  now() as refreshed_at
FROM proposal_stats ps
CROSS JOIN sla_stats ss
CROSS JOIN time_stats ts;

CREATE UNIQUE INDEX idx_analytics_summary_refresh ON proposal_analytics_summary(refreshed_at);

-- ============================================
-- Materialized View: proposal_funnel_by_month
-- Monthly conversion funnel data
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS proposal_funnel_by_month AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review', 'in_discussion', 'quoted', 'accepted', 'converted')) as submitted,
  COUNT(*) FILTER (WHERE status IN ('under_review', 'in_discussion', 'quoted', 'accepted', 'converted')) as reviewed,
  COUNT(*) FILTER (WHERE status IN ('quoted', 'accepted', 'converted')) as quoted,
  COUNT(*) FILTER (WHERE status IN ('accepted', 'converted')) as accepted,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM proposals
WHERE created_at >= DATE_TRUNC('month', now() - interval '12 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

CREATE UNIQUE INDEX idx_funnel_month ON proposal_funnel_by_month(month);

-- ============================================
-- Materialized View: category_performance
-- Performance metrics by project category
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS category_performance AS
SELECT
  COALESCE(category, 'uncategorized') as category,
  COUNT(*) as total_proposals,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review', 'in_discussion', 'quoted', 'accepted')) as in_progress,
  CASE 
    WHEN COUNT(*) > 0 
    THEN (COUNT(*) FILTER (WHERE status = 'converted')::float / COUNT(*)) * 100
    ELSE 0 
  END as conversion_rate,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400.0) 
    FILTER (WHERE status = 'converted') as avg_days_to_convert,
  COUNT(DISTINCT client_id) as unique_clients
FROM proposals
GROUP BY category;

CREATE UNIQUE INDEX idx_category_performance_category ON category_performance(category);

-- ============================================
-- Materialized View: team_performance
-- Performance metrics by team member
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS team_performance AS
SELECT
  p.id as user_id,
  p.full_name,
  p.email,
  p.avatar_url,
  COUNT(DISTINCT psd.proposal_id) as proposals_handled,
  COUNT(*) as total_status_assignments,
  AVG(psd.duration_seconds / 3600.0) as avg_hours_per_status,
  AVG(CASE WHEN psd.sla_met = true THEN 1.0 ELSE 0.0 END) * 100 as sla_compliance_rate,
  COUNT(*) FILTER (WHERE psd.sla_met = false) as sla_breaches,
  AVG(psd.duration_seconds / 3600.0) 
    FILTER (WHERE psd.status = 'under_review') as avg_review_time_hours,
  COUNT(DISTINCT pr.proposal_id) 
    FILTER (WHERE pr.change_type = 'status_change') as status_changes_made
FROM profiles p
LEFT JOIN proposal_status_durations psd ON psd.assigned_to = p.id AND psd.exited_at IS NOT NULL
LEFT JOIN proposal_revisions pr ON pr.changed_by = p.id
WHERE p.role IN ('admin', 'team_member')
GROUP BY p.id, p.full_name, p.email, p.avatar_url;

CREATE UNIQUE INDEX idx_team_performance_user ON team_performance(user_id);

-- ============================================
-- Materialized View: template_usage_analytics
-- Template usage and effectiveness
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS template_usage_analytics AS
SELECT
  pt.id as template_id,
  pt.name,
  pt.category,
  pt.usage_count,
  COUNT(DISTINCT p.id) as proposals_created,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'converted') as converted_count,
  CASE
    WHEN COUNT(DISTINCT p.id) > 0
    THEN (COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'converted')::float / COUNT(DISTINCT p.id)) * 100
    ELSE 0
  END as conversion_rate,
  AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/86400.0)
    FILTER (WHERE p.status = 'converted') as avg_days_to_convert
FROM proposal_templates pt
LEFT JOIN proposals p ON p.category = pt.category
GROUP BY pt.id, pt.name, pt.category, pt.usage_count;

CREATE UNIQUE INDEX idx_template_analytics_template ON template_usage_analytics(template_id);

-- ============================================
-- Materialized View: pipeline_value
-- Current pipeline value by status
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS pipeline_value AS
SELECT
  status,
  COUNT(*) as proposal_count,
  AVG(CASE 
    WHEN budget_range = 'under_5k' THEN 2500
    WHEN budget_range = '5k_15k' THEN 10000
    WHEN budget_range = '15k_50k' THEN 32500
    WHEN budget_range = '50k_plus' THEN 75000
    ELSE 0
  END) as avg_estimated_value,
  SUM(CASE 
    WHEN budget_range = 'under_5k' THEN 2500
    WHEN budget_range = '5k_15k' THEN 10000
    WHEN budget_range = '15k_50k' THEN 32500
    WHEN budget_range = '50k_plus' THEN 75000
    ELSE 0
  END) as total_estimated_value
FROM proposals
WHERE status NOT IN ('draft', 'converted', 'rejected')
GROUP BY status;

CREATE UNIQUE INDEX idx_pipeline_value_status ON pipeline_value(status);

-- ============================================
-- Function: Refresh all analytics views
-- ============================================
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY proposal_analytics_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY proposal_funnel_by_month;
  REFRESH MATERIALIZED VIEW CONCURRENTLY category_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY team_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY template_usage_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY pipeline_value;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Get conversion funnel for date range
-- ============================================
CREATE OR REPLACE FUNCTION get_conversion_funnel(
  p_from_date DATE,
  p_to_date DATE
)
RETURNS TABLE (
  stage TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_submitted BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_submitted
  FROM proposals
  WHERE created_at BETWEEN p_from_date AND p_to_date;

  RETURN QUERY
  SELECT 
    'Submitted'::TEXT as stage,
    COUNT(*)::BIGINT as count,
    100.0::NUMERIC as percentage
  FROM proposals
  WHERE created_at BETWEEN p_from_date AND p_to_date
  
  UNION ALL
  
  SELECT 
    'Reviewed'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_submitted > 0 
      THEN (COUNT(*)::NUMERIC / total_submitted) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE created_at BETWEEN p_from_date AND p_to_date
    AND status IN ('under_review', 'in_discussion', 'quoted', 'accepted', 'converted')
  
  UNION ALL
  
  SELECT 
    'Quoted'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_submitted > 0 
      THEN (COUNT(*)::NUMERIC / total_submitted) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE created_at BETWEEN p_from_date AND p_to_date
    AND status IN ('quoted', 'accepted', 'converted')
  
  UNION ALL
  
  SELECT 
    'Accepted'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_submitted > 0 
      THEN (COUNT(*)::NUMERIC / total_submitted) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE created_at BETWEEN p_from_date AND p_to_date
    AND status IN ('accepted', 'converted')
  
  UNION ALL
  
  SELECT 
    'Converted'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_submitted > 0 
      THEN (COUNT(*)::NUMERIC / total_submitted) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE created_at BETWEEN p_from_date AND p_to_date
    AND status = 'converted';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Get aging report
-- ============================================
CREATE OR REPLACE FUNCTION get_aging_report()
RETURNS TABLE (
  days_range TEXT,
  proposal_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM proposals
  WHERE status NOT IN ('draft', 'converted', 'rejected');

  RETURN QUERY
  SELECT 
    '0-7 days'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_count > 0 
      THEN (COUNT(*)::NUMERIC / total_count) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE status NOT IN ('draft', 'converted', 'rejected')
    AND created_at >= now() - interval '7 days'
  
  UNION ALL
  
  SELECT 
    '8-14 days'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_count > 0 
      THEN (COUNT(*)::NUMERIC / total_count) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE status NOT IN ('draft', 'converted', 'rejected')
    AND created_at BETWEEN now() - interval '14 days' AND now() - interval '7 days'
  
  UNION ALL
  
  SELECT 
    '15-30 days'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_count > 0 
      THEN (COUNT(*)::NUMERIC / total_count) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE status NOT IN ('draft', 'converted', 'rejected')
    AND created_at BETWEEN now() - interval '30 days' AND now() - interval '14 days'
  
  UNION ALL
  
  SELECT 
    '31+ days'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN total_count > 0 
      THEN (COUNT(*)::NUMERIC / total_count) * 100 
      ELSE 0 
    END
  FROM proposals
  WHERE status NOT IN ('draft', 'converted', 'rejected')
    AND created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Grant permissions
-- ============================================
GRANT SELECT ON proposal_analytics_summary TO authenticated;
GRANT SELECT ON proposal_funnel_by_month TO authenticated;
GRANT SELECT ON category_performance TO authenticated;
GRANT SELECT ON team_performance TO authenticated;
GRANT SELECT ON template_usage_analytics TO authenticated;
GRANT SELECT ON pipeline_value TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversion_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION get_aging_report TO authenticated;