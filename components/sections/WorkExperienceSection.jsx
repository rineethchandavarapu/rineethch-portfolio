'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'

const EXPS = profile.experience

export default function WorkExperienceSection() {
  const sectionRef        = useRef(null)
  const timelineRef       = useRef(null)
  const lineRef           = useRef(null)
  const dotRefs           = useRef([])
  const cardRefs          = useRef([])
  const tlRef             = useRef(null)
  const hoverTlsRef       = useRef([])

  const [expandedCards, setExpandedCards] = useState({})
  const [timelineScroll, setTimelineScroll] = useState(0)
  const [timelineMaxScroll, setTimelineMaxScroll] = useState(0)

  function toggleCard(e, i) {
    e.stopPropagation()
    setExpandedCards(prev => ({ ...prev, [i]: !prev[i] }))
  }

  function handleCardEnter(i) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const dot = dotRefs.current[i]
    if (!dot) return
    gsap.to(dot, { scale: 1.1, boxShadow: '0 0 0 8px rgba(247,147,30,0.12), 0 0 28px rgba(247,147,30,0.22)', duration: 0.3, ease: 'back.out(2)' })
  }

  function handleCardLeave(i) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const dot = dotRefs.current[i]
    if (!dot) return
    gsap.to(dot, { scale: 1, boxShadow: '0 0 0 6px rgba(247,147,30,0.05), 0 0 22px rgba(247,147,30,0.1)', duration: 0.25, ease: 'power2.in' })
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !lineRef.current) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      tlRef.current?.kill()
      gsap.set(lineRef.current,      { scaleX: 0, transformOrigin: 'left center' })
      dotRefs.current.forEach(el  => el && gsap.set(el,  { scale: 0, opacity: 0 }))
      cardRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 28 }))
    }

    function playAnim() {
      resetAnim()
      const n  = EXPS.length
      const tl = gsap.timeline()
      tlRef.current = tl
      tl.to(lineRef.current, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      EXPS.forEach((_, i) => {
        const t = i === 0 ? 0.08 : 0.08 + (i / (n - 1)) * 1.44
        tl.to(dotRefs.current[i],  { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, t)
        tl.to(cardRefs.current[i], { opacity: 1, y: 0,    duration: 0.6, ease: 'power3.out'  }, t + 0.14)
      })
    }

    resetAnim()

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive)  { isActive = true;  playAnim() }
      if (!inRange && isActive)  { isActive = false; resetAnim() }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline) return

    function updateMetrics() {
      const maxScroll = Math.max(0, timeline.scrollWidth - timeline.clientWidth)
      setTimelineMaxScroll(maxScroll)
      setTimelineScroll(Math.min(timeline.scrollLeft, maxScroll))
    }

    function syncScrollPosition() {
      setTimelineScroll(timeline.scrollLeft)
    }

    updateMetrics()
    timeline.addEventListener('scroll', syncScrollPosition, { passive: true })
    window.addEventListener('resize', updateMetrics)

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(timeline)
    if (timeline.firstElementChild) resizeObserver.observe(timeline.firstElementChild)

    return () => {
      timeline.removeEventListener('scroll', syncScrollPosition)
      window.removeEventListener('resize', updateMetrics)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>

      <div className={styles.bgImg} aria-hidden>
        <Image
          src="/assets/work-experience.png"
          alt=""
          fill
          quality={85}
          sizes="100vw"
          className={styles.bgImgEl}
        />
      </div>

      <div className={styles.header}>
        <span className={styles.label}>Work Experience</span>
        <span className={styles.labelRight}>{String(EXPS.length).padStart(2, '0')} Companies</span>
      </div>

      <div className={styles.timelineWrap}>
        <div
          id="work-experience-timeline"
          ref={timelineRef}
          className={styles.timeline}
          data-native-scroll="true"
        >
          <div className={styles.timelineBody}>

          {/* Snake connector */}
          <div ref={lineRef} className={styles.snakeLine} />

          {/* Entry columns */}
          <div className={styles.entries}>
            {EXPS.map((exp, i) => {
              const isExpanded = !!expandedCards[i];
              return (
                <div
                  key={exp.id}
                  className={styles.entry}
                  onMouseEnter={() => handleCardEnter(i)}
                  onMouseLeave={() => handleCardLeave(i)}
                >

                  <div
                    ref={el => { dotRefs.current[i] = el }}
                    className={styles.dot}
                  >
                    <span className={styles.dotNum}>{String(i + 1).padStart(2, '0')}</span>
                  </div>

                  <div
                    ref={el => { cardRefs.current[i] = el }}
                    className={styles.card}
                  >
                    <div className={styles.cardHead}>
                      <span className={styles.period}>{exp.period} - {exp.periodEnd}</span>
                      <span className={styles.typeTag}>{exp.type}</span>
                      {exp.location && <span className={styles.location}>{exp.location}</span>}
                    </div>
                    <h2 className={styles.company}>{exp.company}</h2>
                    <p  className={styles.role}>{exp.role}</p>
                    <ul
                      className={`${styles.bullets} ${isExpanded ? styles.expanded : ''}`}
                    >
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className={styles.bullet}>{b}</li>
                      ))}
                    </ul>
                    <div className={styles.stack}>
                      {exp.tech.map(t => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <button
                        onClick={(e) => toggleCard(e, i)}
                        className={styles.seeMoreBtn}
                      >
                        {expandedCards[i] ? 'See Less' : 'See More'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          </div>
        </div>

        {timelineMaxScroll > 0 && (
          <input
            className={styles.scrollControl}
            type="range"
            min="0"
            max={timelineMaxScroll}
            value={Math.min(timelineScroll, timelineMaxScroll)}
            aria-label="Scroll Work Experience horizontally"
            aria-controls="work-experience-timeline"
            onChange={(event) => {
              const nextScroll = Number(event.target.value)
              setTimelineScroll(nextScroll)
              if (timelineRef.current) timelineRef.current.scrollLeft = nextScroll
            }}
          />
        )}
      </div>

      <div className={styles.mobileScrollHint} aria-hidden="true">
        <span className={styles.mobileScrollArrow}>↕</span>
        <span>Swipe up or down</span>
      </div>

    </section>
  )
}
