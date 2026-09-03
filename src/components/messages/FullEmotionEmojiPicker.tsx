import React, { useState, useEffect, useMemo } from 'react';
import { 
  Smile, 
  Heart, 
  ThumbsUp, 
  Flame, 
  Music, 
  Sparkles, 
  PartyPopper, 
  Dog, 
  Utensils, 
  Clock, 
  Search, 
  X,
  Star
} from 'lucide-react';

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Cảm xúc',
    icon: <Smile size={16} />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', 
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', 
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', 
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', 
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', 
      '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', 
      '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', 
      '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', 
      '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', 
      '💀', '☠️', '💩', '🤡', '👻', '👽', '👾', '🤖'
    ]
  },
  {
    id: 'hearts',
    name: 'Trái tim & Tình yêu',
    icon: <Heart size={16} />,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', 
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', 
      '💋', '💍', '💎', '💐', '🌹', '🥀', '🌺', '🌸', '🌷', '🌻', 
      '✨', '💫', '🧸', '🍫', '🕯️', '🥂', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💑'
    ]
  },
  {
    id: 'gestures',
    name: 'Bàn tay & Cử chỉ',
    icon: <ThumbsUp size={16} />,
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', 
      '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', 
      '🖕', '👇', '☝️', '🖐️', '✋', '🖖', '👋', '💅', '🤳', '💪', 
      '🦾', '🦿', '🦵', '🦶', '👂', '👃', '🧠', '🫀', '🫁', '👀'
    ]
  },
  {
    id: 'music',
    name: 'Âm nhạc & Nghệ thuật',
    icon: <Music size={16} />,
    emojis: [
      '🎵', '🎶', '🎧', '🎤', '🎹', '🎷', '🎺', '🎸', '🪕', '🎻', 
      '🥁', '📻', '🎙️', '🎼', '🔊', '🔈', '📢', '📣', '🎚️', '🎛️', 
      '🎬', '🎭', '🎪', '🎨', '🎫', '🎟️', '🪄', '✨', '💿', '📀'
    ]
  },
  {
    id: 'symbols',
    name: 'Hot & Biểu tượng',
    icon: <Flame size={16} />,
    emojis: [
      '🔥', '⚡', '⭐', '🌟', '✨', '💫', '💥', '💯', '💢', '💨', 
      '💦', '💤', '🕊️', '👑', '🏆', '🥇', '🥈', '🥉', '🎯', '🎲', 
      '🎰', '🎮', '🚀', '🛸', '🌙', '☀️', '🌈', '❄️', '💎', '🔮',
      '🔮', '🧿', '🍀', '💰', '💵', '🛡️', '⚔️', '🗝️', '🔔', '🚩'
    ]
  },
  {
    id: 'celebration',
    name: 'Lễ hội & Tiệc tùng',
    icon: <PartyPopper size={16} />,
    emojis: [
      '🎉', '🎊', '🎈', '🎂', '🍰', '🧁', '🍾', '🥂', '🍻', '🍺', 
      '🍷', '🍸', '🍹', '🍿', '🎁', '🎄', '🎃', '🎆', '🎇', '🧨', 
      '🏮', '🎀', '🪄', '🎠', '🎡', '🏆', '🥇', '👑', '🪅', '🪩'
    ]
  },
  {
    id: 'animals',
    name: 'Động vật',
    icon: <Dog size={16} />,
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', 
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐧', '🐦', '🐣', '🦆', '🦅', 
      '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', 
      '🐢', '🐍', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬'
    ]
  },
  {
    id: 'food',
    name: 'Ẩm thực',
    icon: <Utensils size={16} />,
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🍣', '🍱', '🍜', '🍲', '🍛', 
      '🍚', '🍙', '🥟', '🍤', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', 
      '🥞', '🧇', '🥩', '🍗', '🍩', '🍪', '🍨', '🍧', '🍦', '☕'
    ]
  }
];

const RECENT_KEY = 'haevy_recent_emojis_v1';

interface FullEmotionEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  className?: string;
  variant?: 'floating' | 'embedded';
}

