import { Box } from '@mui/material'

import CommonChip from '../components/common/common-chip'
import StreamingLinks from '../components/streaming-links'
import Ratings from '../components/ratings'
import SectionWrapper from '../components/common/section-wrapper'
import Button from '../components/common/forms/button'
import DropDown from '../components/common/forms/drop-down'
import InputField from '../components/common/forms/input-field'
import BandImage from '../components/band-image'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Band = () => {
    // Hardcoded for now as a placeholder--need to add auth
    const isLoggedIn = false
    const {id}  = useParams()
    const apiLink = '/api/bands/' + id

    const [bandInfo, setBandInfo] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        fetch(apiLink)
            .then((response) => response.json())
            .then((data) => {

                setBandInfo(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err.message);
            })  
    }, [])

    console.log(bandInfo)

    return (
        <div className="single-band-main-wrapper">
            {/* {bandInfo.name} */}
            {isLoggedIn && 
                <div className="reviewer-banner">
                    <Button>Edit Band</Button>
                    <Button>Delete</Button>
                </div>}
            <div className="band-wrapper">
                <div className='section-wrapper white-bg'>
                    {/* <div className="single-band-right-div"> */}
                        <div className='section-title single-band-divs'>
                            
                            <BandImage src={bandInfo.image} />
                            <div>
                                <h1 className='section-title'>{bandInfo.name}</h1>
                                <span>{bandInfo.location}</span>
                            </div>
                        </div>
                        <div className="single-band-page">
                            <div className="single-band-right-div">
                                <div className="single-band-description">{bandInfo.description}</div>
                            </div>
                    
                            <div className="right-band-info">
                                <SectionWrapper title="Band Links" className="h3-section-wrapper">

                                </SectionWrapper>
                                
                                <SectionWrapper title="Genre" className="h3-section-wrapper">
                                    <CommonChip genre={bandInfo.genre_name} /> 
                                </SectionWrapper>
                            </div>
                        </div>
                </div>
            </div>
        </div>

    )
}

export default Band