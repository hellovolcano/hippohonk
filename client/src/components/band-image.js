const BandImage =(props) => {

    let imgSrc = ""

    if (props.src === "") {
        imgSrc = "../assets/default.jpg"
    } else {
        imgSrc = "https://res.cloudinary.com/hgvtrrtxq/image/upload/" + props.src
    }

    return(
        <div className="band-image">
            <img src={imgSrc} /> 
        </div>
    )
}

export default BandImage