import { Chip } from "@mui/material";

const CommonChip = ({ genre, href }) => {
    const linkProps = href ? { component: 'a', href, clickable: true } : {};

    return (
                <Chip
                    label={genre}
                    {...linkProps}
                    sx={{bgcolor: 'primary.main', color: 'white', margin: 1, padding: 2}}
                />
    )
}

export default CommonChip