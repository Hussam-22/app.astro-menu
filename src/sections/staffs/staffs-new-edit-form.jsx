import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Box } from '@mui/system';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
// @mui
import { Card, Stack, Button, MenuItem } from '@mui/material';

import Image from 'src/components/image';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFSelect, RHFTextField, RHFRadioGroup } from 'src/components/hook-form';
import StaffManageActionButtons from 'src/sections/staffs/components/staff-manage-action-buttons';
// ----------------------------------------------------------------------

StaffsNewEditForm.propTypes = {
  staffInfo: PropTypes.object,
};

export default function StaffsNewEditForm({ staffInfo }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewBranch, fsDeleteBranch, fsUpdateStaffInfo, fsGetAllBranches } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: branchesList = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
  });

  const NewUserSchema = Yup.object().shape({
    fullname: Yup.string().required('Full Name is required'),
    type: Yup.mixed().required('Type is required'),
  });

  const defaultValues = useMemo(
    () => ({
      fullname: staffInfo?.fullname || '',
      type: staffInfo?.type || 'waiter',
      branchID: staffInfo?.branchID || null,
      isActive: !!staffInfo?.isActive,
      passCode: staffInfo?.cover || '',
    }),
    [staffInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    getFieldState,
    formState: { isDirty, dirtyFields },
  } = methods;

  const values = watch();

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['staffs']);
      setTimeout(() => {
        queryClient.invalidateQueries(['staffs', staffInfo?.docID]);
      }, 1000);
      enqueueSnackbar('Update success!');
      if (!staffInfo?.docID) router.push(paths.dashboard.branches.list);
    },
  });

  const onSubmit = async (formData) => {
    if (staffInfo?.docID)
      mutate(() =>
        fsUpdateStaffInfo(
          {
            ...formData,
            docID: staffInfo?.docID,
          },
          staffInfo.docID
        )
      );
    if (!staffInfo?.docID) {
      mutate(() => fsAddNewBranch(formData));
    }
  };

  const handleDeleteBranch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsDeleteBranch(staffInfo?.docID);
    queryClient.invalidateQueries({ queryKey: ['branches'] });
    router.push(paths.dashboard.branches.list);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid xs={4}>
          <Card sx={{ p: 3, position: 'relative' }}>
            <Box
              sx={{
                width: 18,
                height: 18,
                bgcolor: values.isActive ? 'success.main' : 'error.main',
                borderRadius: '50%',
                position: 'absolute',
                top: 15,
                right: 15,
              }}
            />
            <Stack direction="column" spacing={2} justifyContent="center" alignItems="center">
              <Image
                disabledEffect
                src={`/assets/icons/staff/${values.type}-body.svg`}
                sx={{
                  borderRadius: '50%',
                  border: 'solid 3px #000000',
                  width: 175,
                  height: 175,
                  mr: 2,
                  p: 1,
                }}
              />
              <StaffManageActionButtons staffID={staffInfo.docID} status={staffInfo.isActive} />
            </Stack>
          </Card>
        </Grid>
        <Grid xs={8}>
          <Card sx={{ p: 3 }}>
            <Stack direction="column" spacing={2}>
              <RHFRadioGroup
                row
                spacing={4}
                name="type"
                options={[
                  { label: 'Chef', value: 'chef' },
                  { label: 'Waiter/ess', value: 'waiter' },
                ]}
              />
              <RHFTextField name="fullname" label="Full Name" />

              {!isLoading && (
                <RHFSelect name="branchID" label="Branch">
                  <MenuItem value={null} />
                  {branchesList.map((branch) => (
                    <MenuItem key={branch.docID} value={branch.docID}>
                      {branch.title}
                    </MenuItem>
                  ))}
                </RHFSelect>
              )}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="contained" color="error" sx={{ alignSelf: 'flex-end' }}>
                  Delete
                </Button>
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-end' }}>
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
