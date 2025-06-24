import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ style, ...props }, ref) => (
  <SwitchPrimitive.Root
    style={{
      display: 'inline-flex',
      height: '24px',
      width: '44px',
      flexShrink: 0,
      cursor: 'pointer',
      alignItems: 'center',
      borderRadius: '12px',
      border: '2px solid transparent',
      transition: 'all 0.2s',
      backgroundColor: props.checked ? '#10b981' : '#6b7280',
      ...style
    }}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      style={{
        pointerEvents: 'none',
        display: 'block',
        height: '20px',
        width: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s',
        transform: props.checked ? 'translateX(20px)' : 'translateX(0px)'
      }}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }