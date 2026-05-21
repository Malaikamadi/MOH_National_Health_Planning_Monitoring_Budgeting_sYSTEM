import { cn } from '@/lib/cn';
import type { AwpStatus } from '@/lib/api-client';

const labels: Record<AwpStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  revisions_requested: 'Revisions requested',
  approved: 'Approved',
  active: 'Active',
  closed: 'Closed',
};

const classes: Record<AwpStatus, string> = {
  draft: 'status-draft',
  submitted: 'status-submitted',
  under_review: 'status-review',
  revisions_requested: 'status-revisions',
  approved: 'status-approved',
  active: 'status-active',
  closed: 'status-closed',
};

export function StatusPill({ status, className }: { status: AwpStatus; className?: string }) {
  return <span className={cn(classes[status], className)}>{labels[status]}</span>;
}
