export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical' | 'overdue';

export interface DeadlineInfo {
  isOverdue: boolean;
  isUrgent: boolean;
  urgencyLevel: UrgencyLevel;
  urgencyColor: string;
  formattedCountdown: string;
  formattedDate: string;
  remainingDays: number;
  remainingHours: number;
  remainingMinutes: number;
}

export const formatTimeUnit = (time: number, unit?: string): string => {
  const count = typeof time === 'number' ? time : 1;
  const defaultUnit = unit || 'day';
  if (count === 1) {
    return `1 ${defaultUnit.replace(/s$/, '')}`;
  }
  return `${count} ${defaultUnit.endsWith('s') ? defaultUnit : defaultUnit + 's'}`;
};

export const getDeadlineInfo = (deadline: any): DeadlineInfo => {
  if (!deadline) {
    return {
      isOverdue: false,
      isUrgent: false,
      urgencyLevel: 'low',
      urgencyColor: '#10B981',
      formattedCountdown: 'No deadline',
      formattedDate: 'N/A',
      remainingDays: 0,
      remainingHours: 0,
      remainingMinutes: 0
    };
  }

  let deadlineDate: Date;
  if (deadline instanceof Date) {
    deadlineDate = deadline;
  } else if (deadline && typeof deadline === 'object' && typeof deadline.toDate === 'function') {
    deadlineDate = deadline.toDate();
  } else if (deadline && typeof deadline === 'object' && 'seconds' in deadline) {
    deadlineDate = new Date(deadline.seconds * 1000);
  } else {
    deadlineDate = new Date(deadline);
  }

  if (isNaN(deadlineDate.getTime())) {
    return {
      isOverdue: false,
      isUrgent: false,
      urgencyLevel: 'low',
      urgencyColor: '#10B981',
      formattedCountdown: 'Invalid deadline',
      formattedDate: 'N/A',
      remainingDays: 0,
      remainingHours: 0,
      remainingMinutes: 0
    };
  }

  const now = Date.now();
  const diffMs = deadlineDate.getTime() - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const totalMinutes = Math.floor(absDiff / (1000 * 60));
  const totalHours = Math.floor(absDiff / (1000 * 60 * 60));
  const remainingDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  const formattedDate = deadlineDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let urgencyLevel: UrgencyLevel = 'low';
  let urgencyColor = '#10B981'; // Green
  let isUrgent = false;

  if (isOverdue) {
    urgencyLevel = 'overdue';
    urgencyColor = '#EF4444'; // Red
    isUrgent = true;
  } else if (totalHours < 24) {
    urgencyLevel = 'critical';
    urgencyColor = '#DC2626'; // Dark Red / Crimson
    isUrgent = true;
  } else if (remainingDays < 3) {
    urgencyLevel = 'high';
    urgencyColor = '#F59E0B'; // Amber
    isUrgent = true;
  } else if (remainingDays < 7) {
    urgencyLevel = 'medium';
    urgencyColor = '#3B82F6'; // Blue
    isUrgent = false;
  } else {
    urgencyLevel = 'low';
    urgencyColor = '#10B981'; // Green
    isUrgent = false;
  }

  let formattedCountdown = '';
  if (isOverdue) {
    formattedCountdown = remainingDays > 0 ? `${remainingDays}d ${remainingHours}h overdue` : `${remainingHours}h ${remainingMinutes}m overdue`;
  } else {
    if (remainingDays > 0) {
      formattedCountdown = `${remainingDays}d ${remainingHours}h remaining`;
    } else if (remainingHours > 0) {
      formattedCountdown = `${remainingHours}h ${remainingMinutes}m remaining`;
    } else {
      formattedCountdown = `${remainingMinutes}m remaining`;
    }
  }

  return {
    isOverdue,
    isUrgent,
    urgencyLevel,
    urgencyColor,
    formattedCountdown,
    formattedDate,
    remainingDays,
    remainingHours,
    remainingMinutes
  };
};

export const getUrgencyIcon = (urgencyLevel: string): string => {
  switch (urgencyLevel) {
    case 'overdue':
      return '⚠️';
    case 'critical':
      return '🚨';
    case 'high':
      return '⏰';
    case 'medium':
      return '⏳';
    case 'low':
    default:
      return '⏱️';
  }
};
