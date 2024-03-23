import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import BranchSocialLinks from 'src/sections/branches/components/BranchSocialLinks';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
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

  console.log(branchesList);

  const NewUserSchema = Yup.object().shape({
    fullname: Yup.string().required('Full Name is required'),
    type: Yup.mixed().required('Type is required'),
  });

  const defaultValues = useMemo(
    () => ({
      fullname: staffInfo?.fullname || '',
      type: staffInfo?.type || '',
      branchID: staffInfo?.branchID || '',
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
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
        {staffInfo?.docID && (
          <LoadingButton
            variant="contained"
            loading={isPending}
            color="error"
            onClick={handleDeleteBranch}
          >
            Delete Branch
          </LoadingButton>
        )}

        <LoadingButton
          type="submit"
          variant="contained"
          color="success"
          loading={isPending}
          disabled={!isDirty}
        >
          Save
        </LoadingButton>
      </Stack>
      <Stack direction="column" spacing={2}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h3">Branch Info</Typography>
              <Stack direction="column" alignItems="flex-end">
                <RHFSwitch
                  name="isActive"
                  labelPlacement="start"
                  label={values.isActive ? `Branch is Active` : `Branch is Inactive`}
                  sx={{ alignItems: 'center' }}
                />
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  When branch is inactive, customers cant view menu and waiters cant take orders
                </Typography>
              </Stack>
            </Stack>
            <RHFTextField name="title" label="Name" />
            <RHFTextField name="description" label="About" multiline rows={3} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
              <RHFTextField name="wifiPassword" label="Wifi Password" />
              <RHFTextField name="taxValue" label="Tax Value" type="number" />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
              <RHFSelect name="defaultLanguage" label="Default Menu Language">
                {branchesList.map((branch) => (
                  <MenuItem key={branch.docID} value={branch.docID}>
                    {branch.title}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <BranchSocialLinks />
        </Card>
      </Stack>
    </FormProvider>
  );
}
