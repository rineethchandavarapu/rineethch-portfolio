'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function makeSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0,   'rgba(255,255,255,1)')
  g.addColorStop(0.35,'rgba(255,255,255,0.7)')
  g.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function HeroBackground({ className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.parentElement
    if (!canvas || !section) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const mainScroller = section.closest('main')

    let W = section.clientWidth
    let H = section.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5))

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.z = 16
    camera.position.y = 5

    const scene = new THREE.Scene()
    const tex = makeSprite()

    const SEPARATION = 1.2
    const AMOUNTX = isMobile ? 22 : 42
    const AMOUNTZ = isMobile ? 22 : 42
    const numParticles = AMOUNTX * AMOUNTZ

    const positions = new Float32Array(numParticles * 3)
    const colors = new Float32Array(numParticles * 3)

    let i = 0
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iz = 0; iz < AMOUNTZ; iz++) {
        positions[i * 3] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2)
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = iz * SEPARATION - ((AMOUNTZ * SEPARATION) / 2)
        
        // Electric blue and cyan colors
        colors[i * 3] = 0.2 + (ix / AMOUNTX) * 0.3
        colors[i * 3 + 1] = 0.5 + (iz / AMOUNTZ) * 0.4
        colors[i * 3 + 2] = 1.0

        i++
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.18,
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    let count = 0
    let raf = 0
    let active = false
    let lastFrame = 0

    // Mouse parallax
    const mouse = { x: 0, y: 0 }
    function onMove(e) {
      const r = section.getBoundingClientRect()
      mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      mouse.y = -((e.clientY - r.top) / r.height - 0.5) * 2
    }
    section?.addEventListener('mousemove', onMove)

    function tick(timestamp) {
      raf = 0
      if (!active || document.hidden) return
      if (timestamp - lastFrame >= (isMobile ? 1000 / 30 : 1000 / 60)) {
        lastFrame = timestamp
      
        const positions = particles.geometry.attributes.position.array
        let i = 0
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iz = 0; iz < AMOUNTZ; iz++) {
            positions[i * 3 + 1] = (Math.sin((ix + count) * 0.3) * 1.2) + (Math.sin((iz + count) * 0.5) * 1.2)
            i++
          }
        }
        particles.geometry.attributes.position.needsUpdate = true
      
        count += 0.03
      
        camera.position.x += (mouse.x * 5 - camera.position.x) * 0.05
        camera.position.y += (5 + mouse.y * 3 - camera.position.y) * 0.05
        camera.lookAt(scene.position)

        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(tick)
    }

    function updateActivity() {
      const scrollTop = mainScroller?.scrollTop ?? 0
      active = !mainScroller || (scrollTop >= window.innerHeight * 0.5 && scrollTop < window.innerHeight * 2.5)
      if (active && !document.hidden && !raf) raf = requestAnimationFrame(tick)
      else if ((!active || document.hidden) && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    mainScroller?.addEventListener('scroll', updateActivity, { passive: true })
    document.addEventListener('visibilitychange', updateActivity)
    updateActivity()

    const ro = new ResizeObserver(() => {
      W = section.clientWidth; H = section.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H, false)
    })
    ro.observe(section)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mainScroller?.removeEventListener('scroll', updateActivity)
      document.removeEventListener('visibilitychange', updateActivity)
      section?.removeEventListener('mousemove', onMove)
      geometry.dispose()
      material.dispose()
      tex.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  )
}
