import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDueDate(date: Date | null | undefined): string {
  if (!date) return "No due date";
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'h:mm a')}`;
  } else if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, 'h:mm a')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, 'h:mm a')}`;
  } else {
    return format(dateObj, 'MMM d, h:mm a');
  }
}

export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd');
}

export function formatTimeForInput(date: Date | null | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-amber-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-neutral-600';
  }
}

export const DEFAULT_CATEGORY_COLORS = [
  '#4F46E5', // primary/indigo
  '#16A34A', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#0EA5E9', // sky
  '#14B8A6', // teal
];
