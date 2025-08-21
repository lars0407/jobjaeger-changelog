"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
  className?: string
  height?: string
  autoScroll?: boolean
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Vorher",
  afterAlt = "Nachher",
  className,
  height = "h-96",
  autoScroll = true
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  // Auto-scroll animation when component comes into viewport
  useEffect(() => {
    if (!autoScroll || hasAnimated) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Start auto-scroll animation
            setHasAnimated(true)
            
            // Animate to right (100%)
            const animateRight = () => {
              let position = 50
              const interval = setInterval(() => {
                position += 2
                setSliderPosition(position)
                if (position >= 100) {
                  clearInterval(interval)
                  // Animate back to center (50%)
                  setTimeout(() => {
                    const animateBack = () => {
                      let backPosition = 100
                      const backInterval = setInterval(() => {
                        backPosition -= 2
                        setSliderPosition(backPosition)
                        if (backPosition <= 50) {
                          clearInterval(backInterval)
                          setSliderPosition(50)
                        }
                      }, 30)
                    }
                    animateBack()
                  }, 1000) // Wait 1 second at right position
                }
              }, 30)
            }
            
            animateRight()
          }
        })
      },
      { threshold: 0.3 } // Trigger when 30% of component is visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [autoScroll, hasAnimated])

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border", height, className)}>
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-ew-resize"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Before Image (Background - Old version) */}
        <img
          src={beforeImage}
          alt={beforeAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* After Image (Clipped overlay - New version) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
        >
          <img
            src={afterImage}
            alt={afterAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium z-20">
          Neue Version
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium z-20">
          Alte Version
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md text-sm text-center z-20">
          ← Ziehe den Slider hin und her →
        </div>
      </div>
    </div>
  )
}
