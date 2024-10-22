import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Card, Stack, useTheme, Typography } from '@mui/material';

import { DOMAINS } from 'src/config-global';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import QRCodeCard from 'src/sections/branches/components/qr-code-card';
import FormProvider, { RHFSwitch, RHFTextField } from 'src/components/hook-form';

SelectedTableInfoCard.propTypes = {
  tableInfo: PropTypes.object,
};

function SelectedTableInfoCard({ tableInfo }) {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateBranchTable, user, fsGetAllMenus } = useAuthContext();

  const { mutate, isPending, error } = useMutation({
    mutationKey: ['branch-tables', branchID],
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      enqueueSnackbar('Update Successfully !!');
      queryClient.invalidateQueries(['branch-tables']);
    },
  });

  const validationSchema = Yup.object().shape({
    // title: Yup.string().required('Title cant be empty !!'),
  });

  const defaultValues = useMemo(
    () => ({
      menuID: tableInfo?.menuID || '',
      isActive: tableInfo?.isActive,
      note: tableInfo?.note || '',
      // title: tableInfo?.title,
      mealAlwaysAvailable: !!tableInfo?.mealAlwaysAvailable,
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

  const qrURL = `${DOMAINS.menu}/${user.businessProfileID}/${tableInfo?.branchID}/${tableInfo?.docID}/home`;

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

  return (
    <Grid container spacing={2}>
      <Grid xs={12} sm={8}>
        <Card sx={{ p: 3, height: 1 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={2}>
              <Stack direction="row" alignItems="self-end" justifyContent="space-between">
                <Typography variant="h4">QR# {tableInfo?.index}</Typography>
                <RHFSwitch
                  name="isActive"
                  label={`QR is ${values.isActive ? 'Active' : 'Disabled'}`}
                  labelPlacement="end"
                  sx={{ m: 0 }}
                />
              </Stack>
              <RHFTextField
                name="note"
                label="Note (Shows on Waiter Staff Dashboard Only)"
                multiline
                rows={3}
              />

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
        <QRCodeCard tableInfo={tableInfo} />
      </Grid>
    </Grid>
  );
}

export default SelectedTableInfoCard;
