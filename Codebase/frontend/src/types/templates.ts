export interface TemplateQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'checkbox' | 'date' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'web_app' | 'mobile_app' | 'ecommerce' | 'saas' | 'other';
  icon: string;
  color: string;
  default_title?: string;
  default_description?: string;
  suggested_timeline?: '1_month' | '1_3_months' | '3_6_months' | '6_plus' | 'flexible';
  questions: TemplateQuestion[];
  document_checklist: string[];
  is_active: boolean;
  sort_order: number;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateFormData {
  title: string;
  description: string;
  category: string;
  budget_range: string;
  timeline_preference: string;
  answers: Record<string, string | string[] | boolean | number>;
  documents?: File[];
}