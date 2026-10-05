'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarContextValue {
  status: ImageLoadingStatus;
  setStatus: React.Dispatch<React.SetStateAction<ImageLoadingStatus>>;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const [status, setStatus] = React.useState<ImageLoadingStatus>('idle');

    const sizeClasses = {
      sm: 'h-7 w-7 text-[10px]',
      md: 'h-8 w-8 text-xs',
      lg: 'h-10 w-10 text-sm font-bold',
    }[size];

    return (
      <AvatarContext.Provider value={{ status, setStatus }}>
        <div
          ref={ref}
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-white shadow-xs select-none',
            sizeClasses,
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = '', onLoad, onError, ...props }, ref) => {
    const context = React.useContext(AvatarContext);
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
      if (!src) {
        setIsLoaded(false);
        context?.setStatus('error');
        return;
      }

      // Check if image is already cached or complete in memory
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        setIsLoaded(true);
        context?.setStatus('loaded');
      };
      img.onerror = () => {
        setIsLoaded(false);
        context?.setStatus('error');
      };
      img.src = src;

      if (img.complete && img.naturalWidth > 0) {
        setIsLoaded(true);
        context?.setStatus('loaded');
      } else {
        context?.setStatus('loading');
      }

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [src]);

    if (!src) return null;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          setIsLoaded(true);
          context?.setStatus('loaded');
          onLoad?.(e);
        }}
        onError={(e) => {
          setIsLoaded(false);
          context?.setStatus('error');
          onError?.(e);
        }}
        className={cn(
          'absolute inset-0 aspect-square h-full w-full object-cover rounded-full transition-opacity duration-150',
          isLoaded || context?.status === 'loaded' ? 'opacity-100 z-10' : 'opacity-0',
          className
        )}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AvatarContext);

  if (context && context.status === 'loaded') {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 font-black text-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
