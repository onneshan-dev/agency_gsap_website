import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TemplateGallery } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import type { ProposalTemplate } from '@/types/templates';

export default function TemplateSelection() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);

  const handleContinue = () => {
    if (selectedTemplate) {
      navigate('/client/proposals/new', { state: { template: selectedTemplate } });
    }
  };

  const handleSkip = () => {
    navigate('/client/proposals/new');
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-admin-primary/10 text-admin-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Quick Start
          </div>
          <h1 className="text-3xl font-bold text-admin-text-primary">
            Choose a Project Template
          </h1>
          <p className="text-admin-text-secondary max-w-2xl mx-auto">
            Select a template that best matches your project type. We'll pre-fill the proposal 
            with relevant details and guide you through the process with targeted questions.
          </p>
        </div>

        {/* Template Gallery */}
        <TemplateGallery
          onSelectTemplate={setSelectedTemplate}
          selectedTemplateId={selectedTemplate?.id}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            <FileText className="w-4 h-4 mr-2" />
            Start from Scratch
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90"
          >
            Continue with Template
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Selected Template Preview */}
        {selectedTemplate && (
          <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
            <h3 className="font-semibold text-admin-text-primary mb-2">
              Selected: {selectedTemplate.name}
            </h3>
            <p className="text-sm text-admin-text-secondary mb-4">
              {selectedTemplate.description}
            </p>
            
            {selectedTemplate.questions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-text-primary">
                  You'll answer {selectedTemplate.questions.length} guided questions:
                </p>
                <ul className="text-sm text-admin-text-secondary space-y-1">
                  {selectedTemplate.questions.slice(0, 3).map((q) => (
                    <li key={q.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-admin-primary" />
                      {q.question}
                    </li>
                  ))}
                  {selectedTemplate.questions.length > 3 && (
                    <li className="text-admin-primary">
                      +{selectedTemplate.questions.length - 3} more questions
                    </li>
                  )}
                </ul>
              </div>
            )}

            {selectedTemplate.document_checklist.length > 0 && (
              <div className="mt-4 pt-4 border-t border-admin-border">
                <p className="text-sm font-medium text-admin-text-primary mb-2">
                  Suggested documents to prepare:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.document_checklist.map((doc) => (
                    <span
                      key={doc}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}