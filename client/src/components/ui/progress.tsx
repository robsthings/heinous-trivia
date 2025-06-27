import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"


const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ style, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    style={{
      position: 'relative',
      height: '16px',
      width: '100%',
      overflow: 'hidden',
      borderRadius: '9999px',
      backgroundColor: '#374151',
      ...style
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      style={{
        height: '100%',
        width: '100%',
        flex: '1 1 0%',
        backgroundColor: '#10b981',
        transition: 'all 0.3s',
        transform: `translateX(-${100 - (value || 0)}%)`
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }