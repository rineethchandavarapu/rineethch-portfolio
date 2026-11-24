import React, { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export function useMagnetic(ref, strength = 0.3) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Disable magnetic effect on non-hover devices (mobile touchscreens)
    const hasHover = window.matchMedia('(hover: hover)').matches
    if (!hasHover) return

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      gsap.to(el, {
        x: deltaX * strength,
        y: deltaY * strength,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1.1, 0.48)',
        overwrite: 'auto'
      })
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [ref, strength])
}

export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null)
  useMagnetic(ref, strength)

  const child = React.Children.only(children)
  return React.cloneElement(child, { ref })
}
