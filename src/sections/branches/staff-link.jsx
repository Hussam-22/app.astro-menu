import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, TextField, Typography, IconButton } from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

function StaffLink() {
  const { id: branchID } = useParams();
  const { user, fsGetStaffList } = useAuthContext();

  const copUrlHandler = (staffID) => {
    navigator.clipboard.writeText(`${window.location.host}/staff/${user.id}/${staffID}`);
  };

  const { data: staffsList = [], error } = useQuery({
    queryKey: ['staffs', user.id, branchID],
    queryFn: () => fsGetStaffList(branchID),
  });

  console.log({ staffsList, error });

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
      {staffsList.map((staff) => (
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
              value={`${window.location.host}/staff/${user.id}/${staff.docID}`}
              size="small"
              fullWidth
              aria-readonly
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    sx={{ p: 0, m: 0 }}
                    onClick={() => copUrlHandler(staff.docID)}
                  >
                    <Iconify icon="mdi:clipboard-multiple-outline" />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="column">
              <Typography sx={{ color: 'info.main' }}>LastLogin:</Typography>
              <Typography variant="caption">{`${new Date(
                staff.lastLogIn.seconds * 1000
              )}`}</Typography>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}
export default StaffLink;
