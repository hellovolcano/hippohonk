import { Grid, Chip } from "@mui/material";

const CommonChip = ({ items }) => {
    return (
        <Grid>
            {/* Add a chip for each genre */}
            {items.map((item) => (
                <Chip key={item} label={item} sx={{color: '#2a1706',backgroundColor: 'white',margin: 1}}/>
            ))}
        </Grid>
    )
}

export default CommonChip