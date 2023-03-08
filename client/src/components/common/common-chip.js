import { Chip } from "@mui/material";

const CommonChip = ({ genre }) => {
    return (
                <Chip label={genre} sx={{backgroundColor: '#e35a47',color: 'white',margin: 1, padding: 2}}/>
    )
}

export default CommonChip