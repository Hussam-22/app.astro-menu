// @mui
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export default function TableSkeleton({ ...other }) {
  return (
    <TableRow {...other}>
      <TableCell colSpan={12}>
        <Stack spacing={3} direction="row" alignItems="center">
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{ borderRadius: 1.5, width: 48, height: 48, flexShrink: 0 }}
          />
          <Skeleton variant="rounded" animation="wave" sx={{ width: 1, height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: 180, height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: 160, height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: 140, height: 12 }} />
          <Skeleton variant="rounded" animation="wave" sx={{ width: 120, height: 12 }} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}
