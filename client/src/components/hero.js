import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './hero.css'
import BandImage from './band-image'

const MAX_CARDS = 10
const CARD_WIDTH = 320
const CARD_GAP = 16

const Hero = ({title, items, getHref}) => {
    const cards = useMemo(() => (items || []).slice(0, MAX_CARDS), [items])
    const [visibleCount, setVisibleCount] = useState(1)
    const observerRef = useRef(null)

    // Figure out how many cards fit side by side based on the viewport's width.
    // A callback ref (rather than useEffect on mount) is required here because
    // the viewport element doesn't exist yet while cards are still loading
    // (the "empty" branch renders instead), so a mount-only effect would miss it.
    const setViewportRef = useCallback((node) => {
        if (observerRef.current) {
            observerRef.current.disconnect()
            observerRef.current = null
        }

        if (!node) return

        const measure = () => {
            const width = node.clientWidth
            const count = Math.max(1, Math.floor((width + CARD_GAP) / (CARD_WIDTH + CARD_GAP)))
            setVisibleCount(count)
        }

        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(node)
        observerRef.current = observer
    }, [])

    const perPage = Math.max(1, Math.min(visibleCount, cards.length || 1))
    const numPages = cards.length === 0 ? 0 : Math.ceil(cards.length / perPage)
    const looping = numPages > 1

    // Real pages live at extended indexes 1..numPages. Index 0 is a clone of the
    // last page and index numPages+1 is a clone of the first page, so paging past
    // either end slides into a lookalike page instead of stopping.
    const extendedCards = useMemo(() => {
        if (!looping) return cards
        return [...cards.slice(-perPage), ...cards, ...cards.slice(0, perPage)]
    }, [cards, perPage, looping])

    const [activeIndex, setActiveIndex] = useState(looping ? 1 : 0)
    const [transitionEnabled, setTransitionEnabled] = useState(true)

    // Reset to the first real page whenever the page layout changes (e.g. resize)
    useEffect(() => {
        setTransitionEnabled(false)
        setActiveIndex(looping ? 1 : 0)
    }, [numPages, looping])

    // Re-enable the slide transition on the next frame after any silent snap
    useEffect(() => {
        if (transitionEnabled) return
        const raf = requestAnimationFrame(() => setTransitionEnabled(true))
        return () => cancelAnimationFrame(raf)
    }, [transitionEnabled])

    const goTo = (nextIndex) => {
        if (numPages === 0) return
        setTransitionEnabled(true)
        setActiveIndex(nextIndex)
    }

    // When a slide lands on a cloned buffer page, silently snap (no transition)
    // to the matching real page right after the animation finishes
    const handleTransitionEnd = () => {
        if (!looping) return
        if (activeIndex === 0) {
            setTransitionEnabled(false)
            setActiveIndex(numPages)
        } else if (activeIndex === numPages + 1) {
            setTransitionEnabled(false)
            setActiveIndex(1)
        }
    }

    // Map the (possibly cloned) active index back to a real 0-based page for the dots
    const activePage = looping ? ((activeIndex - 1) % numPages + numPages) % numPages : activeIndex

    return(
        <div className="hero-container">
            <h1>{title}</h1>

            {cards.length === 0 ? (
                <div className="hero-empty">Nothing to show yet</div>
            ) : (
                <div className="hero-carousel">
                    {looping && (
                        <button
                            type="button"
                            className="hero-carousel-arrow hero-carousel-arrow-prev"
                            aria-label="Previous"
                            onClick={() => goTo(activeIndex - 1)}
                        >
                            ‹
                        </button>
                    )}

                    <div className="hero-carousel-viewport" ref={setViewportRef}>
                        <div
                            className="hero-carousel-track"
                            onTransitionEnd={handleTransitionEnd}
                            style={{
                                transform: `translateX(-${activeIndex * 100}%)`,
                                transition: transitionEnabled ? undefined : 'none',
                                '--visible-count': perPage,
                            }}
                        >
                            {extendedCards.map((item, index) => {
                                const href = getHref ? getHref(item) : undefined
                                const CardTag = href ? 'a' : 'div'

                                return (
                                    <div key={index} className="hero-item">
                                        <CardTag className="hero-card" href={href}>
                                            {item.spotify_url && (
                                                <BandImage
                                                    spotifyUrl={item.spotify_url}
                                                    className="hero-card-image"
                                                />
                                            )}
                                            <div className="hero-card-name">{item.name}</div>
                                        </CardTag>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {looping && (
                        <button
                            type="button"
                            className="hero-carousel-arrow hero-carousel-arrow-next"
                            aria-label="Next"
                            onClick={() => goTo(activeIndex + 1)}
                        >
                            ›
                        </button>
                    )}
                </div>
            )}

            {looping && (
                <div className="hero-carousel-dots">
                    {Array.from({ length: numPages }).map((_, index) => (
                        <button
                            type="button"
                            key={index}
                            className={`hero-carousel-dot${index === activePage ? ' active' : ''}`}
                            aria-label={`Go to slide ${index + 1}`}
                            onClick={() => goTo(index + 1)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Hero
