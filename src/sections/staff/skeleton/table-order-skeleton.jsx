import { Stack, Divider, Skeleton } from '@mui/material';

export default function TableOrderSkeleton() {
  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{ py: 2 }}
      divider={<Divider sx={{ borderStyle: 'dashed' }} flexItem orientation="vertical" />}
    >
      <Stack direction="column" spacing={2} sx={{ width: { sm: '40%', lg: '50%' } }}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', width: 80 }} />
        <Skeleton variant="rounded" width="100%" height={60} />
        <Skeleton variant="rounded" width="100%" height={260} />
      </Stack>
      <Stack direction="column" spacing={3} flexGrow={1}>
        <Skeleton variant="text" sx={{ fontSize: '2rem', width: 120 }} />
        {[...Array(6)].map((_, index) => (
          <Stack key={index} direction="column" spacing={1}>
            <Skeleton variant="rounded" width="100%" height={30} />
            <Skeleton variant="rounded" width="100%" height={100} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
