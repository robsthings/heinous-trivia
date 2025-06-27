import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"


const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ style, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    style={{
      display: 'flex',
      height: '40px',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '6px',
      border: '1px solid #4b5563',
      backgroundColor: 'rgba(31, 41, 55, 0.8)',
      padding: '8px 12px',
      fontSize: '14px',
      color: '#f3f4f6',
      outline: 'none',
      ...style
    }}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>▼</SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ style, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 50,
        minWidth: '128px',
        overflow: 'hidden',
        borderRadius: '6px',
        border: '1px solid #4b5563',
        backgroundColor: '#1f2937',
        color: '#f3f4f6',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        ...style
      }}
      {...props}
    >
      <SelectPrimitive.Viewport style={{ padding: '4px' }}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ style, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    style={{
      position: 'relative',
      display: 'flex',
      width: '100%',
      cursor: 'default',
      userSelect: 'none',
      alignItems: 'center',
      borderRadius: '2px',
      padding: '6px 8px',
      fontSize: '14px',
      outline: 'none',
      ...style
    }}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }