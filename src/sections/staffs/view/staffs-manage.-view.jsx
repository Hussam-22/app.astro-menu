import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import StaffsNewEditForm from 'src/sections/staffs/staffs-new-edit-form';

function BranchManageView() {
  const { id: staffID } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { fsGetStaffInfo } = useAuthContext();

  const {
    data: staffInfo = {},
    error,
    isFetching,
  } = useQuery({
    queryKey: ['staffs', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
  });

  console.log(staffInfo);

  return (
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
  );
}
export default BranchManageView;

// BranchManageView.propTypes = { tables: PropTypes.array };
