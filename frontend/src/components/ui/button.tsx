import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#F27024] text-white hover:bg-[#E05C10] shadow-sm shadow-orange-500/25',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-100',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-xs',
        link: 'text-orange-600 underline-offset-4 hover:underline p-0 h-auto font-semibold',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-xl',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-sm',
        icon: 'h-8 w-8 rounded-lg p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
