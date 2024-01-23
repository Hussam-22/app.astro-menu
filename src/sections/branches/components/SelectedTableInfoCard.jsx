import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { QRCodeCanvas } from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

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
  table: PropTypes.object,
  updateTablesList: PropTypes.func,
};

function SelectedTableInfoCard({ table, updateTablesList }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { fsUpdateBranchTable, fsDeleteTable, user, fsGetAllMenus } = useAuthContext();

  const { data: menusList = [], isFetched } = useQuery({
    queryKey: ['menus'],
    queryFn: fsGetAllMenus,
  });
  console.log(menusList);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title cant be empty !!'),
  });

  const defaultValues = useMemo(
    () => ({
      activeMenuID: table.activeMenuID || '',
      isActive: table.isActive,
      note: table.note,
      title: table.title,
      index: table.index,
    }),
    [table]
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(table);
  }, [reset, table]);

  const values = watch();

  const onSubmit = async () => {
    fsUpdateBranchTable(table.branchID, table.id, { ...values });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateTablesList({ keepMounted: true });
  };

  const deleteTableHandler = async () => {
    setIsLoading(true);
    await fsDeleteTable(table.branchID, table.id);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    updateTablesList();
  };

  const qrURL = `${window.location.host}/qrMenu/${user.id}/${table.id}`;

  const copUrlHandler = () => {
    navigator.clipboard.writeText(qrURL);
  };

  const downloadQR = () => {
    const canvas = document.getElementById(table.index);
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${table.index}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <Grid xs={12} md={8} lg={8}>
        <Card sx={{ p: 3, height: 1 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h4">Table# {values.index}</Typography>
                <RHFSwitch
                  name="isActive"
                  label={`Table is ${values.isActive ? 'Active' : 'Disabled'}`}
                  labelPlacement="end"
                  sx={{ m: 0 }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <RHFTextField name="title" label="Table Nickname" />
                {menusList?.length !== 0 && menusList !== undefined && (
                  <RHFSelect
                    name="activeMenuID"
                    label="Default Menu"
                    placeholder="Default Menu"
                    defaultValue={table.activeMenuID}
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
              <Stack spacing={2} direction="row">
                {/* <LoadingButton
                  loading={isLoading}
                  variant="soft"
                  color="error"
                  startIcon={<Iconify icon="ant-design:save-twotone" />}
                  onClick={deleteTableHandler}
                >
                  Delete
                </LoadingButton> */}
                <LoadingButton
                  loading={isSubmitting}
                  type="submit"
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="ant-design:save-twotone" />}
                >
                  Save
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        </Card>
      </Grid>

      <Grid xs={12} md={4} lg={4}>
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
              id={table.index}
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
    </>
  );
}

export default SelectedTableInfoCard;
