import React from 'react';
import { Clock, MapPin, Eye, AlertCircle, ArrowDown } from 'lucide-react';

export default function Timeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
        No sightings logged yet for this case.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Chronological Sighting Timeline
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {events.length} Data Points
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {events.map((item, index) => {
          const isOrigin = item.type === 'CONFIRMED_ORIGIN';
          const isHigh = item.priority === 'HIGH';
          const isMedium = item.priority === 'MEDIUM';

          let dotColor = 'bg-slate-600';
          let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';

          if (isOrigin) {
            dotColor = 'bg-red-500 ring-4 ring-red-950';
            badgeClass = 'bg-red-950/60 text-red-300 border-red-800/80';
          } else if (isHigh) {
            dotColor = 'bg-orange-500 ring-4 ring-orange-950';
            badgeClass = 'bg-orange-950/60 text-orange-300 border-orange-800/80';
          } else if (isMedium) {
            dotColor = 'bg-amber-500 ring-4 ring-amber-950';
            badgeClass = 'bg-amber-950/60 text-amber-300 border-amber-800/80';
          }

          return (
            <div key={index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full transition-transform group-hover:scale-125 ${dotColor}`}
              />

              <div className="bg-slate-800/60 hover:bg-slate-800 border border-slate-750 rounded-lg p-3.5 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white font-mono">
                      {item.time || 'Time Unspecified'}
                    </span>
                    {item.date && (
                      <span className="text-[11px] text-slate-400">
                        • {item.date}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}
                  >
                    {isOrigin ? 'Confirmed Origin' : `Relevance: ${item.priority}`}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{item.location || 'Unknown Location'}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                {item.language && item.language !== 'English' && (
                  <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded inline-block">
                    Submitted in: {item.language}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
