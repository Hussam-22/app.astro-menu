import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import StaffLoginLayout from 'src/layouts/waiter-staff-dashboard/auth';
import TablesColumn from 'src/layouts/waiter-staff-dashboard/tables-column';
import StaffLoginForm from 'src/sections/waiter-staff-dashboard/login-form';
import StaffView from 'src/sections/waiter-staff-dashboard/view/staff-view';
import StaffHorizontalNav from 'src/layouts/waiter-staff-dashboard/table-nav-horizontal';
import { StaffContextProvider } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function StaffLayout({ children }) {
  const { staff } = useAuthContext();

  if (!staff?.docID || !staff?.isActive || !staff?.isLoggedIn)
    return (
      <StaffContextProvider>
        <StaffLoginLayout>
          <StaffLoginForm />
        </StaffLoginLayout>
      </StaffContextProvider>
    );

  if (staff?.docID && staff?.isActive && staff?.isLoggedIn)
    return (
      <StaffContextProvider>
        <StaffHorizontalNav />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 4fr 3.5fr 1fr',
            mx: 2,
            gap: 1,
            height: 'calc(100vh - 56px)',
          }}
        >
          <TablesColumn />

          <StaffView>{children}</StaffView>
        </Box>
      </StaffContextProvider>
    );
}
export default StaffLayout;

StaffLayout.propTypes = { children: PropTypes.node };
