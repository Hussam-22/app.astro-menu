import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import Main from 'src/layouts/staff/main';
import { useAuthContext } from 'src/auth/hooks';
import StaffLoginLayout from 'src/layouts/staff/auth';
import StaffLoginForm from 'src/sections/staff/login-form';
import WaiterView from 'src/sections/staff/view/waiter-view';
import TablesNavVertical from 'src/layouts/staff/tables-nav-vertical';
import StaffHorizontalNav from 'src/layouts/staff/table-nav-horizontal';
import { StaffContextProvider } from 'src/sections/staff/context/staff-context';

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
            <WaiterView>{children}</WaiterView>
          </Main>
        </Box>
      </StaffContextProvider>
    );
}
export default StaffLayout;

StaffLayout.propTypes = { children: PropTypes.node };