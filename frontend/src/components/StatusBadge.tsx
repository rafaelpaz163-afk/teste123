import { cn } from '../utils/cn'

interface StatusBadgeProps {
  status: string
  label: string
  color: string
}

export default function StatusBadge({ status, label, color }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      color
    )}>
      {label}
    </span>
  )
}
