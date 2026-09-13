import React from 'react';
import { DeliveryOrderStatus } from '../types/delivery';
import { Clock, CheckCircle2, AlertTriangle, XCircle, PackageCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: DeliveryOrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configMap: Record<
    DeliveryOrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    pending_review: {
      label: 'بانتظار المراجعة والقبول (pending_review)',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    accepted: {
      label: 'مقبول وجاري التوصيل (accepted)',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    cancellation_pending: {
      label: 'طلب إلغاء قيد المراجعة (cancellation_pending)',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    completed: {
      label: 'مكتمل - تم التوصيل (completed)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: 'ملغي بقرار الإدارة (cancelled)',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = configMap[status] || {
    label: status,
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 space-x-reverse font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
