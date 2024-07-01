import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import StaffLoginLayout from 'src/layouts/waiter-staff-dashboard/auth';
import StaffView from 'src/sections/waiter-staff-dashboard/view/staff-view';
import TablesColumn from 'src/layouts/waiter-staff-dashboard/tables-column';
import StaffLoginForm from 'src/sections/waiter-staff-dashboard/login-form';
import StaffHorizontalNav from 'src/layouts/waiter-staff-dashboard/table-nav-horizontal';
import { StaffContextProvider } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function StaffLayout({ children }) {
  const { businessProfileID, staffID } = useParams();
  const { staff, fsGetStaffInfo } = useAuthContext();

  const { data: staffInfo = {} } = useQuery({
    queryFn: () => fsGetStaffInfo(staffID, businessProfileID),
    queryKey: ['staff', businessProfileID, staffID],
  });

  if (!staff.isLoggedIn)
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
            gridTemplateColumns: '1.5fr 4fr 3fr 1.5fr',
            mx: 2,
            gap: 1,
            pb: 4,
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
