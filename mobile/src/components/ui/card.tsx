import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef<any, ViewProps>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('rounded-xl border border-border bg-card p-4 shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<any, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('mb-2 flex-col space-y-1.5', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<any, TextProps>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn('text-lg font-bold leading-none tracking-tight text-foreground', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<any, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<any, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('py-2', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<any, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('mt-2 flex-row items-center pt-2', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';
