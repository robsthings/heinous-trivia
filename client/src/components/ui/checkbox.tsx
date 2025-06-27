import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"


const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ style, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    style={{
      height: '16px',
      width: '16px',
      flexShrink: 0,
      borderRadius: '2px',
      border: '1px solid #4b5563',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}
    {...props}
  >
    <CheckboxPrimitive.Indicator style={{ color: '#10b981' }}>
      ✓
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }