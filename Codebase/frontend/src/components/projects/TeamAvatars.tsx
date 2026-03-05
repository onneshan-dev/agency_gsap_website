import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  initials: string;
  color: string;
}

interface TeamAvatarsProps {
  members: TeamMember[];
  maxVisible?: number;
  className?: string;
}

export function TeamAvatars({
  members,
  maxVisible = 3,
  className,
}: TeamAvatarsProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <div className={cn('flex flex-row-reverse items-center', className)}>
      {remainingCount > 0 && (
        <div className="w-[28px] h-[28px] rounded-full bg-[#F3F4F6] border-2 border-white flex items-center justify-center text-[10px] font-semibold text-[#6B7280] z-0">
          +{remainingCount}
        </div>
      )}
      {visibleMembers.map((member, index) => (
        <div
          key={member.id}
          className={cn(
            'w-[28px] h-[28px] rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white',
            member.color
          )}
          style={{
            marginRight: index < visibleMembers.length - 1 || remainingCount > 0 ? '-8px' : '0',
            zIndex: index + 1,
          }}
        >
          {member.initials}
        </div>
      ))}
    </div>
  );
}

export type { TeamMember };
