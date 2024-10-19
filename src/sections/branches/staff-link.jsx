import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Alert,
  Stack,
  Divider,
  useTheme,
  TextField,
  AlertTitle,
  IconButton,
  Typography,
} from '@mui/material';

import Image from 'src/components/image';
import { DOMAINS } from 'src/config-global';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import generatePassCode from 'src/utils/generate-passcode';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFMultiSelect } from 'src/components/hook-form';

function StaffLink() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { user, fsGetStaffList } = useAuthContext();
  const [filteredStaffList, setFilteredStaffList] = useState([]);

  const staffUrl = (staffID) =>
    `${DOMAINS.menu}/staff/${user.businessProfileID}/${staffID}/dashboard`;

  const copUrlHandler = (staffID) => {
    navigator.clipboard.writeText(staffUrl(staffID));
  };

  const onShare = (staffID) => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Staff Portal Access Link',
          text: 'Each staff has his/her own access link',
          url: staffUrl(staffID),
        })
        .then(() => true)
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Web Share API not supported in your browser.');
    }
  };

  const { data: staffsList = [] } = useQuery({
    queryKey: ['staffs', branchID],
    queryFn: () => fsGetStaffList(),
  });

  useEffect(() => {
    if (staffsList.length !== 0)
      setFilteredStaffList(staffsList.filter((staff) => staff.branchID === branchID));
  }, [branchID, staffsList]);

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
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <TextField
            label="Search Staff by Name"
            fullWidth
            onChange={(event) => onSearchInputChange(event)}
            sx={{ width: '30%' }}
          />
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'grey.400' }} />
          <Box sx={{ width: '70%' }}>
            <AddStaffDropDown staffsList={staffsList} branchID={branchID} />
          </Box>
        </Stack>
      </Card>

      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Note</AlertTitle>
        <Typography>
          For extra layer of protection, each staff has its own dashboard access link
        </Typography>
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
        {filteredStaffList.map((staff) => (
          <Card sx={{ p: 3 }} key={staff.docID}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
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
                value={staffUrl(staff.docID)}
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
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: theme.typography.fontWeightBold }}
                  >
                    Pass Code:
                  </Typography>
                  <Typography>{staff?.passCode}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: theme.typography.fontWeightBold }}
                  >
                    LastLogin:
                  </Typography>
                  {staff?.lastLogIn?.seconds ? (
                    <Typography>{`${new Date(
                      staff.lastLogIn.seconds * 1000
                    ).toDateString()}`}</Typography>
                  ) : (
                    ''
                  )}
                </Stack>
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

  const onBranchRemove = async () => {
    fsUpdateStaffInfo({ isLoggedIn: false }, staffID, user.businessProfileID);
    fsUpdateStaffInfo({ branchID: '' }, staffID, user.businessProfileID);
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
        <LoadingButton
          variant="soft"
          size="small"
          color="secondary"
          onClick={() => mutate(onBranchRemove)}
          loading={isPending}
          startIcon={<Iconify icon="ep:remove-filled" />}
        >
          Remove from Branch
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

// ----------------------------------------------------------------------------
AddStaffDropDown.propTypes = { staffsList: PropTypes.array, branchID: PropTypes.string };

function AddStaffDropDown({ staffsList, branchID }) {
  const { fsUpdateStaffInfo } = useAuthContext();
  const queryClient = useQueryClient();

  const availableStaffs = staffsList
    .filter(
      (staff) => staff.branchID === '' || staff.branchID === undefined || staff.branchID === null
    )
    .map((staff) => ({
      label: staff.fullname,
      value: staff.docID,
      icon: `/assets/icons/staff/${staff.type}-icon.svg`,
    }));

  const { mutate, isPending } = useMutation({
    mutationFn: (staffID) => fsUpdateStaffInfo({ branchID, isLoggedIn: false }, staffID),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staffs'] }),
  });

  const NewUserSchema = Yup.object().shape({
    staffID: Yup.array().min(1, 'Add at least one staff'),
  });

  const defaultValues = useMemo(
    () => ({
      staffIDs: availableStaffs || [],
    }),
    [availableStaffs]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const onSubmit = async (formData) => {
    formData.staffIDs.forEach((staffID) => mutate(staffID));
    reset(defaultValues);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={1} alignItems="center">
        <RHFMultiSelect
          sx={{ width: '75%' }}
          disabled={availableStaffs.length === 0}
          chip
          checkbox
          name="staffIDs"
          label="Select Staff to Add"
          options={[...availableStaffs]}
        />
        <LoadingButton
          type="submit"
          disabled={!isDirty}
          loading={isPending}
          variant="contained"
          color="secondary"
          sx={{ width: '25%', minWidth: 'fit-content' }}
        >
          Add to branch
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
