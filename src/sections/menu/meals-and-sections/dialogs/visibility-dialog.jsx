import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { TimePicker } from '@mui/x-date-pickers';
import {
  Stack,
  Switch,
  Dialog,
  Button,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider from 'src/components/hook-form';
import {
  rdxToggleSectionVisibility,
  rdxSetSectionActiveTimeRange,
  rdxRemoveSectionActiveTimeRange,
} from 'src/redux/slices/menu';

VisibilityDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  sectionID: PropTypes.string,
};

function VisibilityDialog({ onClose, isOpen, sectionID }) {
  const { fsUpdateSectionVisibility, fsUpdateSectionVisibilityDateTimeRange, Timestamp } =
    useAuthContext();
  const sectionInfo = useSelector(
    (state) => state.menu.menu.sections.filter((section) => section.id === sectionID)[0]
  );
  const dispatch = useDispatch();
  const { menuID, isVisible, activeTimeRange } = sectionInfo;
  const [loading, setLoading] = useState(false);

  // const schema = Yup.object().shape({
  //   activeTimeRange: Yup.object().shape({
  //     from: Yup.string().required('Field cant be empty !!'),
  //     To: Yup.string().required('Field cant be empty !!'),
  //   }),
  // });

  const defaultValues = useMemo(
    () => ({
      isVisible: isVisible || false,
      activeTimeRange: {
        isActive: activeTimeRange.isActive || false,
        from:
          (activeTimeRange.from &&
            activeTimeRange.isActive &&
            new Date(activeTimeRange.from.seconds * 1000)) ||
          null,
        to:
          (activeTimeRange.to &&
            activeTimeRange.isActive &&
            new Date(activeTimeRange.to.seconds * 1000)) ||
          null,
      },
      //   activeDateRange: {
      //     isActive: sectionInfo?.activeDateRange.isActive || false,
      //     from: (sectionInfo?.activeDateRange.from && new Date(sectionInfo?.activeDateRange.from.seconds * 1000)) || '',
      //     to: (sectionInfo?.activeDateRange.to && new Date(sectionInfo?.activeDateRange.to.seconds * 1000)) || '',
      //   },
    }),
    [activeTimeRange, isVisible]
  );

  const methods = useForm({
    // resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    watch,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty, errors },
  } = methods;

  const values = watch();

  //   const handelActiveDateRange = () => {
  //     fsUpdateSectionVisibilityDateTimeRange(menuID, sectionID, {
  //       date: {
  //         isActive: '',
  //         from: values.activeDateRange.from,
  //         to: values.activeDateRange.to,
  //       },
  //     });
  //   };

  const fsUpdateSectionTimeRange = (isActive) => {
    fsUpdateSectionVisibilityDateTimeRange(menuID, sectionID, {
      isActive,
      from: values.activeTimeRange.from,
      to: values.activeTimeRange.to,
    });
  };

  const handelSetTImeRangeLimit = async () => {
    setLoading(true);
    fsUpdateSectionTimeRange(true);
    dispatch(
      rdxSetSectionActiveTimeRange({
        sectionID,
        from: Timestamp.fromDate(values.activeTimeRange.from),
        to: Timestamp.fromDate(values.activeTimeRange.to),
      })
    );

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleRemoveTimeRangeLimit = () => {
    setLoading(true);
    fsUpdateSectionTimeRange(false);
    dispatch(rdxRemoveSectionActiveTimeRange({ sectionID }));
    setValue('activeTimeRange.from', null);
    setValue('activeTimeRange.to', null);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleVisibilityToggle = () => {
    setValue('isVisible', !isVisible);
    fsUpdateSectionVisibility(menuID, sectionID, { isVisible: !isVisible });
    dispatch(rdxToggleSectionVisibility({ sectionID }));
  };

  return (
    <Dialog fullWidth maxWidth="md" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle>Change Section Visibility</DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(handelSetTImeRangeLimit)}>
        <DialogContent>
          <Typography variant="body2" color="inherit">
            You can change section visibility conditionally by setting time range or completely
            hide/show the section from the menu, section(s) that was set to show conditionally will
            have ⌚ icon next to its title, hidden sections will be grayed out and blurred
          </Typography>

          <Stack direction={{ md: 'row', xs: 'column' }} spacing={2} sx={{ mt: 3 }}>
            {/* <Controller
              name="activeDateRange.from"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Date from"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                  )}
                />
              )}
            />

            <Controller
              name="activeDateRange.to"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Date to"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                  )}
                />
              )}
            /> 

            <LoadingButton variant="contained" loading={visibilityLoading} onClick={handelActiveDateRange}>
              {values.activeDateRange.isActive ? 'Remove' : 'Add'} Date Limit
            </LoadingButton> */}

            <Controller
              name="activeTimeRange.from"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TimePicker
                  label="Time From"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                  )}
                />
              )}
            />
            <Controller
              name="activeTimeRange.to"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TimePicker
                  label="Time to"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                  )}
                />
              )}
            />
            <Stack direction="row">
              <LoadingButton type="submit" color="primary" disabled={!isDirty} loading={loading}>
                <Iconify
                  icon="material-symbols:check-circle-outline-rounded"
                  width={32}
                  height={32}
                />
              </LoadingButton>
              <LoadingButton
                onClick={handleRemoveTimeRangeLimit}
                color="error"
                disabled={!sectionInfo.activeTimeRange.isActive}
                loading={loading}
              >
                <Iconify icon="iconoir:delete-circled-outline" width={32} height={32} />
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogContent>

        <Divider sx={{ mt: 2 }} />

        <DialogActions>
          <FormControlLabel
            control={<Switch checked={values.isVisible} onChange={handleVisibilityToggle} />}
            label={sectionInfo.isVisible ? 'Visible' : 'Hidden'}
          />

          <Button variant="outlined" color="primary" onClick={() => onClose()}>
            Close
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default VisibilityDialog;
