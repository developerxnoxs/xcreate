import React from 'react';
import { SavedStory } from '../types';
import { Trash2, History, Sparkles, Calendar, Palette, Film } from 'lucide-react';

interface SavedStoriesProps {
  savedStories: SavedStory[];
  activeSavedId: string | null;
  onSelectStory: (story: SavedStory) => void;
  onDeleteStory: (id: string) => void;
}

export const SavedStories: React.FC<SavedStoriesProps> = ({
  savedStories,
  activeSavedId,
  onSelectStory,
  onDeleteStory,
}) => {
  if (savedStories.length === 0) return null;

  return (
    <div className="bg-[#0b0f19]/90 rounded-3xl shadow-xl p-6 border border-slate-800 mb-8 overflow-hidden backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            Riwayat Cerita Sains Kamu
          </h2>
          <p className="text-xs text-slate-400">
            Akses cepat ke 5 cerita terakhir yang telah dibuat tanpa perlu proses kompilasi ulang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {savedStories.map((story) => {
          const isActive = story.id === activeSavedId;
          const formattedDate = new Date(story.timestamp).toLocaleString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          });

          return (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className={`group relative flex flex-col justify-between p-3 bg-slate-950/70 hover:bg-slate-900/90 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                  : 'border-slate-800/80 hover:border-indigo-500/40'
              }`}
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStory(story.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-950 text-slate-400 hover:text-rose-400 shadow-md border border-slate-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
                title="Hapus cerita ini"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              <div className="space-y-2.5">
                {/* Thumbnail Image */}
                {story.content.imageUrl ? (
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={story.content.imageUrl}
                      alt={story.content.title || story.topic}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-white px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1 font-mono">
                      <Palette className="h-2.5 w-2.5 text-cyan-400" />
                      {story.visualStyle}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl bg-slate-900/80 flex items-center justify-center border border-slate-800">
                    <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center text-[10px] text-slate-400 font-mono">
                    <Calendar className="h-2.5 w-2.5 mr-1" />
                    {formattedDate}
                  </div>
                  <h3 className="font-bold text-slate-200 text-xs line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                    {story.content.title || story.topic}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
