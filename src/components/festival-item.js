const FestivalItem = ({festival}) => {
    const {name, date} = festival

    return (
        <div className="festival-item">
            <h2>{name}</h2>
            <h5>{date}</h5>
        </div>
    )
}

export default FestivalItem