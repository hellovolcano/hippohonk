import HeadphonesIcon from '@mui/icons-material/Headphones';

const FestivalItem = ({festival}) => {
    const {name, date, slug} = festival

    const link = '/festivals/' + slug

    return (
        <div className="festival-item">
            <a href={link}>
                <span><HeadphonesIcon fontSize='large' /></span>
                <h2>{name}</h2>
                <h5>{date}</h5>
            </a>
            </div>
    )
}

export default FestivalItem