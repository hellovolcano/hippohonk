import { useState, useEffect } from 'react'
import { LinearProgress } from '@mui/material'
import { Link } from 'react-router-dom'
import { Chip } from '@mui/material'
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded'

import SectionWrapper from '../components/common/section-wrapper'
import BandImage from '../components/band-image'

const BandList = () => {

    const [bands, setBands] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // console.log("hello")
        fetch('http://localhost:3001/api/bands/')
            .then((response) => response.json())
            .then((data) => {
                setBands(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err.message);
            })  
    }, [])

    return(
        <div className="bandlist-wrapper">
        <SectionWrapper title="Bands">
            <div>
                {isLoading ? <LinearProgress sx={{color: "white"}}/> : 
                bands.map((band, i) => (
                    <div key={i} className={i % 2 ? "band-row" : "band-row-alt"}>
                        <div className="band-container">
                            <BandImage src={band.image} />
                            <div className="band-info">
                                <div>
                                    <span className="band-name">{band.name}</span>
                                    <span className="band-location">{band.location}</span>
                                </div>
                                <div className="band-details">
                                    <Chip label={band.average_rating} color="success" variant="outlined" icon={<RecommendRoundedIcon fontSize='small'/>} />
                                    {/* <Chip label={band.popularity} color="warning" variant="outlined" /> */}
                                    <span className="band-description">{band.description}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className="band-rank">#{i+1}</span>
                        </div>
                        
                    </div>
                ))}
            </div>
        </SectionWrapper>
        </div>
    )
}

export default BandList
