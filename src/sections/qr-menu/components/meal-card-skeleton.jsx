import { Stack, Skeleton } from '@mui/material';

function MealCardSkeleton() {
  return [...Array(3)].map((item, i) => (
    <Stack key={i} direction="column" spacing={2} sx={{ p: 3 }}>
      <Skeleton animation="pulse" variant="h3" width={150} />
      <Stack direction="column" spacing={1}>
        <Skeleton animation="pulse" height={300} />
        <Skeleton animation="pulse" variant="h4" width={250} />
        <Stack direction="row" spacing={1}>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} animation="pulse" variant="h6" width={30} />
          ))}
        </Stack>
        <Skeleton animation="pulse" variant="body2" />
        <Skeleton animation="pulse" variant="body2" />
        <Skeleton animation="pulse" variant="body2" />
        <Skeleton animation="pulse" variant="body2" />
      </Stack>
    </Stack>
  ));
}
export default MealCardSkeleton;
