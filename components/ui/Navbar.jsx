'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import { NAV_ITEMS } from '@/lib/sectionIndices'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useMagnetic } from '@/lib/useMagnetic'

function navigateTo(idx) {
  window.goTo?.(idx)
}

function getIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar({ isStarted: propIsStarted = false }) {
  const [time,    setTime]    = useState('')
  const [onIntro, setOnIntro] = useState(true)
  const [onHero,  setOnHero]  = useState(false)
  const [onDark,  setOnDark]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isStarted, setIsStarted] = useState(propIsStarted)

  useEffect(() => {
    if (propIsStarted) {
      queueMicrotask(() => setIsStarted(true))
    }
  }, [propIsStarted])
  const headerRef   = useRef(null)
  const mobileMenuRef = useRef(null)
  const linkRefs = useRef([])
  const emailBtnRef = useRef(null)

  useMagnetic(emailBtnRef)

  // Live clock - set interval on mount
  useEffect(() => {
    setTime(getIST())
    const id = setInterval(() => setTime(getIST()), 1000)
    return () => clearInterval(id)
  }, [])

  // Listen for the start action from ScreenLoader
  useEffect(() => {
    function handleStart() {
      setIsStarted(true)
    }
    window.addEventListener('loader-dismissed', handleStart)
    return () => window.removeEventListener('loader-dismissed', handleStart)
  }, [])

  // Mobile menu open/close animation
  useEffect(() => {
    if (!mobileMenuRef.current) return

    if (menuOpen) {
      // Lock scroll
      document.body.style.overflow = 'hidden'
      
      // Animate overlay menu slide-in from right to left (xPercent: 100 to 0)
      gsap.killTweensOf([mobileMenuRef.current, linkRefs.current])
      gsap.set(mobileMenuRef.current, { display: 'flex', xPercent: 100, visibility: 'visible' })
      
      gsap.timeline()
        .to(mobileMenuRef.current, {
          xPercent: 0,
          duration: 0.5,
          ease: 'power3.inOut'
        })
        .fromTo(linkRefs.current, 
          { x: 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' },
          '-=0.25' // start sliding as the background panel completes its transition
        )
    } else {
      // Unlock scroll
      document.body.style.overflow = ''
      
      gsap.killTweensOf([mobileMenuRef.current, linkRefs.current])
      gsap.timeline()
        .to(linkRefs.current, {
          x: 40,
          opacity: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.in'
        })
        .to(mobileMenuRef.current, {
          xPercent: 100, // Slide off to the right
          duration: 0.55,
          ease: 'power3.inOut'
        })
        .set(mobileMenuRef.current, { display: 'none', visibility: 'hidden' })
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Keep the navbar fixed and update its colors for the current section
  useEffect(() => {
    const scroller = document.querySelector('main') ?? window

    const onScroll = () => {
      const currentY = scroller.scrollTop ?? window.scrollY
      const sectionIdx = Math.round(currentY / window.innerHeight)
      setOnIntro(currentY < window.innerHeight * 0.8)
      setOnHero(currentY >= window.innerHeight * 0.8 && currentY < window.innerHeight * 1.8)
      setOnDark(sectionIdx >= 3)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Automatically close mobile menu and reset styles when resizing back to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767 && menuOpen) {
        setMenuOpen(false)
        document.body.style.overflow = ''
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [menuOpen])

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${onIntro ? styles.introMode : ''} ${onHero ? styles.heroMode : ''} ${onDark ? styles.darkMode : ''} ${menuOpen ? styles.hasActiveMenu : ''} ${!isStarted ? styles.notStarted : ''}`}>
        <span className={styles.logoSlot}>IST - {time}</span>

        <NavigationMenu className={styles.navMenu}>
          <NavigationMenuList className="flex gap-8">
            {NAV_ITEMS.map(({ label, idx }) => (
              <NavigationMenuItem key={label}>
                <NavigationMenuLink
                  className={styles.navLink}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigateTo(idx)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {label.charAt(0) + label.slice(1).toLowerCase()}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className={styles.rightActions}>
          <a
            href="/Rineeth_Chandavarapu_Resume.pdf"
            download
            className={`${styles.resumeBtn} rounded-lg text-sm font-semibold px-5 py-2.5 flex items-center gap-2`}
          >
            Resume
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 1.5V8.5M3.25 5.75L6 8.5L8.75 5.75M2 10.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a
            ref={emailBtnRef}
            href={`mailto:${profile.email}`}
            className={`${styles.emailBtn} rounded-lg text-sm font-semibold px-5 py-2.5 flex items-center gap-2`}
          >
            Email me
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          <button
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerActive : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      </header>

      <div ref={mobileMenuRef} className={styles.mobileMenu} style={{ display: 'none' }}>
        {NAV_ITEMS.map(({ label, idx }, i) => (
          <button
            key={label}
            ref={el => linkRefs.current[i] = el}
            className={styles.mobileNavLink}
            onClick={() => {
              navigateTo(idx)
              setMenuOpen(false)
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
