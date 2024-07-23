import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import CompactLayout from 'src/layouts/compact';
import { RouterLink } from 'src/routes/components';
import { ForbiddenIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

export default function View403() {
  return (
    <CompactLayout>
      <Box>
        <Typography variant="h3" paragraph>
          No permission
        </Typography>
      </Box>

      <Box>
        <Typography sx={{ color: 'text.secondary' }}>
          The page you&apos;re trying access has restricted access.
          <br />
          Please refer to your system administrator
        </Typography>
      </Box>

      <Box>
        <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
      </Box>

      <Button component={RouterLink} href="/" size="large" variant="contained">
        Go to Home
      </Button>
    </CompactLayout>
  );
}
