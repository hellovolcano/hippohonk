const defaultImg = require('../assets/default.jpg')

const BandImage =(props) => {
    return(
        <div className="band-image">
            {props.src ?
                <img src={"https://res.cloudinary.com/hgvtrrtxq/image/upload/" + props.src} /> :
                <img src={defaultImg} /> 
            } 

        </div>
    )
}

export default BandImage
