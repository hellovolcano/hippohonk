import './band-image.css'
import defaultImg from '../assets/default.jpg'

const BandImage = ({ spotifyImage, className, loading = 'lazy' }) => {
    const src = spotifyImage || defaultImg

    return(
        <div className={`band-image ${className || ''}`.trim()}>
            <img src={src} alt="" loading={loading} />
        </div>
    )
}

export default BandImage
