import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types/supabase';
import { toast } from 'sonner';
import { Loader2, DollarSign, Calendar, FileText } from 'lucide-react';

interface ConvertToProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Profile;
  onSuccess: () => void;
}

export const ConvertToProjectDialog: React.FC<ConvertToProjectDialogProps> = ({
  isOpen,
  onClose,
  proposal,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: proposal.project_description || '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          client_id: proposal.id,
          status: 'planning',
          progress: 0,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // 2. Create a project update to notify the client
      const { error: updateError } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectData.id,
          title: 'Project Proposal Accepted! 🎉',
          content: `Your project proposal has been reviewed and accepted. Welcome aboard! We've created your project "${formData.name}" and will begin planning soon. You can track progress here in your client dashboard.`,
          created_by: proposal.id, // System message from client's own ID
        });

      if (updateError) {
        console.error('Error creating notification:', updateError);
        // Don't fail the whole operation if notification fails
      }

      // 3. Optionally clear the project_description from profile to indicate it's been processed
      // (Keep it for record-keeping purposes)

      toast.success('Project created successfully! Client has been notified.');
      onSuccess();
    } catch (error) {
      console.error('Error converting proposal:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-surface border-admin-border">
        <DialogHeader>
          <DialogTitle className="text-admin-text-primary flex items-center gap-2">
            <FileText size={18} />
            Convert Proposal to Project
          </DialogTitle>
          <DialogDescription className="text-admin-text-secondary">
            Create a new project for {proposal.full_name || proposal.email}. 
            The client will be notified automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-admin-text-primary">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., E-commerce Website Redesign"
              className="bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-admin-text-primary">
              Project Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project scope and requirements..."
              rows={4}
              className="bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted resize-none"
            />
            <p className="text-xs text-admin-text-muted">
              Pre-filled from client's proposal. You can edit as needed.
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-admin-text-primary">
              Budget (USD)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" size={16} />
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000"
                className="pl-10 bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-admin-text-primary flex items-center gap-1.5">
                <Calendar size={14} />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-admin-bg border-admin-border text-admin-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-admin-text-primary flex items-center gap-1.5">
                <Calendar size={14} />
                Target End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-admin-bg border-admin-border text-admin-text-primary"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-admin-border text-admin-text-secondary hover:bg-admin-bg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
