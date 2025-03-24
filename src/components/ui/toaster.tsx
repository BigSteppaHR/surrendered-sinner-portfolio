
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

  // Filter out any toast that contains Lovable branding
  const filteredToasts = toasts.filter(toast => {
    if (typeof toast.title === 'string' && 
        (toast.title.toLowerCase().includes('lovable') || 
         toast.title.toLowerCase().includes('gpt'))) {
      return false;
    }
    
    if (typeof toast.description === 'string' && 
        (toast.description.toLowerCase().includes('lovable') || 
         toast.description.toLowerCase().includes('gpt'))) {
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
