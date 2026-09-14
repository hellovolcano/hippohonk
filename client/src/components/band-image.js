import { useSpotifyArtistImage } from '../hooks/useSpotifyArtistImage'
import './band-image.css'

const defaultImg = require('../assets/default.jpg')

const BandImage = (props) => {
    const { imageUrl: spotifyImage } = useSpotifyArtistImage(props.spotifyUrl)

    const src = spotifyImage || defaultImg

    return(
        <div className={`band-image ${props.className || ''}`.trim()}>
            <img src={src} alt="" />
        </div>
    )
}

export default BandImage
