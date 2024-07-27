import PropTypes from 'prop-types';
import { useLocation } from 'react-router';

import { Box } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Image from 'src/components/image';
import { useGetProductInfo } from 'src/hooks/use-get-product';

// ----------------------------------------------------------------------

export default function RoleBasedGuard({ hasContent, children, sx }) {
  const location = useLocation();
  const { role, isMenuOnly } = useGetProductInfo();
  const accessRoles = location.pathname.includes('subscription-info')
    ? ['full']
    : [role, isMenuOnly && location.pathname.includes('staffs') ? 'menuOnly' : ''];

  if (
    typeof accessRoles !== 'undefined' &&
    (!accessRoles.includes('full') || accessRoles.includes('menuOnly'))
  ) {
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
  // roles: PropTypes.arrayOf(PropTypes.string),
  sx: PropTypes.object,
};
