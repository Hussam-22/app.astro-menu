// @mui
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// layouts
import CompactLayout from 'src/layouts/compact';
// components
import { RouterLink } from 'src/routes/components';
// assets
import { SeverErrorIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

export default function Page500() {
  return (
    <CompactLayout>
      <Box>
        <Typography variant="h3" paragraph>
          500 Internal Server Error
        </Typography>
      </Box>

      <Box>
        <Typography sx={{ color: 'text.secondary' }}>
          There was an error, please try again later.
        </Typography>
      </Box>

      <Box>
        <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
      </Box>

      <Button component={RouterLink} href="/" size="large" variant="contained">
        Go to Home
      </Button>
    </CompactLayout>
  );
}
