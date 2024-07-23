import PropTypes from 'prop-types';

import { Box } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Image from 'src/components/image';

// ----------------------------------------------------------------------

export default function RoleBasedGuard({ hasContent, roles, children, sx }) {
  if (typeof roles !== 'undefined' && !roles.includes('full')) {
    return hasContent ? (
      <Container sx={{ textAlign: 'center', ...sx }}>
        <Box>
          <Typography variant="h3" paragraph>
            Permission Denied
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page
          </Typography>
        </Box>

        <Box>
          {/* <ForbiddenIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          /> */}
          <Image
            src="/assets/illustrations/no-access.svg"
            alt="No Access"
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </Box>
      </Container>
    ) : null;
  }

  return <> {children} </>;
}

RoleBasedGuard.propTypes = {
  children: PropTypes.node,
  hasContent: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
  sx: PropTypes.object,
};
