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
    <Stack direction="row" spacing={2} alignItems="center">
      <Iconify icon={icon} sx={{ color, width: 48, height: 48 }} />

      <Stack>
        <Typography variant="h6">{title}</Typography>

        <Typography variant="h4" sx={{ color }}>
          {total ? fShortenNumber(total) : 0}
        </Typography>
      </Stack>
    </Stack>
  );
}
