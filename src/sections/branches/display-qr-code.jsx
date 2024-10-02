// import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { enqueueSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Divider,
  useTheme,
  MenuItem,
  TextField,
  AlertTitle,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import { DOMAINS } from 'src/config-global';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFSwitch, RHFSelect } from 'src/components/hook-form';
import StatisticsOverviewCard from 'src/sections/branches/components/StatisticsOverviewCard';

const month = new Date().getMonth();
const year = new Date().getFullYear();

function DisplayQRCode() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { fsGetDisplayTableInfo, user, fsGetAllMenus, fsUpdateBranchTable } = useAuthContext();
  const queryClient = useQueryClient();

  const {
    data: tableInfo,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['display-qr-code', branchID],
    queryFn: () => fsGetDisplayTableInfo(branchID),
  });

  const { data: menusList = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
    enabled: tableInfo !== undefined,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['branch-tables', branchID],
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      enqueueSnackbar('Update Successfully !!');
      queryClient.invalidateQueries(['display-qr-code', branchID]);
    },
  });

  const defaultValues = useMemo(
    () => ({
      menu: tableInfo?.menuID || '',
      isActive: !!tableInfo?.isActive,
      mealAlwaysAvailable: !!tableInfo?.mealAlwaysAvailable,
    }),
    [tableInfo]
  );

  const methods = useForm({
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

  const qrURL = `${DOMAINS.menu}/${user.businessProfileID}/${tableInfo?.branchID}/${tableInfo?.docID}/home`;

  const copUrlHandler = () => {
    navigator.clipboard.writeText(qrURL);
  };

  const downloadQR = () => {
    const canvas = document.getElementById(tableInfo.index);
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `display-only-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!tableInfo) return <LinearProgress color="secondary" />;

  return (
    tableInfo && (
      <Box>
        <StatisticsOverviewCard tableInfo={tableInfo} month={month} year={year} />

        <Grid container spacing={2}>
          <Grid xs={12}>
            <Alert severity="warning" variant="outlined" sx={{ width: 1, mt: 2 }}>
              <AlertTitle>Attention</AlertTitle>
              {`The "Display QR" code is intended to display the menu only, with the "Cart" disabled for customers view. Use it on your social media or at your front entrance or wherever you need to showcase your menu. Avoid placing it on customer tables. 
              If you plan to have waitstaff take orders without allowing customers to order themselves, it’s recommended to disable "Self Order" in the branch settings and use the "Tables QR Codes" for table management and statistics tracking.`}
            </Alert>
          </Grid>

          <Grid xs={12} sm={8}>
            <Card sx={{ p: 3, height: 1 }}>
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack direction="column" spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4">Display QR Code</Typography>
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
                  <Stack direction="column" spacing={2}>
                    {menusList?.length !== 0 && menusList !== undefined && (
                      <RHFSelect
                        name="menu"
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

                    <Stack
                      direction="column"
                      spacing={1}
                      divider={<Divider sx={{ borderStyle: 'dashed' }} />}
                    >
                      <Stack direction="column">
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography sx={{ fontWeight: 500 }}>Meals Visibility</Typography>
                          <RHFSwitch
                            name="mealAlwaysAvailable"
                            label={`${
                              values.mealAlwaysAvailable ? 'Always Available' : 'Depended'
                            }`}
                            labelPlacement="start"
                            sx={{ m: 0 }}
                          />
                        </Stack>
                        <Typography variant="body2">
                          Decide the behavior of the meals visibility if they should be always
                          visible regardless of their status (In case they are unavailable)
                        </Typography>
                      </Stack>

                      <Stack direction="column">
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography sx={{ fontWeight: 500 }}>QR Status</Typography>
                          <RHFSwitch
                            name="isActive"
                            label={`QR is ${values.isActive ? 'Active' : 'Disabled'}`}
                            labelPlacement="start"
                            sx={{ m: 0 }}
                          />
                        </Stack>
                        <Typography variant="body2">
                          If disabled the QR will not be accessible by customers
                        </Typography>
                      </Stack>
                    </Stack>
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
      </Box>
    )
  );
}

export default DisplayQRCode;
// DisplayQRCode.propTypes = { tables: PropTypes.array };
