import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"


const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ style, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    style={{
      display: 'inline-flex',
      height: '40px',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      backgroundColor: '#374151',
      padding: '4px',
      color: '#9ca3af',
      ...style
    }}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ style, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      borderRadius: '4px',
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      outline: 'none',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      border: 'none',
      ...style
    }}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ style, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    style={{
      marginTop: '8px',
      outline: 'none',
      ...style
    }}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }