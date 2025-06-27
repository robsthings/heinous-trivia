import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ style, ...props }, ref) => {
    return (
      <input
        style={{
          display: 'flex',
          height: '40px',
          width: '100%',
          borderRadius: '6px',
          border: '1px solid #4b5563',
          backgroundColor: '#1f2937',
          padding: '0 12px',
          fontSize: '14px',
          color: '#f3f4f6',
          outline: 'none',
          transition: 'all 0.2s',
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