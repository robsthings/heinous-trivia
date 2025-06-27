import * as React from "react"
import { Slot } from "@radix-ui/react-slot"


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap' as const,
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      cursor: 'pointer',
      border: 'none',
      outline: 'none'
    }
    
    const variantStyles = {
      default: { backgroundColor: '#ef4444', color: 'white' },
      destructive: { backgroundColor: '#dc2626', color: 'white' },
      outline: { border: '1px solid #4b5563', backgroundColor: 'transparent', color: '#f3f4f6' },
      secondary: { backgroundColor: '#374151', color: 'white' },
      ghost: { backgroundColor: 'transparent', color: '#f3f4f6' },
      link: { backgroundColor: 'transparent', color: '#ef4444', textDecoration: 'underline' },
    }
    
    const sizeStyles = {
      default: { height: '40px', padding: '0 16px' },
      sm: { height: '36px', padding: '0 12px' },
      lg: { height: '44px', padding: '0 32px' },
      icon: { height: '40px', width: '40px', padding: '0' },
    }
    
    return (
      <Comp
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }