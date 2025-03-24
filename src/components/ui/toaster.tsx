
import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  // Enhanced filter for toast notifications to catch any Lovable or GPT references
  const filteredToasts = toasts.filter(toast => {
    // Check toast title
    if (typeof toast.title === 'string') {
      const titleLower = toast.title.toLowerCase();
      if (titleLower.includes('lovable') || 
          titleLower.includes('gpt') || 
          titleLower.includes('engineer') ||
          titleLower.includes('ai assistant')) {
        return false;
      }
    }
    
    // Check toast description
    if (typeof toast.description === 'string') {
      const descLower = toast.description.toLowerCase();
      if (descLower.includes('lovable') || 
          descLower.includes('gpt') || 
          descLower.includes('engineer') ||
          descLower.includes('ai assistant')) {
        return false;
      }
    }
    
    // Check if toast contains any React elements with text content
    if (React.isValidElement(toast.title) || React.isValidElement(toast.description)) {
      // This is a more complex case where we can't easily check content
      // For safety, we'll only allow simple string toasts
      return false;
    }
    
    return true;
  });

  return (
    <ToastProvider>
      {filteredToasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
