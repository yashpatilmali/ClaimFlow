import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title?: string; description?: string }
>(({ className = '', title, description, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={`fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-rule bg-surface shadow-drawer duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-lg ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-rule px-6 py-4 bg-paper/50">
        <div>
          {title && <DialogPrimitive.Title className="text-md font-semibold text-ink">{title}</DialogPrimitive.Title>}
          {description && (
            <DialogPrimitive.Description className="text-xs text-muted mt-0.5">{description}</DialogPrimitive.Description>
          )}
        </div>
        <DialogPrimitive.Close className="rounded-input p-1 text-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-status-processing">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';
