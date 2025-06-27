import * as React from "react"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ style, ...props }, ref) => {
    return (
      <label
        style={{
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1',
          color: '#f3f4f6',
          ...style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }