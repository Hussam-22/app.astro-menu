import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import Main from 'src/layouts/waiter-staff-dashboard/main';
import StaffLoginLayout from 'src/layouts/waiter-staff-dashboard/auth';
import StaffLoginForm from 'src/sections/waiter-staff-dashboard/login-form';
import StaffView from 'src/sections/waiter-staff-dashboard/view/staff-view';
import TablesNavVertical from 'src/layouts/waiter-staff-dashboard/tables-nav-vertical';
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
        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TablesNavVertical />
          <Main>
            <StaffHorizontalNav />
            <StaffView>{children}</StaffView>
          </Main>
        </Box>
      </StaffContextProvider>
    );
}
export default StaffLayout;

StaffLayout.propTypes = { children: PropTypes.node };
