'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/VideoIntro.module.css'

const CinematicLayer = dynamic(() => import('@/components/three/CinematicLayer'), { ssr: false })

function scrollNext() {
  const main = document.querySelector('main')
  if (main) main.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

export default function VideoIntro() {
  const videoRef    = useRef(null)
  const greetRef    = useRef(null)
  const nameRef     = useRef(null)
  const roleRef     = useRef(null)
  const scrollRef   = useRef(null)
  const hintRef     = useRef(null)

  // muted state drives icon only - DOM muted property is controlled exclusively via ref
  const [muted,    setMuted]    = useState(true)
  const [playing,  setPlaying]  = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function updateViewport() {
      setIsMobile(window.innerWidth <= 767)
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    tl.fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
    tl.fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    tl.fromTo(scrollRef.current, { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.1')
    return () => tl.kill()
  }, [])

  // Preload + fade-in while the screen loader runs
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    v.muted = true
    v.preload = 'auto'
    v.load()
    const t = gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    return () => t.kill()
  }, [])

  // Auto-open tries sound first. If browser policy blocks it, wait for a user tap.
  useEffect(() => {
    function onLoaderDismissed() {
      const v = videoRef.current
      if (!v) return
      if (typeof v.play !== 'function') return

      const playWithSound = () => {
        v.volume = 1
        v.muted = false
        setMuted(false)
        return v.play().then(() => {
          setPlaying(true)
        })
      }

      const playMutedWithSoundHint = () => {
        v.muted = true
        setMuted(true)
        setShowHint(true)
        v.play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false))
      }

      playWithSound().catch(playMutedWithSoundHint)
    }
    window.addEventListener('loader-dismissed', onLoaderDismissed)
    return () => window.removeEventListener('loader-dismissed', onLoaderDismissed)
  }, [])

  function dismissHint() {
    if (!hintRef.current) return
    gsap.to(hintRef.current, {
      opacity: 0, y: -8, duration: 0.35,
      onComplete: () => setShowHint(false),
    })
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    if (playing) { v.pause(); setPlaying(false) }
    else {
      v.muted = false
      v.volume = 1
      setMuted(false)
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  function toggleMute() {
    if (showHint) dismissHint()
    const v = videoRef.current
    if (!v) return
    if (typeof v.play !== 'function') return
    // Set DOM property synchronously inside click gesture - Safari requires this.
    // React never updates `v.muted` on re-renders (known React limitation for video),
    // so the static `muted` attr in JSX does not fight with this.
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function handleEnded() {
    const main = document.querySelector('main')
    if (main && main.scrollTop < window.innerHeight * 0.4) scrollNext()
  }

  return (
    <section className={styles.section}>

      {/* Sound starts automatically where browser autoplay policy allows it. */}
      <video
        ref={videoRef}
        data-testid="intro-video"
        src="/assets/about_me.mp4"
        playsInline
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        className={styles.mainVideo}
      />

      {/* 3 - Cinematic gradient overlay */}
      <div className={styles.overlay} />

      {/* 4 - Three.js cinematic bokeh layer (desktop only) */}
      {!isMobile && <CinematicLayer />}

      {/* 5 - Landing text */}
      <div className={styles.heroContent}>
        <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>
        <h1 ref={nameRef} className={styles.name}>
          {profile.name.first}<br />{profile.name.last}
        </h1>
        <p ref={roleRef} className={styles.role}>{profile.roles.detailed}</p>
      </div>

      {/* Sound hint badge */}
      {showHint && (
        <button ref={hintRef} className={styles.soundHint} onClick={toggleMute} type="button">
          <span className={styles.soundPulse} />
          <span>Tap for sound</span>
        </button>
      )}

      {/* 8 - Controls (bottom-right) */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing
            ? /* Pause icon */
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="4" height="12" rx="1" />
                <rect x="8" y="1" width="4" height="12" rx="1" />
              </svg>
            : /* Play icon */
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <polygon points="2,1 13,7 2,13" />
              </svg>
          }
        </button>

        <button className={styles.ctrlBtn} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted
            ? /* Muted icon */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
                <line x1="10" y1="5" x2="14" y2="11" />
                <line x1="14" y1="5" x2="10" y2="11" />
              </svg>
            : /* Sound icon */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
                <path d="M10.5 5.5C11.8 6.5 12.5 7.2 12.5 8s-.7 1.5-2 2.5" />
                <path d="M12 3.5C14 5 15 6.4 15 8s-1 3-3 4.5" />
              </svg>
          }
        </button>
      </div>

      {/* 9 - Scroll cue */}
      <button
        ref={scrollRef}
        className={styles.scrollCue}
        onClick={scrollNext}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
