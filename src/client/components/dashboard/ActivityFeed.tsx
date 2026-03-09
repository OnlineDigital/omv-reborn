// Activity Feed Component
import { Component } from 'solid-js';
import { Icon } from '../Icon';
import { mockData, Activity } from '../../stores/mockData';

const getStatusStyles = (type: Activity['type']) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'error':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'warning':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'info':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'progress':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getIconBgColor = (type: Activity['type']) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'error':
      return 'bg-rose-500/10 text-rose-500';
    case 'warning':
      return 'bg-amber-500/10 text-amber-500';
    case 'info':
      return 'bg-blue-500/10 text-blue-500';
    case 'progress':
      return 'bg-indigo-500/10 text-indigo-400';
    default:
      return 'bg-slate-500/10 text-slate-500';
  }
};

export const ActivityFeed: Component = () => {
  const activities = mockData.activities;

  return (
    <div class="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
      {activities().map((activity) => (
        <div class="flex gap-3">
          <div class={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor(activity.type)}`}>
            <Icon name={activity.icon} size={16} />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <p class="text-sm font-medium">{activity.title}</p>
              {activity.type === 'progress' ? (
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span class="text-[8px] text-amber-500 font-bold uppercase">In Progress</span>
                </div>
              ) : (
                <span class={`px-1.5 py-0.5 text-[8px] rounded border uppercase font-bold ${getStatusStyles(activity.type)}`}>
                  {activity.type}
                </span>
              )}
            </div>
            <p class="text-xs text-slate-400 mt-0.5 italic">{activity.description}</p>
            {activity.progress !== undefined && (
              <div class="mt-2 flex items-center gap-2">
                <div class="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div class="bg-indigo-500 h-full rounded-full transition-all" style={`width: ${activity.progress}%`}></div>
                </div>
                <span class="text-[10px] text-indigo-400 font-mono">{activity.progress}%</span>
              </div>
            )}
            <p class="text-[10px] text-slate-500 mt-1">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
