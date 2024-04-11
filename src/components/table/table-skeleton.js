// @mui
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export default function TableSkeleton({ ...other }) {
  return [...Array(10)].map((_, index) => (
    <TableRow {...other} key={index}>
      <TableCell colSpan={12}>
        <Stack spacing={3} direction="row" alignItems="center">
          <Skeleton variant="rounded" animation="wave" sx={{ width: '15%', height: 22 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: '15%', height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: '15%', height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: '15%', height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: '15%', height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: '15%', height: 12 }} />
        </Stack>
      </TableCell>
    </TableRow>
  ));
}
