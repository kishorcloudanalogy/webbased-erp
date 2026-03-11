import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  gradient: string;
  description?: string;
}

export default function StatsCard({ title, value, change, positive, icon: Icon, gradient, description }: StatsCardProps) {
  return (
    <div className="stats-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          {change && (
            <div className={clsx('flex items-center gap-1 mt-2 text-xs font-semibold', positive ? 'text-emerald-600' : 'text-red-500')}>
              <span>{positive ? '▲' : '▼'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white flex-shrink-0', gradient)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={clsx('absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-5', gradient)} style={{ transform: 'translate(30%, 30%)' }} />
    </div>
  );
}
