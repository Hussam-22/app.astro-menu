import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

TotalScans.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  total: PropTypes.number,
};

export default function TotalScans({ title, total, icon, color }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      sx={{ width: 1, minWidth: 200, ml: 4 }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        <Iconify icon={icon} sx={{ color, width: 48, height: 48 }} />
      </Stack>

      <Stack spacing={0.5} sx={{ ml: 2 }}>
        <Typography variant="h6">{title}</Typography>

        <Typography variant="h4" sx={{ color }}>
          {fShortenNumber(total)}
        </Typography>
      </Stack>
    </Stack>
  );
}
