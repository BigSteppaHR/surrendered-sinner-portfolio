
import React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Define a custom filter function
  const customProps: Record<string, any> = {};
  
  // Only add the filter function if using Sonner v2.0.0 or higher
  // This is a workaround for TypeScript error
  customProps.onToast = (toast: any) => {
    if (!toast) return;
    
    // Check title and message for Lovable mentions
    const title = typeof toast.title === 'string' ? toast.title.toLowerCase() : '';
    const message = typeof toast.message === 'string' ? toast.message.toLowerCase() : '';
    
    // Filter out Lovable branded toasts
    if (title.includes('lovable') || 
        title.includes('gpt') || 
        message.includes('lovable') || 
        message.includes('gpt')) {
      // Prevent the toast from showing
      return false;
    }
    
    return true;
  };

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...customProps}
      {...props}
    />
  )
}

export { Toaster }
