// @mui
import { Box, Card, Stack, Typography, CardHeader } from '@mui/material';

// ----------------------------------------------------------------------

// WaitersStatistics.propTypes = {
//   title: PropTypes.string,
//   subheader: PropTypes.string,
//   chartData: PropTypes.array.isRequired,
// };

const data = [
  { name: 'Hussam Al Khudari', totalOrders: 20 },
  { name: 'Mohammed Karroum', totalOrders: 41 },
  { name: 'Rashad Al Haj', totalOrders: 57 },
  { name: 'Hisham Al Bayaa', totalOrders: 30 },
  { name: 'Eyad Al Anazi', totalOrders: 5 },
  { name: 'Abood Romanah', totalOrders: 55 },
  { name: 'Abdallah Oddah', totalOrders: 18 },
];

export default function WaitersStatistics() {
  return (
    <Card>
      <CardHeader title="Waiter/Waitress Total Attended Orders" />
      <Stack direction="column" spacing={1} sx={{ p: 3 }}>
        {data
          .sort((a, b) => b.totalOrders - a.totalOrders)
          .map((item) => (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }} key={item.name}>
              <Typography variant="body2">{item.name}</Typography>
              <Typography variant="body2">{item.totalOrders}</Typography>
            </Box>
          ))}
      </Stack>
    </Card>
  );
}
