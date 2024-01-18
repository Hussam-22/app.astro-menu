import { Skeleton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

function TableInfoSkeleton() {
  return (
    <>
      <Grid sm={8}>
        <Skeleton variant="rounded" animation="wave" sx={{ height: 365 }} />
      </Grid>
      <Grid sm={4}>
        <Skeleton variant="rounded" animation="wave" sx={{ height: 365 }} />
      </Grid>
      <Grid sm={12}>
        <Skeleton variant="rounded" animation="wave" sx={{ height: 665 }} />
      </Grid>
    </>
  );
}
export default TableInfoSkeleton;
