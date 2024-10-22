// import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Alert,
  Stack,
  Divider,
  MenuItem,
  AlertTitle,
  Typography,
  LinearProgress,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import QRCodeCard from 'src/sections/branches/components/qr-code-card';
import FormProvider, { RHFSwitch, RHFSelect } from 'src/components/hook-form';
import StatisticsOverviewCard from 'src/sections/branches/components/StatisticsOverviewCard';

const month = new Date().getMonth();
const year = new Date().getFullYear();

function DisplayQRCode() {
  const { id: branchID } = useParams();
  const { fsGetDisplayTableInfo, user, fsGetAllMenus, fsUpdateDisplayQR } = useAuthContext();
  const { isMenuOnly } = useGetProductInfo();
  const queryClient = useQueryClient();

  const {
    data: tableInfo = {},
    error,
    isFetched,
  } = useQuery({
    queryKey: ['display-qr-code', branchID],
    queryFn: () => fsGetDisplayTableInfo(branchID),
  });

  const { data: menusList = [], isFetched: isMenusFetched } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
    enabled: isFetched,
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
      menuID: tableInfo?.menuID || '',
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
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    if (tableInfo) reset(defaultValues);
  }, [defaultValues, reset, tableInfo]);

  const values = watch();

  const onSubmit = async (formData) => {
    mutate(() => fsUpdateDisplayQR(tableInfo.branchID, tableInfo.docID, { ...formData }));
    reset(formData);
  };

  if (!tableInfo) return <LinearProgress color="secondary" />;

  return (
    tableInfo && (
      <Box>
        <StatisticsOverviewCard tableInfo={tableInfo} month={month} year={year} />

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {!isMenuOnly && (
            <Grid xs={12}>
              <Alert severity="warning" variant="outlined" sx={{ width: 1 }}>
                <AlertTitle>Attention</AlertTitle>
                {`The "Display QR" code is intended to display the menu only, with the "Cart" disabled for customers view. Use it on your social media or at your front entrance or wherever you need to showcase your menu. Avoid placing it on customer tables. 
              If you plan to have waitstaff take orders without allowing customers to order themselves, it’s recommended to disable "Self Order" in the branch settings and use the "Tables QR Codes" for table management and statistics tracking.`}
              </Alert>
            </Grid>
          )}

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
                    {isMenusFetched && (
                      <RHFSelect name="menuID" label="Menu">
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
                      {!isMenuOnly && (
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
                      )}

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
            <QRCodeCard tableInfo={tableInfo} />
          </Grid>
        </Grid>
      </Box>
    )
  );
}

export default DisplayQRCode;
// DisplayQRCode.propTypes = { tables: PropTypes.array };
