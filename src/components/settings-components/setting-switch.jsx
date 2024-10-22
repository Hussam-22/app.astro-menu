import PropTypes from 'prop-types';

import { Box, Stack, useTheme, Typography } from '@mui/material';

import { RHFSwitch } from 'src/components/hook-form';

function SettingSwitch({ title, description, label, name, isDanger }) {
  const theme = useTheme();
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'start', sm: 'center' }}
    >
      <Stack direction="column" spacing={0} sx={{ px: 1, width: { xs: 1, sm: '75%' } }}>
        <Typography
          color={isDanger ? 'error' : 'inherit'}
          sx={{ fontWeight: theme.typography.fontWeightBold }}
        >
          {title}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </Stack>
      <Box sx={{ alignSelf: 'flex-end' }}>
        <RHFSwitch name={name} labelPlacement="start" label={label} color="success" />
      </Box>
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
