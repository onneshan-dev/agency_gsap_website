import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { uploadMultipleFiles } from '@/lib/r2/upload';
import { AdminLayout } from '@/components/layout/AdminLayout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  FileText,
  ArrowLeft,
  Send,
  Briefcase,
  DollarSign,
  Clock,
  Tag,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'web_app', label: 'Web Application' },
  { value: 'mobile_app', label: 'Mobile Application' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'saas', label: 'SaaS Platform' },
  { value: 'other', label: 'Other' },
];

const BUDGET_RANGES = [
  { value: 'under_5k', label: 'Under $5,000' },
  { value: '5k_15k', label: '$5,000 – $15,000' },
  { value: '15k_50k', label: '$15,000 – $50,000' },
  { value: '50k_plus', label: '$50,000+' },
  { value: 'not_sure', label: 'Not Sure Yet' },
];

const TIMELINES = [
  { value: '1_month', label: '1 Month' },
  { value: '1_3_months', label: '1 – 3 Months' },
  { value: '3_6_months', label: '3 – 6 Months' },
  { value: '6_plus', label: '6+ Months' },
  { value: 'flexible', label: 'Flexible' },
];

export default function NewProposal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timelinePreference, setTimelinePreference] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedFiles: { name: string; url: string; key: string }[] = [];

      if (files.length > 0) {
        toast.info('Uploading documents...');
        const results = await uploadMultipleFiles(files, `proposals/${user.id}`);

        uploadedFiles = results
          .filter((r) => r.success)
          .map((r) => ({
            name: r.key.split('/').pop() || '',
            url: r.url,
            key: r.key,
          }));

        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          toast.warning(`${failed.length} file(s) failed to upload`);
        }
      }

      await api.post('/api/proposals', {
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        budget_range: budgetRange || null,
        timeline_preference: timelinePreference || null,
        documents: uploadedFiles.length > 0 ? uploadedFiles : null,
      });

      toast.success('Proposal submitted successfully!');
      navigate('/client/dashboard');
    } catch (err) {
      console.error('Proposal submission error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-admin-border text-admin-text-secondary hover:bg-admin-surface transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">New Proposal</h1>
            <p className="text-sm text-admin-text-secondary mt-0.5">
              Tell us about your project and we'll get back to you with a quote.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-admin-surface border border-admin-border rounded-xl divide-y divide-admin-border">
            {/* Title & Description */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-admin-primary" />
                <h2 className="text-base font-semibold text-admin-text-primary">
                  Project Details
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-admin-text-primary">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. E-commerce Platform for Fashion Brand"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-11 bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted rounded-lg focus:ring-admin-primary/20 focus:border-admin-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-admin-text-primary">
                  Project Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project goals, target audience, key features, and any specific requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={6}
                  className="bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted rounded-lg resize-none focus:ring-admin-primary/20 focus:border-admin-primary"
                />
              </div>
            </div>

            {/* Category, Budget, Timeline */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={16} className="text-admin-primary" />
                <h2 className="text-base font-semibold text-admin-text-primary">
                  Project Preferences
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-admin-text-primary flex items-center gap-1.5">
                    <Tag size={13} />
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                    <SelectTrigger className="w-full h-11 bg-admin-bg border-admin-border text-admin-text-primary rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-admin-text-primary flex items-center gap-1.5">
                    <DollarSign size={13} />
                    Budget Range
                  </Label>
                  <Select value={budgetRange} onValueChange={setBudgetRange} disabled={isSubmitting}>
                    <SelectTrigger className="w-full h-11 bg-admin-bg border-admin-border text-admin-text-primary rounded-lg">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-admin-text-primary flex items-center gap-1.5">
                    <Clock size={13} />
                    Timeline
                  </Label>
                  <Select value={timelinePreference} onValueChange={setTimelinePreference} disabled={isSubmitting}>
                    <SelectTrigger className="w-full h-11 bg-admin-bg border-admin-border text-admin-text-primary rounded-lg">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-admin-primary" />
                <h2 className="text-base font-semibold text-admin-text-primary">
                  Supporting Documents
                </h2>
              </div>
              <p className="text-sm text-admin-text-muted">
                Upload wireframes, specs, reference designs, or any other relevant files.
              </p>
              <FileUpload
                files={files}
                onFilesSelected={setFiles}
                onFileRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="h-11 px-6 border-admin-border text-admin-text-secondary hover:bg-admin-bg rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="h-11 px-6 bg-admin-primary text-white hover:bg-admin-primary/90 rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
