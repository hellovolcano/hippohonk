import { useEffect, useMemo, useRef, useState } from 'react'
import './hero.css'
import BandImage from './band-image'

const MAX_CARDS = 10
const CARD_WIDTH = 320
const CARD_GAP = 16

const Hero = ({title, items}) => {
    const cards = useMemo(() => (items || []).slice(0, MAX_CARDS), [items])
    const [activeIndex, setActiveIndex] = useState(0)
    const [visibleCount, setVisibleCount] = useState(1)
    const viewportRef = useRef(null)

    // Figure out how many cards fit side by side based on the viewport's width
    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const measure = () => {
            const width = viewport.clientWidth
            const count = Math.max(1, Math.floor((width + CARD_GAP) / (CARD_WIDTH + CARD_GAP)))
            setVisibleCount(count)
        }

        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(viewport)
        return () => observer.disconnect()
    }, [])

    const perPage = Math.max(1, Math.min(visibleCount, cards.length || 1))
    const numPages = cards.length === 0 ? 0 : Math.ceil(cards.length / perPage)

    // Keep the active page in range if the card list or layout changes
    useEffect(() => {
        setActiveIndex((i) => (numPages === 0 ? 0 : i % numPages))
    }, [numPages])

    const goTo = (index) => {
        if (numPages === 0) return
        setActiveIndex(((index % numPages) + numPages) % numPages)
    }

    return(
        <div className="hero-container">
            <h1>{title}</h1>

            {cards.length === 0 ? (
                <div className="hero-empty">Nothing to show yet</div>
            ) : (
                <div className="hero-carousel">
                    {numPages > 1 && (
                        <button
                            type="button"
                            className="hero-carousel-arrow hero-carousel-arrow-prev"
                            aria-label="Previous"
                            onClick={() => goTo(activeIndex - 1)}
                        >
                            ‹
                        </button>
                    )}

                    <div className="hero-carousel-viewport" ref={viewportRef}>
                        <div
                            className="hero-carousel-track"
                            style={{
                                transform: `translateX(-${activeIndex * 100}%)`,
                                '--visible-count': perPage,
                            }}
                        >
                            {cards.map((item, index) => (
                                <div key={index} className="hero-item">
                                    <div className="hero-card">
                                        {(item.image || item.spotify_url) && (
                                            <BandImage
                                                src={item.image}
                                                spotifyUrl={item.spotify_url}
                                                className="hero-card-image"
                                            />
                                        )}
                                        <div className="hero-card-name">{item.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {numPages > 1 && (
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

            {numPages > 1 && (
                <div className="hero-carousel-dots">
                    {Array.from({ length: numPages }).map((_, index) => (
                        <button
                            type="button"
                            key={index}
                            className={`hero-carousel-dot${index === activeIndex ? ' active' : ''}`}
                            aria-label={`Go to slide ${index + 1}`}
                            onClick={() => goTo(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Hero
