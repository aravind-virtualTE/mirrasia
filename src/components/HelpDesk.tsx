import { useState, useRef, useEffect } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Position {
  x: number
  y: number
}

export default function HelpDesk() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const helpDeskRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (helpDeskRef.current) {
      const rect = helpDeskRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && helpDeskRef.current) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Get window dimensions
      const maxX = window.innerWidth - helpDeskRef.current.offsetWidth
      const maxY = window.innerHeight - helpDeskRef.current.offsetHeight
      
      // Ensure the helpdesk stays within viewport bounds
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  // Calculate if we should show popup above or below based on position
  const showAbove = position.y > window.innerHeight / 2

  return (
    <div
      ref={helpDeskRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
      className="select-none"
    >
      {isOpen && (
        <div 
          className="mb-4 w-[300px] rounded-lg border bg-background shadow-lg"
          style={{
            position: 'absolute',
            bottom: showAbove ? '100%' : 'auto',
            top: showAbove ? 'auto' : '100%',
            right: '0',
            marginBottom: showAbove ? '8px' : '0',
            marginTop: showAbove ? '0' : '8px'
          }}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold">Help Desk</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              How can we help you today?
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                Hello! I'm here to help. What questions do you have?
              </div>
            </div>
          </div>
        </div>
      )}
      <Button
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}