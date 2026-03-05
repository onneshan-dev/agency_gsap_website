import { supabaseAdmin } from '../config/supabase.js';

export interface StatusDurationEntry {
  id?: string;
  proposal_id: string;
  status: string;
  entered_at: string;
  exited_at?: string;
  duration_seconds?: number;
  assigned_to?: string | null;
  sla_target_hours?: number | null;
  sla_met?: boolean | null;
  notes?: string | null;
}

/**
 * Start tracking a new status duration for a proposal
 * Called when proposal status changes or is created
 */
export async function startStatusTracking(
  proposalId: string,
  status: string,
  assignedTo?: string | null,
  notes?: string
): Promise<StatusDurationEntry | null> {
  try {
    // Get SLA config for this status
    const { data: slaConfig } = await supabaseAdmin
      .from('sla_config')
      .select('target_hours')
      .eq('status', status)
      .eq('is_active', true)
      .single();

    const entry: Partial<StatusDurationEntry> = {
      proposal_id: proposalId,
      status,
      entered_at: new Date().toISOString(),
      assigned_to: assignedTo || null,
      sla_target_hours: slaConfig?.target_hours || null,
      notes: notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from('proposal_status_durations')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Error starting status tracking:', error);
      return null;
    }

    // Update the proposal with current status tracking info
    await supabaseAdmin
      .from('proposals')
      .update({
        current_status_entered_at: entry.entered_at,
        current_status_assigned_to: assignedTo || null,
      })
      .eq('id', proposalId);

    return data;
  } catch (error) {
    console.error('Exception in startStatusTracking:', error);
    return null;
  }
}

/**
 * End tracking for the current status of a proposal
 * Called before changing to a new status
 */
export async function endStatusTracking(
  proposalId: string,
  exitNotes?: string
): Promise<StatusDurationEntry | null> {
  try {
    // Find the active duration entry (one without exited_at)
    const { data: activeEntry, error: findError } = await supabaseAdmin
      .from('proposal_status_durations')
      .select('*')
      .eq('proposal_id', proposalId)
      .is('exited_at', null)
      .single();

    if (findError || !activeEntry) {
      console.warn('No active status tracking found for proposal:', proposalId);
      return null;
    }

    const exitedAt = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('proposal_status_durations')
      .update({
        exited_at: exitedAt,
        notes: exitNotes ? `${activeEntry.notes || ''} | Exit: ${exitNotes}`.trim() : activeEntry.notes,
      })
      .eq('id', activeEntry.id)
      .select()
      .single();

    if (error) {
      console.error('Error ending status tracking:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in endStatusTracking:', error);
    return null;
  }
}

/**
 * Handle complete status transition - end current + start new
 */
export async function trackStatusChange(
  proposalId: string,
  newStatus: string,
  assignedTo?: string | null,
  changeReason?: string
): Promise<boolean> {
  try {
    // End current tracking
    await endStatusTracking(proposalId, `Changed to ${newStatus}`);
    
    // Start new tracking
    await startStatusTracking(proposalId, newStatus, assignedTo, changeReason);
    
    return true;
  } catch (error) {
    console.error('Error tracking status change:', error);
    return false;
  }
}

/**
 * Get SLA status for a proposal
 */
export async function getProposalSLAStatus(proposalId: string): Promise<{
  status: string;
  hours_in_status: number;
  sla_target_hours: number | null;
  sla_status: 'on_track' | 'warning' | 'breached' | 'no_sla';
  hours_remaining: number | null;
} | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_sla_status')
      .select('*')
      .eq('proposal_id', proposalId)
      .single();

    if (error || !data) return null;

    return {
      status: data.status,
      hours_in_status: parseFloat(data.hours_in_status),
      sla_target_hours: data.sla_target_hours,
      sla_status: data.sla_status,
      hours_remaining: parseFloat(data.hours_remaining),
    };
  } catch (error) {
    console.error('Error getting SLA status:', error);
    return null;
  }
}

/**
 * Get full timeline of status changes for a proposal
 */
export async function getProposalTimeline(proposalId: string): Promise<StatusDurationEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_status_durations')
      .select(`
        *,
        assigned_to_profile:profiles!proposal_status_durations_assigned_to_fkey(full_name, email, avatar_url)
      `)
      .eq('proposal_id', proposalId)
      .order('entered_at', { ascending: true });

    if (error) {
      console.error('Error fetching proposal timeline:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getProposalTimeline:', error);
    return [];
  }
}

/**
 * Get proposals at risk of SLA breach
 */
export async function getProposalsAtRisk(limit: number = 20): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_sla_status')
      .select(`
        *,
        proposals:proposal_id(
          id, title, client_id, status,
          client:profiles!proposals_client_id_fkey(full_name, email)
        )
      `)
      .in('sla_status', ['warning', 'breached'])
      .order('hours_remaining', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching proposals at risk:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getProposalsAtRisk:', error);
    return [];
  }
}

/**
 * Get SLA configuration
 */
export async function getSLAConfig(): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sla_config')
      .select('*')
      .eq('is_active', true)
      .order('status');

    if (error) {
      console.error('Error fetching SLA config:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getSLAConfig:', error);
    return [];
  }
}

/**
 * Update SLA configuration
 */
export async function updateSLAConfig(
  status: string,
  updates: { target_hours?: number; warning_threshold_hours?: number; is_active?: boolean }
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('sla_config')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('status', status);

    if (error) {
      console.error('Error updating SLA config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in updateSLAConfig:', error);
    return false;
  }
}

/**
 * Initialize tracking for existing proposals (migration helper)
 * Call this once when deploying to track existing proposals
 */
export async function initializeTrackingForExistingProposals(): Promise<void> {
  try {
    // Find proposals without current_status_entered_at
    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select('id, status, created_at, updated_at')
      .is('current_status_entered_at', null);

    if (error || !proposals || proposals.length === 0) return;

    console.log(`Initializing tracking for ${proposals.length} existing proposals...`);

    for (const proposal of proposals) {
      // Start tracking from the updated_at time
      await startStatusTracking(
        proposal.id,
        proposal.status,
        null,
        'Auto-initialized on system upgrade'
      );
    }

    console.log('Tracking initialization complete');
  } catch (error) {
    console.error('Error initializing tracking:', error);
  }
}