import React from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  FlaskConical,
  ShieldAlert
} from 'lucide-react';

export type MobileTab = 'pending' | 'accepted' | 'completed' | 'rejected' | 'profile' | 'tests' | 'admin';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  counts: {
    pending: number;
    accepted: number;
    completed: number;
    rejected: number;
  };
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  counts,
}) => {
  const tabs = [
    {
      id: 'pending' as MobileTab,
      label: 'الطلبات',
      icon: Inbox,
      count: counts.pending,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'accepted' as MobileTab,
      label: 'المقبولة',
      icon: Clock,
      count: counts.accepted,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'completed' as MobileTab,
      label: 'الموصلة',
      icon: CheckCircle2,
      count: counts.completed,
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      id: 'rejected' as MobileTab,
      label: 'المرفوضة',
      icon: XCircle,
      count: counts.rejected,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'profile' as MobileTab,
      label: 'حسابي',
      icon: User,
      count: 0,
      badgeColor: '',
    },
  ];

  return (
    <nav 
      aria-label="شريط التنقل السفلي"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50/80 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.count > 0 && (
                  <span 
                    className={`absolute -top-1.5 -right-2 text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center ${tab.badgeColor}`}
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none truncate w-full text-center">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
