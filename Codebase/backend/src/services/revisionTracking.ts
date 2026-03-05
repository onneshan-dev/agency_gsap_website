import { supabaseAdmin } from '../config/supabase.js';

export interface RevisionEntry {
  id?: string;
  proposal_id: string;
  revision_number: number;
  changed_by: string;
  change_type: 'status_change' | 'content_edit' | 'quote_update' | 'admin_notes' | 'document_upload' | 'initial';
  changed_fields: string[];
  previous_values: Record<string, any>;
  new_values: Record<string, any>;
  change_reason?: string;
  snapshot: Record<string, any>;
  created_at?: string;
}

/**
 * Create a new revision entry for a proposal
 */
export async function createRevision(
  proposalId: string,
  changedBy: string,
  changeType: RevisionEntry['change_type'],
  before: Record<string, any>,
  after: Record<string, any>,
  changeReason?: string
): Promise<RevisionEntry | null> {
  try {
    // Get the next revision number
    const { data: maxRev } = await supabaseAdmin
      .from('proposal_revisions')
      .select('revision_number')
      .eq('proposal_id', proposalId)
      .order('revision_number', { ascending: false })
      .limit(1)
      .single();

    const newRevisionNumber = (maxRev?.revision_number || 0) + 1;

    // Determine which fields changed
    const changedFields = Object.keys(after).filter(
      key => JSON.stringify(before[key]) !== JSON.stringify(after[key])
    );

    // Create revision entry
    const revision: Partial<RevisionEntry> = {
      proposal_id: proposalId,
      revision_number: newRevisionNumber,
      changed_by: changedBy,
      change_type: changeType,
      changed_fields: changedFields,
      previous_values: Object.fromEntries(
        changedFields.map(f => [f, before[f]])
      ),
      new_values: Object.fromEntries(
        changedFields.map(f => [f, after[f]])
      ),
      change_reason: changeReason,
      snapshot: after,
    };

    const { data, error } = await supabaseAdmin
      .from('proposal_revisions')
      .insert(revision)
      .select()
      .single();

    if (error) {
      console.error('Error creating revision:', error);
      return null;
    }

    // Update the proposal's current revision number
    await supabaseAdmin
      .from('proposals')
      .update({ current_revision_number: newRevisionNumber })
      .eq('id', proposalId);

    return data;
  } catch (error) {
    console.error('Exception in createRevision:', error);
    return null;
  }
}

/**
 * Get all revisions for a proposal
 */
export async function getProposalRevisions(
  proposalId: string,
  options?: { limit?: number; offset?: number }
): Promise<RevisionEntry[]> {
  try {
    let query = supabaseAdmin
      .from('proposal_revision_history')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('revision_number', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching revisions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getProposalRevisions:', error);
    return [];
  }
}

/**
 * Get a specific revision
 */
export async function getRevision(
  proposalId: string,
  revisionNumber: number
): Promise<RevisionEntry | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_revision_history')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('revision_number', revisionNumber)
      .single();

    if (error) {
      console.error('Error fetching revision:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getRevision:', error);
    return null;
  }
}

/**
 * Compare two revisions
 */
export async function compareRevisions(
  proposalId: string,
  fromRevision: number,
  toRevision: number
): Promise<{ field_name: string; old_value: any; new_value: any }[] | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc('compare_revisions', {
      p_proposal_id: proposalId,
      p_from_revision: fromRevision,
      p_to_revision: toRevision,
    });

    if (error) {
      // Fallback: manual comparison
      const [fromRev, toRev] = await Promise.all([
        getRevision(proposalId, fromRevision),
        getRevision(proposalId, toRevision),
      ]);

      if (!fromRev || !toRev) return null;

      const differences: { field_name: string; old_value: any; new_value: any }[] = [];
      const allKeys = new Set([
        ...Object.keys(fromRev.snapshot || {}),
        ...Object.keys(toRev.snapshot || {}),
      ]);

      allKeys.forEach(key => {
        const oldVal = fromRev.snapshot?.[key];
        const newVal = toRev.snapshot?.[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          differences.push({
            field_name: key,
            old_value: oldVal,
            new_value: newVal,
          });
        }
      });

      return differences;
    }

    return data;
  } catch (error) {
    console.error('Exception in compareRevisions:', error);
    return null;
  }
}

/**
 * Track status change with revision
 */
export async function trackStatusChangeRevision(
  proposalId: string,
  changedBy: string,
  oldStatus: string,
  newStatus: string,
  fullProposal: Record<string, any>,
  changeReason?: string
): Promise<RevisionEntry | null> {
  return createRevision(
    proposalId,
    changedBy,
    'status_change',
    { status: oldStatus },
    fullProposal,
    changeReason || `Status changed from ${oldStatus} to ${newStatus}`
  );
}

/**
 * Track content edit with revision
 */
export async function trackContentEdit(
  proposalId: string,
  changedBy: string,
  before: Record<string, any>,
  after: Record<string, any>,
  changeReason?: string
): Promise<RevisionEntry | null> {
  return createRevision(
    proposalId,
    changedBy,
    'content_edit',
    before,
    after,
    changeReason
  );
}

/**
 * Track admin notes change
 */
export async function trackAdminNotesChange(
  proposalId: string,
  changedBy: string,
  oldNotes: string | null,
  newNotes: string,
  fullProposal: Record<string, any>
): Promise<RevisionEntry | null> {
  return createRevision(
    proposalId,
    changedBy,
    'admin_notes',
    { admin_notes: oldNotes },
    fullProposal,
    'Admin notes updated'
  );
}

/**
 * Track quote update
 */
export async function trackQuoteUpdate(
  proposalId: string,
  changedBy: string,
  before: Record<string, any>,
  after: Record<string, any>,
  changeReason?: string
): Promise<RevisionEntry | null> {
  return createRevision(
    proposalId,
    changedBy,
    'quote_update',
    before,
    after,
    changeReason || 'Quote updated'
  );
}

/**
 * Get the latest revision number for a proposal
 */
export async function getCurrentRevisionNumber(proposalId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('current_revision_number')
      .eq('id', proposalId)
      .single();

    if (error || !data) return 1;
    return data.current_revision_number || 1;
  } catch (error) {
    console.error('Error getting current revision number:', error);
    return 1;
  }
}

/**
 * Revert to a specific revision (creates a new revision with old values)
 */
export async function revertToRevision(
  proposalId: string,
  revisionNumber: number,
  changedBy: string,
  reason?: string
): Promise<boolean> {
  try {
    // Get the revision to revert to
    const targetRevision = await getRevision(proposalId, revisionNumber);
    if (!targetRevision) return false;

    // Get current proposal state
    const { data: currentProposal, error: fetchError } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (fetchError || !currentProposal) return false;

    // Create a revert revision
    await createRevision(
      proposalId,
      changedBy,
      'content_edit',
      currentProposal,
      targetRevision.snapshot,
      reason || `Reverted to revision ${revisionNumber}`
    );

    return true;
  } catch (error) {
    console.error('Error reverting to revision:', error);
    return false;
  }
}