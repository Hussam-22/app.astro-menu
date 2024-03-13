import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  Divider,
  useTheme,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

function StaffLink() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { user, fsGetStaffList } = useAuthContext();
  const [filteredStaffList, setFilteredStaffList] = useState([]);

  const copUrlHandler = (staffID) => {
    navigator.clipboard.writeText(
      `${window.location.protocol}//${window.location.host}/staff/${user.id}/${staffID}`
    );
  };

  const onShare = (staffID) => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Staff Portal Access Link',
          text: 'Each staff has his/her own access link',
          url: `${window.location.protocol}//${window.location.host}/staff/${user.id}/${staffID}`,
        })
        .then(() => true)
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Web Share API not supported in your browser.');
    }
  };

  const { data: staffsList = [], error } = useQuery({
    queryKey: ['staffs', user.id, branchID],
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
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
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
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="h4">{staff.fullname}</Typography>
              </Stack>
              <TextField
                name="URL"
                value={`${window.location.protocol}//${window.location.host}/staff/${user.id}/${staff.docID}`}
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
                <Typography variant="caption">{`${new Date(
                  staff.lastLogIn.seconds * 1000
                )}`}</Typography>
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
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between">
      <LoadingButton variant="soft" size="small" color="info">
        Reset Password
      </LoadingButton>
      <LoadingButton variant="soft" size="small" color={status ? 'error' : 'success'}>
        {status ? 'Disabled & Revoke Access' : 'Enable Access'}
      </LoadingButton>
    </Stack>
  );
}
