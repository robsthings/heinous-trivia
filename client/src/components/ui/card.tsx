import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        borderRadius: '8px',
        border: '1px solid #4b5563',
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        color: '#f3f4f6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        ...style
      }}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '24px', ...style }} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ style, ...props }, ref) => (
    <h3 ref={ref} style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1', ...style }} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ style, ...props }, ref) => (
    <p ref={ref} style={{ fontSize: '14px', color: '#9ca3af', ...style }} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ padding: '24px', paddingTop: '0', ...style }} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }