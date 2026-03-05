import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Cloud,
  Smartphone,
  Globe,
  Layout,
  FileText,
  Check,
  ChevronRight,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import type { ProposalTemplate } from '@/types/templates';

interface TemplateCardProps {
  template: ProposalTemplate;
  onSelect?: (template: ProposalTemplate) => void;
  selected?: boolean;
  showDetails?: boolean;
  className?: string;
}

const iconMap: Record<string, typeof FileText> = {
  'shopping-cart': ShoppingCart,
  'cloud': Cloud,
  'smartphone': Smartphone,
  'globe': Globe,
  'layout': Layout,
  'file-text': FileText,
  'bar-chart': BarChart3,
  'graduation-cap': GraduationCap,
};

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:border-emerald-300',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:border-indigo-300',
  purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:border-purple-300',
  blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300',
  amber: 'bg-amber-50 border-amber-200 text-amber-600 hover:border-amber-300',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:border-cyan-300',
  red: 'bg-red-50 border-red-200 text-red-600 hover:border-red-300',
  gray: 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300',
};

const categoryLabels: Record<string, string> = {
  web_app: 'Web Application',
  mobile_app: 'Mobile Application',
  ecommerce: 'E-Commerce',
  saas: 'SaaS Platform',
  other: 'Other',
};

const timelineLabels: Record<string, string> = {
  '1_month': '1 Month',
  '1_3_months': '1-3 Months',
  '3_6_months': '3-6 Months',
  '6_plus': '6+ Months',
  flexible: 'Flexible',
};

export function TemplateCard({
  template,
  onSelect,
  selected = false,
  showDetails = true,
  className,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = iconMap[template.icon] || FileText;
  const colorClass = colorMap[template.color] || colorMap.blue;

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        colorClass,
        selected && 'ring-2 ring-offset-2 ring-admin-primary',
        isHovered && 'shadow-md scale-[1.02]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(template)}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-admin-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            'bg-white/50'
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold line-clamp-1">
              {template.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1 text-xs">
              {categoryLabels[template.category] || template.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <CardDescription className="text-sm line-clamp-2 mb-3">
            {template.description}
          </CardDescription>
          
          <div className="space-y-2 text-xs">
            {template.suggested_timeline && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Timeline:</span>
                <span>{timelineLabels[template.suggested_timeline]}</span>
              </div>
            )}
            
            {template.questions.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Guided Questions:</span>
                <span>{template.questions.length}</span>
              </div>
            )}
          </div>
          
          {onSelect && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 group"
            >
              Use Template
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function TemplateCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </CardContent>
    </Card>
  );
}