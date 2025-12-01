import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export default function Feature({ title, text, imgSrc, reverse = false }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(true)
        obs.unobserve(entries[0].target)
      }
    }, { threshold: 0.2 })

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={`feature ${reverse ? 'reverse' : ''} ${visible ? 'visible' : ''}`}>
      <div className="feature-image">
        <Image src={imgSrc} alt={title} width={220} height={220} />
      </div>
      <div className="feature-content">
        <h2>{title}</h2>
        <p>{text}</p>
        <a href="#signup-section">Learn more →</a>
      </div>
    </div>
  )
}
