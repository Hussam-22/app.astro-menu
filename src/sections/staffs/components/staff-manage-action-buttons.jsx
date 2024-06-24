import { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import generatePassCode from 'src/utils/generate-passcode';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { rdxSetIsOpen, rdxSetPassCode } from 'src/redux/slices/global';

StaffManageActionButtons.propTypes = {
  staffID: PropTypes.string,
  status: PropTypes.bool,
};

function StaffManageActionButtons({ staffID, status }) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { fsUpdateStaffInfo, user } = useAuthContext();
  const { isOpen, passCode } = useSelector((state) => state.global);

  const PASSWORD_RESET_TEXT = (
    <Typography variant="h1" sx={{ textAlign: 'center' }}>
      {[...passCode].join('-')}
    </Typography>
  );

  const onStatusChange = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsUpdateStaffInfo({ isLoggedIn: false }, staffID, user.id);
    fsUpdateStaffInfo({ isActive: !status }, staffID, user.id);
  };

  const onPassCodeReset = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newPassCode = generatePassCode();
    dispatch(rdxSetPassCode(newPassCode));
    fsUpdateStaffInfo({ isLoggedIn: false }, staffID, user.id);
    fsUpdateStaffInfo({ passCode: newPassCode }, staffID, user.id);
    dispatch(rdxSetIsOpen(true));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staffs'] }),
  });

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="space-between">
        <LoadingButton
          variant="soft"
          size="small"
          color="info"
          onClick={() => mutate(onPassCodeReset)}
          loading={isPending}
        >
          Reset PassCode
        </LoadingButton>
        <LoadingButton
          variant="soft"
          size="small"
          color={status ? 'error' : 'success'}
          onClick={() => mutate(onStatusChange)}
          loading={isPending}
        >
          {status ? 'Disabled & Revoke Access' : 'Enable Access'}
        </LoadingButton>
      </Stack>

      <ConfirmDialog
        title="New Pass Code is"
        content={PASSWORD_RESET_TEXT}
        open={isOpen}
        onClose={() => dispatch(rdxSetIsOpen(false))}
        closeText="Close"
      />
    </>
  );
}

export default memo(StaffManageActionButtons);
