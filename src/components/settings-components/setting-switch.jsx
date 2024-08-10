import PropTypes from 'prop-types';

import { Stack, useTheme, Typography } from '@mui/material';

import { RHFSwitch } from 'src/components/hook-form';

function SettingSwitch({ title, description, label, name, isDanger }) {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="column" spacing={0} sx={{ px: 1, width: '75%' }}>
        <Typography
          color={isDanger ? 'error' : 'inherit'}
          sx={{ fontWeight: theme.typography.fontWeightBold }}
        >
          {title}
        </Typography>
        <Typography variant="caption">{description}</Typography>
      </Stack>
      <RHFSwitch name={name} labelPlacement="start" label={label} color="success" />
    </Stack>
  );
}
export default SettingSwitch;
SettingSwitch.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  isDanger: PropTypes.bool,
};