export function FullEmotionEmojiPicker({
  onSelectEmoji,
  onClose,
  className = '',
  variant = 'floating'
}: FullEmotionEmojiPickerProps) {
  const [activeTab, setActiveTab] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : ['❤️', '😂', '🔥', '👏', '😍', '🎉', '👍', '✨', '🎧', '💯'];
    } catch {
      return ['❤️', '😂', '🔥', '👏', '😍', '🎉', '👍', '✨', '🎧', '💯'];
    }
  });

  const handlePickEmoji = (emoji: string) => {
    onSelectEmoji(emoji);

    // Save to recents
    setRecentEmojis((prev) => {
      const updated = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 24);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matched: string[] = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((emoji) => {
        if (emoji.includes(query) && !matched.includes(emoji)) {
          matched.push(emoji);
        }
      });
    });
    // Fallback: match category name search keywords
    EMOJI_CATEGORIES.forEach((cat) => {
      if (cat.name.toLowerCase().includes(query) || cat.id.includes(query)) {
        cat.emojis.forEach((emoji) => {
          if (!matched.includes(emoji)) matched.push(emoji);
        });
      }
    });

    return matched;
  }, [searchQuery]);

  return (
    <div 
      className={`bg-zinc-900/98 backdrop-blur-2xl border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 text-white animate-in fade-in zoom-in-95 duration-150 ${className}`}
      style={{ maxHeight: '360px', width: '100%', maxWidth: '380px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header & Search Bar */}
      <div className="p-2.5 pb-1.5 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950/40">
        <div className="flex-1 relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm biểu cảm, icon, nhãn dán..."
            className="w-full bg-zinc-800/80 border border-zinc-700/60 focus:border-amber-400 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 text-zinc-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          title="Đóng bảng emoji"
        >
          <X size={15} />
        </button>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto no-scrollbar border-b border-zinc-800/60 bg-zinc-950/20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('recent')}
            className={`p-1.5 px-2 rounded-xl text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="Gần đây"
          >
            <Clock size={14} />
          </button>

          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`p-1.5 px-2 rounded-xl text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid Container with smooth custom scrollbar */}
      <div className="flex-1 p-2.5 overflow-y-auto custom-scrollbar" style={{ minHeight: '180px', maxHeight: '240px' }}>
        {searchQuery ? (
          <div>
            <p className="text-[11px] font-bold text-zinc-400 mb-2 px-1">
              Kết quả tìm kiếm ({filteredEmojis?.length || 0})
            </p>
            {filteredEmojis && filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {filteredEmojis.map((emoji, idx) => (
                  <button
                    key={`${emoji}-${idx}`}
                    type="button"
                    onClick={() => handlePickEmoji(emoji)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-zinc-800/90 active:scale-90 hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Không tìm thấy biểu cảm phù hợp
              </div>
            )}
          </div>
        ) : activeTab === 'recent' ? (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Clock size={12} className="text-amber-400" />
                Cảm xúc thường dùng
              </span>
            </div>
            {recentEmojis.length > 0 ? (
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {recentEmojis.map((emoji, idx) => (
                  <button
                    key={`${emoji}-${idx}`}
                    type="button"
                    onClick={() => handlePickEmoji(emoji)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-zinc-800/90 active:scale-90 hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Chưa có biểu cảm gần đây
              </div>
            )}
          </div>
        ) : (
          <div>
            {EMOJI_CATEGORIES.filter((c) => c.id === activeTab).map((cat) => (
              <div key={cat.id}>
                <p className="text-[11px] font-bold text-zinc-400 mb-2 px-1 flex items-center gap-1.5">
                  <span className="text-amber-400">{cat.icon}</span>
                  {cat.name} ({cat.emojis.length})
                </p>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {cat.emojis.map((emoji, idx) => (
                    <button
                      key={`${emoji}-${idx}`}
                      type="button"
                      onClick={() => handlePickEmoji(emoji)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-zinc-800/90 active:scale-90 hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Reaction Bottom Ribbon */}
      <div className="px-2.5 py-1.5 border-t border-zinc-800/60 bg-zinc-950/60 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500 font-medium">Chọn nhanh:</span>
        <div className="flex items-center gap-1">
          {['❤️', '😂', '🔥', '👍', '🥰', '🎉', '🎧'].map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => handlePickEmoji(quick)}
              className="p-1 rounded-lg text-sm hover:bg-zinc-800 hover:scale-125 active:scale-90 transition-transform cursor-pointer"
            >
              {quick}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
