'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import profile from '@/data/profile.json'
import { Magnetic } from '@/lib/useMagnetic'
import { SECTION } from '@/lib/sectionIndices'
import styles from '@/styles/sections/ProjectsSection.module.css'

const PROJECTS = profile.projects

export default function ProjectsSection() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const contentRefs = useRef([])
  const bgRefs      = useRef([])
  const counterRef  = useRef(null)
  const progressRef = useRef(null)
  const [slideIdx, setSlideIdx] = useState(0)
  const [activeModal, setActiveModal] = useState(null)
  const [zoomImage, setZoomImage] = useState(null)

  // Lock body scroll when zoom lightbox is active
  useEffect(() => {
    if (zoomImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [zoomImage])

  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    const scroller = document.querySelector('main')
    if (!scroller) return
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const n = PROJECTS.length
    contentRefs.current = contentRefs.current.slice(0, n)
    bgRefs.current      = bgRefs.current.slice(0, n)

    // Slides 2+ hidden initially
    contentRefs.current.forEach((el, i) => {
      if (el && i > 0) gsap.set(el, { opacity: 0, y: 30 })
    })

    const tl = gsap.timeline({ paused: true })

    // Horizontal slide - xPercent is viewport-independent
    tl.to(track, {
      xPercent: -((n - 1) / n * 100),
      ease: 'none',
      duration: n - 1,
    }, 0)

    for (let i = 0; i < n - 1; i++) {
      const curr   = contentRefs.current[i]
      const next   = contentRefs.current[i + 1]
      const nextBg = bgRefs.current[i + 1]

      if (curr) {
        tl.to(curr, {
          opacity: 0, y: -40, filter: 'blur(6px)',
          duration: 0.2, ease: 'power2.in',
        }, i + 0.30)
      }

      if (nextBg && !isMobile) {
        tl.fromTo(nextBg,
          { scale: 1.04 },
          { scale: 1.0, duration: 1.0, ease: 'power2.out' },
          i
        )
      }

      if (next) {
        tl.set(next, { opacity: 1, y: 0 }, i + 0.44)

        const meta  = next.querySelector(`.${styles.meta}`)
        const title = next.querySelector(`.${styles.title}`)
        const sub   = next.querySelector(`.${styles.subtitle}`)
        const desc  = next.querySelector(`.${styles.desc}`)
        const tags  = next.querySelectorAll(`.${styles.tag}`)
        const btn   = next.querySelector(`.${styles.moreBtn}`)

        if (meta)  tl.fromTo(meta,  { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }, i + 0.45)
        if (title) tl.fromTo(title, { opacity: 0, y: 20 },  { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out'   }, i + 0.48)
        if (sub)   tl.fromTo(sub,   { y: 12, opacity: 0 },  { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' }, i + 0.54)
        if (desc)  tl.fromTo(desc,  { y: 10, opacity: 0 },  { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, i + 0.58)
        if (tags.length) {
          tl.fromTo(tags,  { y: 6, opacity: 0 },  { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out', stagger: 0.03 }, i + 0.65)
        }
        if (btn)   tl.fromTo(btn,   { y: 8, opacity: 0 },  { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' }, i + 0.72)
      }
    }

    const st = ScrollTrigger.create({
      trigger:  section,
      scroller,
      start:    'top top',
      end:      () => `+=${(n - 1) * window.innerHeight}`,
      onUpdate: (self) => {
        tl.progress(self.progress)

        const activeIdx = Math.round(self.progress * (n - 1))
        setSlideIdx(prev => {
          if (prev !== activeIdx) {
            setActiveModal(null)
            return activeIdx
          }
          return prev
        })

        if (progressRef.current) {
          gsap.set(progressRef.current, {
            scaleX: self.progress, transformOrigin: 'left center', overwrite: true,
          })
        }

        if (counterRef.current) counterRef.current.textContent = String(activeIdx + 1).padStart(2, '0')
      },
    })

    return () => st.kill()
  }, [])

  return (
    <div style={{ height: `${PROJECTS.length * 100}vh` }}>
      <section
        ref={sectionRef}
        className={`${styles.section} ${activeModal !== null ? styles.hasDrawer : ''}`}
      >

        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topInfo}>
            <span className={styles.sectionLabel}>Featured Work</span>
            <div className={styles.counter} aria-live="polite">
              <span ref={counterRef} className={styles.cCur}>{String(1).padStart(2, '0')}</span>
              <span className={styles.cSep}>/</span>
              <span className={styles.cTot}>{String(PROJECTS.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Horizontal track */}
        <div
          ref={trackRef}
          className={styles.track}
          style={{ width: `${PROJECTS.length * 100}vw` }}
        >
          {PROJECTS.map((proj, i) => (
            <div
              key={proj.id}
              className={styles.slide}
              data-image-shape={proj.imageAspect === 1 ? 'square' : 'wide'}
            >

              <div
                ref={el => { bgRefs.current[i] = el }}
                className={styles.slideBg}
              >
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  quality={85}
                  sizes="100vw"
                  className={styles.slideImg}
                  priority={i === 0}
                />
                <Magnetic>
                  <button
                    type="button"
                    className={styles.enlargeBtn}
                    onClick={() => setZoomImage(proj.image)}
                    aria-label="Enlarge image"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    <span>Enlarge</span>
                  </button>
                </Magnetic>
              </div>

              <span className={styles.slideNum} aria-hidden>0{i + 1}</span>

              <div
                ref={el => { contentRefs.current[i] = el }}
                className={styles.slideContent}
              >
                <div className={styles.slideLeft}>
                  <div className={styles.meta}>
                    <span className={styles.typeTag}>{proj.type}</span>
                  </div>
                  <h2 className={styles.title}>{proj.title}</h2>
                  <p  className={styles.subtitle}>{proj.subtitle}</p>
                  <p  className={styles.mobileBriefDesc}>{proj.desc}</p>
                  <div className={styles.btnRow}>
                    <Magnetic>
                      <button
                        type="button"
                        onClick={() => setActiveModal(i)}
                        className={styles.moreBtn}
                      >
                        Details
                      </button>
                    </Magnetic>
                  </div>
                </div>

                <div className={styles.slideRight}>
                  <p className={styles.desc}>{proj.desc}</p>
                  <div className={styles.stack}>
                    {proj.tech.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Overlay for Mobile Details */}
              {activeModal === i && (
                <div className={styles.drawer}>
                  <div className={styles.drawerHeader}>
                    <div>
                      <span className={styles.drawerType}>{proj.type}</span>
                      <h3 className={styles.drawerTitle}>{proj.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className={styles.closeBtn}
                      aria-label="Close details"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.drawerBody}>
                    <p className={styles.drawerDesc}>{proj.desc}</p>
                    <h4 className={styles.techTitle}>Technologies</h4>
                    <div className={styles.drawerStack}>
                      {proj.tech.map(t => (
                        <span key={t} className={styles.drawerTag}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className={styles.bottomUI}>
          <div className={styles.progressTrack}>
            <div ref={progressRef} className={styles.progressBar} />
          </div>
          <Magnetic>
            <button
              type="button"
              className={styles.nextSectionBtn}
              onClick={() => {
                if (window.goTo) {
                  window.goTo(SECTION.workExperience, { instant: true })
                }
              }}
              aria-label="Scroll to next section"
            >
              <span>Next Section</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>
          </Magnetic>
        </div>

      </section>

      {/* Zoom Lightbox Modal */}
      {zoomImage && (
        <div
          className={styles.lightbox}
          onClick={() => setZoomImage(null)}
        >
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setZoomImage(null)}
              aria-label="Close lightbox"
            >
              ✕
            </button>
            <div className={styles.lightboxImageWrap}>
              <img
                src={zoomImage}
                alt="Enlarged project screenshot"
                className={styles.lightboxImg}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
