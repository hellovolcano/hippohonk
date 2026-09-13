import { Chip } from "@mui/material";

const CommonChip = ({ genre }) => {
    return (
                <Chip label={genre} sx={{bgcolor: 'primary.main', color: 'white', margin: 1, padding: 2}}/>
    )
}

export default CommonChip