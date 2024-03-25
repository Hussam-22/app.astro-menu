import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Card, useTheme, Skeleton, Container, Typography } from '@mui/material';

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
      {!isFetching && <StaffsNewEditForm staffInfo={staffInfo} />}
      {isFetching && <StaffsSkeleton />}
    </Container>
  );
}
export default BranchManageView;

function StaffsSkeleton() {
  <Grid container spacing={2}>
    <Grid sx={4}>
      <Card>
        <Skeleton variant="rectangular" sx={{ width: 100, height: 250 }} />
      </Card>
    </Grid>
    <Grid sx={6}>
      <Card>
        <Skeleton variant="rectangular" sx={{ width: 100, height: 250 }} />
      </Card>
    </Grid>
  </Grid>;
}
