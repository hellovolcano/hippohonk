import { useState } from 'react'
import { CircularProgress } from '@mui/material'
import { Chip, Stack } from '@mui/material'
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded'
import { Pagination } from '@mui/material'
import styled from '@emotion/styled'

import SectionWrapper from './common/section-wrapper'
import BandImage from './band-image'


const BandList = ({bands, isLoading, title}) => {

    // const {title} = title
    console.log(bands)
    if (title !== "Bands") {
        const {band} = bands
        console.log(band)
    }

    const MyPagination = styled(Pagination)({
        "& .MuiPaginationItem-root": {
            backgroundColor: "#FEF5F4",
            border: "1px solid #e35a47",
            color: "#000"
           },
        '& .Mui-selected': {
          backgroundColor: '#e35a47',
          color:'#fff',
         }
        
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [bandsPerPage] = useState(10)


    // Pagination-related variables 
    const indexOfLastBand = currentPage * bandsPerPage
    const indexOfFirstBand = indexOfLastBand - bandsPerPage
    const currentBands = bands.slice(indexOfFirstBand, indexOfLastBand)
    const numPages = Math.ceil(bands.length / bandsPerPage)
    const rankMultiplier = (currentPage - 1) * bandsPerPage
   
    const handlePageChange = (event, value) => {
        // console.log(event.target.value)
        setCurrentPage(value)
    }

    return(
        <div className="bandlist-wrapper">
        <SectionWrapper title={title}>
            <div>
                {isLoading ? 
                <Stack alignItems="center" margin="50px">
                    <CircularProgress/>
                </Stack> : 
                currentBands.map((band, i) => (
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
                            <span className="band-rank">#{currentPage === 1 ? i + 1 : i + 1 + rankMultiplier}</span>
                        </div>
                        
                    </div>
                ))}
            </div>
        </SectionWrapper>
        <Stack alignItems="center" margin="20px">
            <MyPagination  count={numPages}  variant="outlined" size="large" siblingCount={2} page={currentPage} onChange={handlePageChange} sx={{textAlign: "center"}} />
        </Stack>
        </div>
    )
}

export default BandList
