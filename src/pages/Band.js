import bands from '../data/test-data'

import { Box } from '@mui/material'

import CommonChip from '../components/common/common-chip'
import StreamingLinks from '../components/streaming-links'
import Ratings from '../components/ratings'
import SectionWrapper from '../components/common/section-wrapper'
import Button from '../components/common/forms/button'
import DropDown from '../components/common/forms/drop-down'
import InputField from '../components/common/forms/input-field'

const Band = () => {
    // Hardcoded for now as a placeholder--need to add auth
    const isLoggedIn = false

    return (
        <div>
            {isLoggedIn && 
                <div className="reviewer-banner">
                    <Button>Edit Band</Button>
                    <Button>Delete</Button>
                </div>}
            <Box sx={{
                padding: 1,
                width: '90%'

            }}
            className="band-wrapper">
                <SectionWrapper title={bands[0].Name}>
                    <p>{bands[0].Description}</p>
                    <CommonChip items={bands[0].Genre} />
                    <StreamingLinks />
                </SectionWrapper>
                <div className="right-band-info">
                    
                    <SectionWrapper title="Festivals">
                        <CommonChip items={bands[0].Festivals} />
                    </SectionWrapper>
                    
                    <SectionWrapper title="Ratings">
                        <DropDown options={["Yes","No"]} />
                        <InputField type="text" name="submit" />
                        <Ratings />
                    </SectionWrapper>
                    
                </div>

            </Box>
        </div>
    )
}

export default Band