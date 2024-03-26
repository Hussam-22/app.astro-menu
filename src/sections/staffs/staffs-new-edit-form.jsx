import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
// @mui
import { Card, Stack, Button, MenuItem, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import generatePassCode from 'src/utils/generate-passcode';
import FormProvider, {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
  RHFRadioGroup,
} from 'src/components/hook-form';
// ----------------------------------------------------------------------

StaffsNewEditForm.propTypes = {
  staffInfo: PropTypes.object,
};

export default function StaffsNewEditForm({ staffInfo }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewStaff, fsDeleteBranch, fsUpdateStaffInfo, fsGetAllBranches } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: branchesList = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
  });

  const NewUserSchema = Yup.object().shape({
    fullname: Yup.string().required('Full Name is required'),
    branchID: Yup.string().required('Branch is required'),
  });

  const defaultValues = useMemo(
    () => ({
      fullname: staffInfo?.fullname || '',
      type: staffInfo?.type || 'waiter',
      branchID: staffInfo?.branchID || '',
      isActive: !!staffInfo?.isActive,
      passCode: staffInfo?.passCode || generatePassCode(),
    }),
    [staffInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = methods;

  const values = watch();

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['staffs']);
      enqueueSnackbar('Update success!');
      if (!staffInfo?.docID) router.push(paths.dashboard.staffs.list);
    },
  });

  const onSubmit = async (formData) => {
    if (staffInfo?.docID)
      mutate(() => {
        if (!formData.isActive) fsUpdateStaffInfo({ isLoggedIn: false }, staffInfo?.docID);
        fsUpdateStaffInfo(formData, staffInfo.docID);
      });
    if (!staffInfo?.docID) {
      mutate(() => fsAddNewStaff({ formData, isLoggedIn: false }));
    }
  };

  const handleDeleteBranch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsDeleteBranch(staffInfo?.docID);
    queryClient.invalidateQueries({ queryKey: ['branches'] });
    router.push(paths.dashboard.branches.list);
  };

  const onPassCodeReset = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newPassCode = generatePassCode();
    fsUpdateStaffInfo({ isLoggedIn: false }, staffInfo?.docID);
    fsUpdateStaffInfo({ passCode: newPassCode }, staffInfo?.docID);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <RHFRadioGroup
              row
              spacing={4}
              name="type"
              options={[
                { label: 'Chef', value: 'chef' },
                { label: 'Waiter/ess', value: 'waiter' },
              ]}
            />
            <RHFSwitch name="isActive" label="Status" />
          </Stack>
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
          <RHFTextField
            name="passCode"
            label="Pass Code"
            disabled
            InputProps={{
              endAdornment: staffInfo?.docID && (
                <InputAdornment position="end">
                  <LoadingButton
                    type="reset"
                    variant="soft"
                    loading={isPending}
                    onClick={() => mutate(onPassCodeReset)}
                    color="warning"
                  >
                    Reset Pass Code
                    <Iconify
                      icon="grommet-icons:power-reset"
                      width={20}
                      height={20}
                      sx={{ ml: 1 }}
                    />
                  </LoadingButton>
                </InputAdornment>
              ),
            }}
          />

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
    </FormProvider>
  );
}
