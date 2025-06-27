import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"


const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ style, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    style={{
      zIndex: 50,
      overflow: 'hidden',
      borderRadius: '6px',
      border: '1px solid #4b5563',
      backgroundColor: '#1f2937',
      padding: '6px 12px',
      fontSize: '12px',
      color: '#f3f4f6',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      animation: 'fadeIn 0.2s ease-out',
      ...style
    }}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }