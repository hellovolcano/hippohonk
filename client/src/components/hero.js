import './hero.css'

const Hero = ({title, items}) => {
    return(
        <div className="hero-container">
            <h1>{title}</h1>
        </div>
    )
}

export default Hero