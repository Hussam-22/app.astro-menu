import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

// @mui
import FormHelperText from '@mui/material/FormHelperText';
import { Box, useTheme, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';

//
import { Upload, UploadBox, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <UploadAvatar
            error={!!error}
            file={field.value}
            {...other}
            accept={{ 'image/jpeg': ['.jpg'], 'image/png': ['.png'], 'image/webp': ['.wepb'] }}
          />

          {!!error && (
            <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFUploadAvatar.propTypes = {
  name: PropTypes.string,
};

// ----------------------------------------------------------------------

export function RHFUploadBox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox files={field.value} error={!!error} {...other} />
      )}
    />
  );
}

RHFUploadBox.propTypes = {
  name: PropTypes.string,
};

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, onRemove, paddingValue, ...other }) {
  const { control } = useFormContext();
  const theme = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
          <Upload
            multiple
            accept={{ 'image/jpeg': ['.jpg'], 'image/png': ['.png'], 'image/webp': ['.wepb'] }}
            files={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Upload
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.wepb'],
              }}
              file={field.value}
              error={!!error}
              helperText={
                (!!error || helperText) && (
                  <FormHelperText error={!!error} sx={{ px: 2 }}>
                    {error ? error?.message : helperText}
                  </FormHelperText>
                )
              }
              paddingValue={paddingValue}
              {...other}
            />
            {onRemove !== undefined && (
              <IconButton
                size="small"
                onClick={onRemove}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  zIndex: 99,
                  backgroundColor: theme.palette.grey[200],
                  color: theme.palette.common.black,
                }}
              >
                <Iconify icon="radix-icons:cross-2" width={12} height={12} />
              </IconButton>
            )}
          </Box>
        )
      }
    />
  );
}

RHFUpload.propTypes = {
  helperText: PropTypes.string,
  multiple: PropTypes.bool,
  name: PropTypes.string,
  paddingValue: PropTypes.string,
  onRemove: PropTypes.func,
};
