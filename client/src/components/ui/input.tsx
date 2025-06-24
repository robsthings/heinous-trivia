import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ style, type, ...props }, ref) => {
    return (
      <input
        type={type}
        style={{
          display: 'flex',
          height: '40px',
          width: '100%',
          borderRadius: '6px',
          border: '1px solid #4b5563',
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          padding: '8px 12px',
          fontSize: '14px',
          color: '#f3f4f6',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }