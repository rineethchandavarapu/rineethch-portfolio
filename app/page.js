'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import ProjectsSection       from '@/components/sections/ProjectsSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection'
import ScreenLoader from '@/components/sections/ScreenLoader'
import { TOTAL } from '@/lib/sectionIndices'

export default function Home() {
  const mainRef        = useRef(null)
  const idxRef         = useRef(0)
  const busyRef        = useRef(false)
  const tweenRef       = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  useLayoutEffect(() => {
    const el = mainRef.current
    if (!el) return

    const savedScrollTop = Number(sessionStorage.getItem('portfolio-scroll-top'))
    if (!Number.isFinite(savedScrollTop) || savedScrollTop <= 0) return

    const restoredScrollTop = Math.min(savedScrollTop, el.scrollHeight - el.clientHeight)
    el.scrollTop = restoredScrollTop
    idxRef.current = Math.round(restoredScrollTop / window.innerHeight)
    setShowLoader(false)
  }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    window.goTo = goTo

    function goTo(idx, { instant = false } = {}) {
      // Stay at either end of the portfolio instead of wrapping around.
      idx = Math.max(0, Math.min(idx, TOTAL - 1))

      if (!instant && (idx === idxRef.current || busyRef.current)) return

      if (instant) {
        idxRef.current = idx
        busyRef.current = true
        tweenRef.current?.kill()
        tweenRef.current = null
        el.scrollTo({ top: idx * window.innerHeight, behavior: 'instant' })
        ScrollTrigger.update()
        window.setTimeout(() => { busyRef.current = false }, 120)
        return
      }

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()

      tweenRef.current = gsap.to(el, {
        scrollTop: idx * window.innerHeight,
        duration: 1.0,
        ease: 'power3.inOut',
        onComplete: () => { setTimeout(() => { busyRef.current = false }, 600) },
      })
    }

    function onWheel(e) {
      if (window.innerWidth <= 767) {
        const nestedScroller = e.target.closest?.('[data-native-scroll="true"]')
        if (nestedScroller) {
          const canScroll = e.deltaY > 0
            ? nestedScroller.scrollTop + nestedScroller.clientHeight < nestedScroller.scrollHeight - 1
            : nestedScroller.scrollTop > 1
          if (canScroll) return
        }
      }

      e.preventDefault()
      if (busyRef.current) return
      const currentIdx = Math.round(el.scrollTop / window.innerHeight)
      idxRef.current = currentIdx
      goTo(currentIdx + (e.deltaY > 0 ? 1 : -1))
    }

    let touchY = 0
    let touchScroller = null
    function handleTouchStart(e) {
      touchY = e.touches[0].clientY
      touchScroller = e.target.closest?.('[data-native-scroll="true"]') || null
    }

    function handleTouchMove(e) {
      // Let the nested Work Experience list scroll natively, but prevent the
      // browser from also scrolling the full-page deck during custom swipes.
      if (!touchScroller && e.cancelable) e.preventDefault()
    }

    function handleTouchEnd(e) {
      const nestedTouch = touchScroller
      touchScroller = null
      if (busyRef.current) return
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40) return
      if (nestedTouch) return

      const currentIdx = Math.round(el.scrollTop / window.innerHeight)
      idxRef.current = currentIdx
      goTo(currentIdx + (dy > 0 ? 1 : -1))
    }

    function onScroll() {
      sessionStorage.setItem('portfolio-scroll-top', String(el.scrollTop))
      if (busyRef.current) return
      idxRef.current = Math.round(el.scrollTop / window.innerHeight)
    }

    let resizeTimeout
    function onResize() {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (el) {
          const wasBusy = busyRef.current
          busyRef.current = true
          // Re-align scroll position to the current section index using the new height
          el.scrollTop = idxRef.current * window.innerHeight
          // Force ScrollTrigger to recalculate metrics
          ScrollTrigger.refresh()
          setTimeout(() => {
            busyRef.current = wasBusy
          }, 100)
        }
      }, 150)
    }

    el.addEventListener('wheel',  onWheel,  { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true  })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('wheel',  onWheel)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend',   handleTouchEnd)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimeout)
      window.goTo = null
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      <Navbar isStarted={!showLoader} />
      <main ref={mainRef} style={{ height: '100vh', overflowY: 'scroll', overscrollBehavior: 'none' }}>
        <div>
          <VideoIntro />
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <WorkExperienceSection />
          <PublicationsFooterSection />
        </div>
      </main>
    </>
  )
}
