import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ style, variant = "default", ...props }: BadgeProps) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    border: '1px solid transparent',
    padding: '2px 10px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s',
    outline: 'none'
  }
  
  const variantStyles = {
    default: { borderColor: 'transparent', backgroundColor: '#ef4444', color: 'white' },
    secondary: { borderColor: 'transparent', backgroundColor: '#374151', color: 'white' },
    destructive: { borderColor: 'transparent', backgroundColor: '#dc2626', color: 'white' },
    outline: { color: '#f3f4f6', borderColor: '#4b5563' },
  }
  
  return (
    <div 
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...style
      }} 
      {...props} 
    />
  )
}

export { Badge }