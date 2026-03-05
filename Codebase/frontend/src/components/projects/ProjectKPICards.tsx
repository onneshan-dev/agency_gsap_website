import { Loader, CircleCheck, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICard {
  id: string;
  value: number;
  label: string;
  icon: 'loader' | 'circle-check' | 'triangle-alert';
  bgColor: string;
  iconColor: string;
}

interface ProjectKPICardsProps {
  cards: KPICard[];
  className?: string;
}

const iconMap = {
  loader: Loader,
  'circle-check': CircleCheck,
  'triangle-alert': TriangleAlert,
};

export function ProjectKPICards({ cards, className }: ProjectKPICardsProps) {
  return (
    <div className={cn('flex gap-2.5', className)}>
      {cards.map((card) => {
        const Icon = iconMap[card.icon];
        return (
          <div
            key={card.id}
            className="flex-1 bg-white border border-[#E5E3DE] rounded-[12px] p-3.5 flex flex-col gap-1.5"
          >
            <div
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                card.bgColor
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', card.iconColor)} />
            </div>
            <span className="text-[22px] font-bold text-[#1A1A1E]">{card.value}</span>
            <span className="text-[11px] text-[#9A9AA0]">{card.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export type { KPICard };
