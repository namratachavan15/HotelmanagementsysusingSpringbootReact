import { useEffect, useRef, useState } from 'react'

/*
Small, dependency-free scroll-reveal hook. Returns a ref to attach to any
element and a boolean that flips to true the first time that element enters
the viewport -- used to trigger a subtle fade-up animation instead of
animating everything on mount. No new libraries added; just IntersectionObserver.

Usage:
  const [ref, isVisible] = useInView();
  <div ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''}`}>...</div>
*/
export function useInView(options = { threshold: 0.15 }) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        // If the browser doesn't support IntersectionObserver, or the user
        // prefers reduced motion, just show content immediately -- no reveal
        // animation, but nothing is ever hidden/broken.
        if (typeof IntersectionObserver === "undefined" ||
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            setIsVisible(true)
            return
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true)
                observer.disconnect()
            }
        }, options)

        observer.observe(node)
        return () => observer.disconnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return [ref, isVisible]
}

export default useInView