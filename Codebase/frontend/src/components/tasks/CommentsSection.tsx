import { useState } from 'react';
import { MessageCircle, SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  author: {
    name: string;
    initials: string;
    color: string;
  };
  content: string;
  timestamp: string;
  isLatest?: boolean;
  bubbleColor?: 'bg-[#FEF3C7]' | 'bg-[#F0FDF4]' | 'bg-[#F1F5F9]';
}

interface CommentsSectionProps {
  comments: Comment[];
  currentUser: {
    initials: string;
    color: string;
  };
  onAddComment?: (content: string) => void;
  className?: string;
}

export function CommentsSection({ comments, currentUser, onAddComment, className }: CommentsSectionProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment);
      setNewComment('');
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-[#5F5F67]" />
          <span className="text-[13px] font-semibold text-[#1A1A1E]">Activity</span>
          <div className="w-5 h-5 bg-[#22C55E] rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{comments.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setActiveTab('comments')}
          className={cn(
            'h-7 px-3.5 rounded-full text-[12px] font-semibold transition-colors',
            activeTab === 'comments'
              ? 'bg-[#2D5A3D] text-white'
              : 'text-[#9A9AA0] hover:text-[#5F5F67]'
          )}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'h-7 px-3.5 rounded-full text-[12px] font-medium transition-colors',
            activeTab === 'history'
              ? 'bg-[#2D5A3D] text-white'
              : 'text-[#9A9AA0] hover:text-[#5F5F67]'
          )}
        >
          History
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {activeTab === 'comments' && comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                comment.author.color
              )}
            >
              {comment.author.initials}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-[#1A1A1E]">{comment.author.name}</span>
                <span className="text-[11px] text-[#9A9AA0]">{comment.timestamp}</span>
                {comment.isLatest && (
                  <span className="px-1.5 py-0.5 bg-[#DBEAFE] rounded text-[9px] font-semibold text-[#1D4ED8]">
                    Latest
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'px-3 py-2.5 rounded-lg text-[12px] leading-relaxed',
                  !comment.bubbleColor && 'bg-[#F1F5F9] text-[#1A1A1E]',
                  comment.bubbleColor === 'bg-[#FEF3C7]' && 'bg-[#FEF3C7] text-[#92400E]',
                  comment.bubbleColor === 'bg-[#F0FDF4]' && 'bg-[#F0FDF4] text-[#14532D]',
                  comment.bubbleColor === 'bg-[#F1F5F9]' && 'bg-[#F1F5F9] text-[#1A1A1E]'
                )}
              >
                {comment.content}
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'history' && (
          <div className="text-center py-8 text-[#9A9AA0] text-[12px]">
            No history available
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="mt-6 pt-4 border-t border-[#E5E3DE]">
        <div className="flex items-center gap-2.5">
          {/* My Avatar */}
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
              currentUser.color
            )}
          >
            {currentUser.initials}
          </div>

          {/* Input Box */}
          <div className="flex-1 h-9 bg-[#F8FAFC] border border-[#E5E3DE] rounded-full px-4 flex items-center">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 bg-transparent text-[12px] text-[#1A1A1E] placeholder:text-[#9A9AA0] outline-none"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            className="w-8 h-8 bg-[#2D5A3D] rounded-full flex items-center justify-center hover:bg-[#264C34] transition-colors"
          >
            <SendHorizontal className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Comment };
