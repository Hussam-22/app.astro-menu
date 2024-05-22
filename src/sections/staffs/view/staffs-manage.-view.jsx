import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RoleBasedGuard } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import StaffsNewEditForm from 'src/sections/staffs/staffs-new-edit-form';

function StaffsManageView() {
  const { id: staffID } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const {
    fsGetStaffInfo,
    businessProfile: { role },
  } = useAuthContext();

  const {
    data: staffInfo = {},
    error,
    isFetching,
  } = useQuery({
    queryKey: ['staffs', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
  });

  return (
    <RoleBasedGuard hasContent roles={[role]} sx={{ py: 10 }}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={staffInfo?.fullname || ''}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Staffs', href: paths.dashboard.staffs.list },
            { name: staffInfo?.fullname || '' },
          ]}
          action={
            <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
              ID: {staffInfo?.docID}
            </Typography>
          }
        />
        <StaffsNewEditForm staffInfo={staffInfo} />
      </Container>
    </RoleBasedGuard>
  );
}
export default StaffsManageView;
