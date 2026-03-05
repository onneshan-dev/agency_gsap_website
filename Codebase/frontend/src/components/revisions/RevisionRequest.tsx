import { useState, useRef } from 'react';
import { Paperclip, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface RevisionRequestProps {
  projectId: string;
  milestoneId?: string;
  deliverableId?: string;
  onSubmitted?: () => void;
}

interface AttachedFile {
  file: File;
  preview?: string;
}

export default function RevisionRequest({
  projectId,
  milestoneId,
  deliverableId,
  onSubmitted,
}: RevisionRequestProps) {
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please describe the revision you need');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData: Record<string, unknown> = {
        description: description.trim(),
        ...(milestoneId && { milestone_id: milestoneId }),
        ...(deliverableId && { deliverable_id: deliverableId }),
      };

      if (attachments.length > 0) {
        const uploadedUrls: string[] = [];
        for (const att of attachments) {
          const fd = new FormData();
          fd.append('file', att.file);
          const result = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`,
            { method: 'POST', body: fd }
          );
          if (result.ok) {
            const data = await result.json();
            uploadedUrls.push(data.url);
          }
        }
        if (uploadedUrls.length > 0) {
          formData.attachments = uploadedUrls;
        }
      }

      await api.post(`/api/projects/${projectId}/revisions`, formData);

      toast.success('Revision request submitted');
      setDescription('');
      attachments.forEach((att) => {
        if (att.preview) URL.revokeObjectURL(att.preview);
      });
      setAttachments([]);
      onSubmitted?.();
    } catch (err) {
      console.error('Failed to submit revision:', err);
      toast.error('Failed to submit revision request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="revision-description"
          className="text-sm font-medium text-[var(--admin-text-primary)]"
        >
          What needs to be revised?
        </Label>
        <Textarea
          id="revision-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the changes you'd like made..."
          required
          disabled={isSubmitting}
          className="min-h-[120px] border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)]"
        />
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="group relative flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2"
              >
                {att.preview ? (
                  <img
                    src={att.preview}
                    alt={att.file.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <Paperclip className="h-4 w-4 text-[var(--admin-text-muted)]" />
                )}
                <span className="text-xs text-[var(--admin-text-secondary)] max-w-[120px] truncate">
                  {att.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="ml-1 rounded-full p-0.5 text-[var(--admin-text-muted)] hover:bg-[var(--admin-border)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting}
        >
          <Paperclip className="h-3.5 w-3.5 mr-1.5" />
          Attach files
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !description.trim()}
          className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Submit Revision
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
