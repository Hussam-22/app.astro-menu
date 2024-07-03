import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  Divider,
  useTheme,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import generatePassCode from 'src/utils/generate-passcode';
import { ConfirmDialog } from 'src/components/custom-dialog';

function StaffLink() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { user, fsGetStaffList } = useAuthContext();
  const [filteredStaffList, setFilteredStaffList] = useState([]);

  const copUrlHandler = (staffID) => {
    navigator.clipboard.writeText(
      `${window.location.protocol}//${window.location.host}/staff/${user.businessProfileID}/${staffID}`
    );
  };

  const onShare = (staffID) => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Staff Portal Access Link',
          text: 'Each staff has his/her own access link',
          url: `${window.location.protocol}//${window.location.host}/staff/${user.businessProfileID}/${staffID}`,
        })
        .then(() => true)
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Web Share API not supported in your browser.');
    }
  };

  const { data: staffsList = [], error } = useQuery({
    queryKey: ['staffs', user.businessProfileID, branchID],
    queryFn: () => fsGetStaffList(branchID),
  });

  useEffect(() => {
    if (staffsList.length !== 0) setFilteredStaffList(staffsList);
  }, [staffsList]);

  const onSearchInputChange = (e) => {
    if (e.target.value)
      setFilteredStaffList(
        staffsList.filter((staff) =>
          staff.fullname.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    if (!e.target.value) setFilteredStaffList(staffsList);
  };

  return (
    <>
      <Card sx={{ p: 3, mb: 2 }}>
        <TextField
          label="Search Staff by Name"
          fullWidth
          onChange={(event) => onSearchInputChange(event)}
        />
      </Card>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
        {filteredStaffList.map((staff) => (
          <Card sx={{ p: 3 }} key={staff.docID}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {staff.docID}
              </Typography>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  bgcolor: staff.isActive ? 'success.main' : 'error.main',
                  borderRadius: '50%',
                }}
              />
            </Stack>
            <Stack direction="column" spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Image
                  src={`/assets/icons/staff/${staff.type}-icon.svg`}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="h4">{staff.fullname}</Typography>
              </Stack>
              <TextField
                name="URL"
                value={`${window.location.protocol}//${window.location.host}/staff/${user.businessProfileID}/${staff.docID}`}
                size="small"
                fullWidth
                aria-readonly
                InputProps={{
                  endAdornment: (
                    <Stack direction="row" spacing={1} sx={{ pl: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ p: 0, m: 0 }}
                        onClick={() => copUrlHandler(staff.docID)}
                      >
                        <Iconify icon="mdi:clipboard-multiple-outline" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ p: 0, m: 0 }}
                        onClick={() => onShare(staff.docID)}
                      >
                        <Iconify icon="ic:baseline-share" />
                      </IconButton>
                    </Stack>
                  ),
                }}
              />
              <Stack direction="column">
                <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                  LastLogin:
                </Typography>
                {staff?.lastLogIn?.seconds ? (
                  <Typography variant="caption">{`${new Date(
                    staff.lastLogIn.seconds * 1000
                  ).toDateString()}`}</Typography>
                ) : (
                  ''
                )}
              </Stack>
            </Stack>
            <Divider sx={{ borderStyle: 'dashed', mt: 1, mb: 2 }} />
            <ActionButtons staffID={staff.docID} status={staff.isActive} />
          </Card>
        ))}
      </Box>
    </>
  );
}

export default StaffLink;

// ----------------------------------------------------------------------------

ActionButtons.propTypes = { staffID: PropTypes.string, status: PropTypes.bool };

function ActionButtons({ staffID, status }) {
  const queryClient = useQueryClient();
  const { fsUpdateStaffInfo, user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [newPassCode, setNewPassCode] = useState('');

  const PASSWORD_RESET_TEXT = (
    <Typography variant="h1" sx={{ textAlign: 'center' }}>
      {[...newPassCode].join('-')}
    </Typography>
  );

  const onStatusChange = async () => {
    fsUpdateStaffInfo({ isLoggedIn: false }, staffID, user.businessProfileID);
    fsUpdateStaffInfo({ isActive: !status }, staffID, user.businessProfileID);
  };

  const onPassCodeReset = async () => {
    const passCode = generatePassCode();
    setNewPassCode(passCode);
    fsUpdateStaffInfo({ isLoggedIn: false }, staffID, user.businessProfileID);
    fsUpdateStaffInfo({ passCode }, staffID, user.businessProfileID);
    setIsOpen(true);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staffs'] }),
  });

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <LoadingButton
          variant="soft"
          size="small"
          color={status ? 'error' : 'success'}
          onClick={() => mutate(onStatusChange)}
          loading={isPending}
          startIcon={
            <Iconify
              icon={status ? 'solar:user-block-rounded-broken' : 'solar:user-check-broken'}
            />
          }
        >
          {status ? 'Revoke Access' : 'Enable Access'}
        </LoadingButton>
        <LoadingButton
          variant="soft"
          size="small"
          color="warning"
          onClick={() => mutate(onPassCodeReset)}
          loading={isPending}
          startIcon={<Iconify icon="fluent:key-reset-20-filled" />}
        >
          Reset PassCode
        </LoadingButton>
      </Stack>

      <ConfirmDialog
        title="New Pass Code is"
        content={PASSWORD_RESET_TEXT}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
