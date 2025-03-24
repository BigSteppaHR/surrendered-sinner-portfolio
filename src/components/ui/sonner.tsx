
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Filter function to prevent Lovable-branded toasts
  const filterToast = (toast: any) => {
    if (!toast) return false;
    
    // Check title and message for Lovable mentions
    const title = typeof toast.title === 'string' ? toast.title.toLowerCase() : '';
    const message = typeof toast.message === 'string' ? toast.message.toLowerCase() : '';
    
    return !(
      title.includes('lovable') || 
      title.includes('gpt') || 
      message.includes('lovable') || 
      message.includes('gpt')
    );
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
      filter={filterToast}
      {...props}
    />
  )
}

export { Toaster }
