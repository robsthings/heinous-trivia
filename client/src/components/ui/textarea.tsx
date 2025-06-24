import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, ...props }, ref) => {
    return (
      <textarea
        style={{
          display: 'flex',
          minHeight: '80px',
          width: '100%',
          borderRadius: '6px',
          border: '1px solid #4b5563',
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          padding: '8px 12px',
          fontSize: '14px',
          color: '#f3f4f6',
          outline: 'none',
          resize: 'vertical',
          ...style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }