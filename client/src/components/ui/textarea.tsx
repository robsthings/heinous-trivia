import * as React from "react"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, ...props }, ref) => {
    return (
      <textarea
        style={{
          display: 'flex',
          minHeight: '60px',
          width: '100%',
          borderRadius: '6px',
          border: '1px solid #4b5563',
          backgroundColor: '#1f2937',
          padding: '8px 12px',
          fontSize: '14px',
          color: '#f3f4f6',
          outline: 'none',
          transition: 'all 0.2s',
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