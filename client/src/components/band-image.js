import { useSpotifyArtistImage } from '../hooks/useSpotifyArtistImage'

const defaultImg = require('../assets/default.jpg')

const BandImage = (props) => {
    const { imageUrl: spotifyImage } = useSpotifyArtistImage(props.spotifyUrl)

    const src = spotifyImage
        ? spotifyImage
        : props.src
        ? "https://res.cloudinary.com/hgvtrrtxq/image/upload/" + props.src
        : defaultImg

    return(
        <div className="band-image">
            <img src={src} alt="" />
        </div>
    )
}

export default BandImage
