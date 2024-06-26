import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Stack,
  Button,
  MenuItem,
  useTheme,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

SelectedTableInfoCard.propTypes = {
  tableInfo: PropTypes.object,
};

function SelectedTableInfoCard({ tableInfo }) {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateBranchTable, user, fsGetAllMenus } = useAuthContext();
  const queryClient = useQueryClient();

  const isQrMenuOnly = tableInfo?.index === 0;

  const { data: menusList = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
  });

  const { mutate, isPending, error } = useMutation({
    mutationKey: ['branch-tables', branchID],
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      enqueueSnackbar('Update Successfully !!');
      queryClient.invalidateQueries(['branch-tables']);
    },
  });

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title cant be empty !!'),
  });

  const defaultValues = useMemo(
    () => ({
      menuID: tableInfo?.menuID || '',
      isActive: tableInfo?.isActive,
      note: tableInfo?.note,
      title: tableInfo?.title,
    }),
    [tableInfo]
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { dirtyFields, isDirty },
  } = methods;

  useEffect(() => {
    if (tableInfo) reset(defaultValues);
  }, [defaultValues, reset, tableInfo]);

  const values = watch();

  const onSubmit = async (formData) => {
    const { menuID, ...dataToUpdate } = formData;
    if (dirtyFields.menuID)
      mutate(() => fsUpdateBranchTable(tableInfo.branchID, tableInfo.docID, { ...formData }));
    if (!dirtyFields.menuID)
      mutate(() => fsUpdateBranchTable(tableInfo.branchID, tableInfo.docID, { ...dataToUpdate }));
    reset(formData);
  };

  const qrURL = `${window.location.protocol}//${window.location.host}/qr-menu/${user.businessProfileID}/${tableInfo?.branchID}/${tableInfo?.docID}`;

  const copUrlHandler = () => {
    navigator.clipboard.writeText(qrURL);
  };

  const downloadQR = () => {
    const canvas = document.getElementById(tableInfo.index);
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${tableInfo.index}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (isQrMenuOnly)
    return (
      <Grid container spacing={2}>
        <Grid xs={12} sm={8}>
          <Card sx={{ p: 3, height: 1 }}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" alignItems="self-end" justifyContent="space-between">
                  <Stack direction="column">
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {tableInfo?.docID}
                    </Typography>
                    <Typography variant="h4">Menu Only</Typography>
                  </Stack>
                  <RHFSwitch
                    name="isActive"
                    label={`Table is ${values.isActive ? 'Active' : 'Disabled'}`}
                    labelPlacement="end"
                    sx={{ m: 0 }}
                  />
                </Stack>
                <Stack direction="column" spacing={2}>
                  {menusList?.length !== 0 && menusList !== undefined && (
                    <RHFSelect
                      name="menuID"
                      label="Default Menu"
                      placeholder="Default Menu"
                      defaultValue={tableInfo?.menuID}
                    >
                      {menusList.map((menu) => (
                        <MenuItem key={menu.docID} value={menu.docID}>
                          {menu.title}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                  <TextField value="This table is to show your menu only" disabled />
                  <LoadingButton
                    loading={isPending}
                    type="submit"
                    variant="contained"
                    color="success"
                    startIcon={<Iconify icon="ion:save-sharp" />}
                    disabled={!isDirty}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Save
                  </LoadingButton>
                </Stack>
              </Stack>
            </FormProvider>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                alignItems: 'center',
                mt: 2,
              }}
            >
              <QRCodeCanvas
                value={qrURL}
                size={200}
                id={tableInfo?.index}
                style={{
                  border: `solid 5px ${theme.palette.primary.main}`,
                  borderRadius: 5,
                  padding: 10,
                }}
              />
              <Button
                variant="text"
                onClick={downloadQR}
                startIcon={<Iconify icon="uil:image-download" />}
              >
                Download QR
              </Button>
              <TextField
                name="URL"
                value={qrURL}
                size="small"
                fullWidth
                aria-readonly
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" sx={{ p: 0, m: 0 }} onClick={copUrlHandler}>
                      <Iconify icon="mdi:clipboard-multiple-outline" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    );

  return (
    <Grid container spacing={2}>
      <Grid xs={12} sm={8}>
        <Card sx={{ p: 3, height: 1 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={2}>
              <Stack direction="row" alignItems="self-end" justifyContent="space-between">
                <Stack direction="column">
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {tableInfo?.docID}
                  </Typography>
                  <Typography variant="h4">Table# {tableInfo?.index}</Typography>
                </Stack>
                <RHFSwitch
                  name="isActive"
                  label={`Table is ${values.isActive ? 'Active' : 'Disabled'}`}
                  labelPlacement="end"
                  sx={{ m: 0 }}
                />
              </Stack>
              <Stack direction="column" spacing={2}>
                <RHFTextField name="title" label="Table Nickname" />
                {menusList?.length !== 0 && menusList !== undefined && (
                  <RHFSelect
                    name="menuID"
                    label="Default Menu"
                    placeholder="Default Menu"
                    defaultValue={tableInfo?.menuID}
                  >
                    {menusList.map((menu) => (
                      <MenuItem key={menu.docID} value={menu.docID}>
                        {menu.title}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              </Stack>
              <RHFTextField name="note" label="Note" multiline rows={3} />
              <Stack spacing={2} direction="row" justifyContent="flex-end" alignItems="center">
                <LoadingButton
                  loading={isPending}
                  type="submit"
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="ion:save-sharp" />}
                  disabled={!isDirty}
                >
                  Save
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        </Card>
      </Grid>
      <Grid xs={12} sm={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              alignItems: 'center',
              mt: 2,
            }}
          >
            <QRCodeCanvas
              value={qrURL}
              size={200}
              id={tableInfo?.index}
              style={{
                border: `solid 5px ${theme.palette.primary.main}`,
                borderRadius: 5,
                padding: 10,
              }}
            />
            <Button
              variant="text"
              onClick={downloadQR}
              startIcon={<Iconify icon="uil:image-download" />}
            >
              Download QR
            </Button>
            <TextField
              name="URL"
              value={qrURL}
              size="small"
              fullWidth
              aria-readonly
              InputProps={{
                endAdornment: (
                  <IconButton size="small" sx={{ p: 0, m: 0 }} onClick={copUrlHandler}>
                    <Iconify icon="mdi:clipboard-multiple-outline" />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SelectedTableInfoCard;
