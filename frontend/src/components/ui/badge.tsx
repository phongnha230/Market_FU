import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors border',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-900 text-white',
        secondary:
          'border-transparent bg-slate-100 text-slate-900',
        outline:
          'border-slate-200 text-slate-700 bg-white shadow-2xs',
        fpt:
          'border-orange-200/80 bg-orange-50 text-orange-600',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-600',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      suppressHydrationWarning
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
