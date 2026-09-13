import { useEffect, useMemo, useState } from 'react'
import './hero.css'

const MAX_CARDS = 10
const AUTO_ADVANCE_MS = 4000

const Hero = ({title, items}) => {
    const cards = useMemo(() => (items || []).slice(0, MAX_CARDS), [items])
    const [activeIndex, setActiveIndex] = useState(0)

    // Keep the active slide in range if the card list changes size
    useEffect(() => {
        setActiveIndex((i) => (cards.length === 0 ? 0 : i % cards.length))
    }, [cards.length])

    useEffect(() => {
        if (cards.length <= 1) return

        const interval = setInterval(() => {
            setActiveIndex((i) => (i + 1) % cards.length)
        }, AUTO_ADVANCE_MS)

        return () => clearInterval(interval)
    }, [cards.length])

    const goTo = (index) => {
        setActiveIndex(((index % cards.length) + cards.length) % cards.length)
    }

    return(
        <div className="hero-container">
            <h1>{title}</h1>

            {cards.length === 0 ? (
                <div className="hero-empty">Nothing to show yet</div>
            ) : (
                <div className="hero-carousel">
                    <button
                        type="button"
                        className="hero-carousel-arrow hero-carousel-arrow-prev"
                        aria-label="Previous"
                        onClick={() => goTo(activeIndex - 1)}
                    >
                        ‹
                    </button>

                    <div className="hero-carousel-viewport">
                        <div
                            className="hero-carousel-track"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {cards.map((item, index) => (
                                <div key={index} className="hero-item">
                                    <div className="hero-card">
                                        {item.image && (
                                            <img className="hero-card-image" src={item.image} alt={item.name} />
                                        )}
                                        <div className="hero-card-name">{item.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="hero-carousel-arrow hero-carousel-arrow-next"
                        aria-label="Next"
                        onClick={() => goTo(activeIndex + 1)}
                    >
                        ›
                    </button>
                </div>
            )}

            {cards.length > 1 && (
                <div className="hero-carousel-dots">
                    {cards.map((_, index) => (
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
