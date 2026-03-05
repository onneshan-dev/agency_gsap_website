-- Migration: Proposal Templates
-- Created: 2026-03-05

-- ============================================
-- Table: proposal_templates
-- Stores reusable proposal templates for clients
-- ============================================
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'web_app', 'mobile_app', 'ecommerce', 'saas', 'other'
  icon VARCHAR(50) DEFAULT 'file-text', -- Lucide icon name
  color VARCHAR(50) DEFAULT 'blue', -- Theme color
  
  -- Default values for proposals created from this template
  default_title VARCHAR(200),
  default_description TEXT,
  suggested_timeline VARCHAR(50),
  
  -- Guided questions to help clients fill out the proposal
  questions JSONB DEFAULT '[]'::jsonb,
  
  -- Suggested documents checklist
  document_checklist JSONB DEFAULT '[]'::jsonb,
  
  -- Template metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  
  -- Tracking
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments
COMMENT ON TABLE proposal_templates IS 'Reusable proposal templates with guided questions';
COMMENT ON COLUMN proposal_templates.questions IS 'Array of guided questions with type, required, etc.';
COMMENT ON COLUMN proposal_templates.document_checklist IS 'Array of suggested document types';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposal_templates_category 
  ON proposal_templates(category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_proposal_templates_active 
  ON proposal_templates(is_active, sort_order);

-- ============================================
-- Function: Update timestamp trigger
-- ============================================
DROP TRIGGER IF EXISTS update_proposal_templates_updated_at ON proposal_templates;
CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON proposal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Insert default templates
-- ============================================
INSERT INTO proposal_templates (
  name,
  description,
  category,
  icon,
  color,
  default_title,
  default_description,
  suggested_timeline,
  questions,
  document_checklist,
  sort_order
) VALUES
(
  'E-Commerce Website',
  'Online store with product catalog, shopping cart, and payment integration',
  'ecommerce',
  'shopping-cart',
  'emerald',
  'E-Commerce Website Development',
  'I need an e-commerce website to sell products online. The site should include product listings, shopping cart functionality, secure checkout, and payment gateway integration.',
  '1_3_months',
  '[
    {"id": "1", "question": "How many products do you plan to sell?", "type": "number", "required": true},
    {"id": "2", "question": "Do you need inventory management?", "type": "boolean", "required": false},
    {"id": "3", "question": "Which payment methods do you need?", "type": "checkbox", "options": ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"], "required": true},
    {"id": "4", "question": "Do you need multi-currency support?", "type": "boolean", "required": false},
    {"id": "5", "question": "Do you have existing product photos/descriptions?", "type": "select", "options": ["Yes, all ready", "Partially ready", "Need help creating"], "required": true}
  ]'::jsonb,
  '["Brand guidelines", "Product photos", "Product descriptions", "Logo files"]'::jsonb,
  1
),
(
  'SaaS Platform',
  'Software as a Service web application with user management and subscriptions',
  'saas',
  'cloud',
  'indigo',
  'SaaS Platform Development',
  'I want to build a SaaS platform that provides software services to users through a subscription model. The platform needs user authentication, dashboard, and subscription management.',
  '3_6_months',
  '[
    {"id": "1", "question": "What is the core functionality of your SaaS?", "type": "textarea", "required": true},
    {"id": "2", "question": "Do you need multi-tenant architecture?", "type": "boolean", "required": true},
    {"id": "3", "question": "What subscription tiers do you plan?", "type": "checkbox", "options": ["Free", "Basic", "Pro", "Enterprise"], "required": true},
    {"id": "4", "question": "Do you need API access for integrations?", "type": "boolean", "required": false},
    {"id": "5", "question": "What is your target launch date?", "type": "date", "required": false}
  ]'::jsonb,
  '["Technical specifications", "User flow diagrams", "Mockups or wireframes"]'::jsonb,
  2
),
(
  'Mobile Application',
  'Native or cross-platform mobile app for iOS and Android',
  'mobile_app',
  'smartphone',
  'purple',
  'Mobile App Development',
  'I need a mobile application for iOS and/or Android platforms. The app should provide specific functionality to users on their mobile devices.',
  '3_6_months',
  '[
    {"id": "1", "question": "Which platforms do you need?", "type": "checkbox", "options": ["iOS", "Android", "Both"], "required": true},
    {"id": "2", "question": "Do you need offline functionality?", "type": "boolean", "required": false},
    {"id": "3", "question": "Will you need push notifications?", "type": "boolean", "required": false},
    {"id": "4", "question": "Do you have app designs/mockups?", "type": "select", "options": ["Yes, complete designs", "Partial designs", "Need design service"], "required": true},
    {"id": "5", "question": "Does the app need to integrate with backend services?", "type": "boolean", "required": true}
  ]'::jsonb,
  '["App designs/mockups", "App store accounts", "Brand assets"]'::jsonb,
  3
),
(
  'Web Application',
  'Custom web application with specific business logic and features',
  'web_app',
  'globe',
  'blue',
  'Custom Web Application',
  'I need a custom web application to solve a specific business problem. The application will have unique features tailored to my requirements.',
  '3_6_months',
  '[
    {"id": "1", "question": "What problem does your web app solve?", "type": "textarea", "required": true},
    {"id": "2", "question": "Who are your target users?", "type": "text", "required": true},
    {"id": "3", "question": "Do you need user authentication?", "type": "boolean", "required": true},
    {"id": "4", "question": "Do you need admin dashboard?", "type": "boolean", "required": false},
    {"id": "5", "question": "What are your key features?", "type": "textarea", "required": true}
  ]'::jsonb,
  '["Requirements document", "User stories", "Wireframes or mockups"]'::jsonb,
  4
),
(
  'Portfolio/Company Website',
  'Professional website to showcase your work or business',
  'web_app',
  'layout',
  'amber',
  'Portfolio Website',
  'I need a professional website to showcase my work/portfolio or represent my company online. The site should be modern, responsive, and SEO-friendly.',
  '1_month',
  '[
    {"id": "1", "question": "What type of content will you display?", "type": "checkbox", "options": ["Images/Photos", "Videos", "Text/Articles", "Products/Services", "Case Studies"], "required": true},
    {"id": "2", "question": "Do you need a blog?", "type": "boolean", "required": false},
    {"id": "3", "question": "Do you need contact forms?", "type": "boolean", "required": true},
    {"id": "4", "question": "Do you have content ready?", "type": "select", "options": ["Yes, all content ready", "Partially ready", "Need content creation help"], "required": true}
  ]'::jsonb,
  '["Logo files", "Brand colors/fonts", "Content/copy", "Images/photos"]'::jsonb,
  5
),
(
  'Learning Management System (LMS)',
  'Online learning platform with courses, quizzes, progress tracking, and student management',
  'web_app',
  'graduation-cap',
  'cyan',
  'Learning Management System Development',
  'I need a learning management system to deliver online courses and training. The platform should support course creation, student enrollment, progress tracking, quizzes/assessments, and certificates.',
  '3_6_months',
  '[
    {"id": "1", "question": "What types of content will you deliver?", "type": "checkbox", "options": ["Video lessons", "Text content", "PDFs/Documents", "Quizzes", "Assignments", "Live classes"], "required": true},
    {"id": "2", "question": "How many courses do you plan to offer initially?", "type": "number", "required": true},
    {"id": "3", "question": "Do you need student progress tracking and analytics?", "type": "boolean", "required": true},
    {"id": "4", "question": "Do you need certificate generation?", "type": "boolean", "required": false},
    {"id": "5", "question": "Do you need discussion forums or community features?", "type": "boolean", "required": false},
    {"id": "6", "question": "Will you sell courses or offer them for free?", "type": "select", "options": ["Paid only", "Free only", "Both free and paid"], "required": true}
  ]'::jsonb,
  '["Course content outline", "Video/content samples", "Branding materials", "Certificate designs"]',
  6
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Function: Increment template usage count
-- ============================================
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE proposal_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ language 'plpgsql';