import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = React.forwardRef<any, InputProps>(
  ({ className, placeholderTextColor = '#888', ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor}
        className={cn(
          'h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
