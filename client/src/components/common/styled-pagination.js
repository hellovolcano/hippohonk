import { Pagination } from '@mui/material'
import styled from '@emotion/styled'

const StyledPagination = styled(Pagination)(({ theme }) => ({
    '& .MuiPaginationItem-root': {
        backgroundColor: theme.palette.info.main,
        border: `1px solid ${theme.palette.primary.main}`,
        color: '#000',
    },
    '& .Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
}))

export default StyledPagination
