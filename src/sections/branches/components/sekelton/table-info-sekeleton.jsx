import { Skeleton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

function TableInfoSkeleton() {
  return (
    <Grid container spacing={2}>
      <Grid sm={8}>
        <Skeleton variant="rounded" animation="wave" sx={{ width: '100%', height: 400 }} />
      </Grid>
      <Grid sm={4}>
        <Skeleton variant="rounded" animation="wave" sx={{ width: '100%', height: 400 }} />
      </Grid>
    </Grid>
  );
}
export default TableInfoSkeleton;
