import { Grid, Chip } from "@mui/material";

const Festivals = ({festivals}) => {
    return (
        <Grid>
            <Chip label="SXSW 2022" sx={{color: '#2a1706',backgroundColor: 'white',margin: 1}} />
            <Chip label="SXSW 2023" sx={{color: '#2a1706',backgroundColor: 'white',margin: 1}} />
        </Grid>
    )
}

export default Festivals