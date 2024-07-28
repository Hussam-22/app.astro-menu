import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

OverviewCard.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default function OverviewCard({ title, subtitle, icon }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} sx={{ width: 32, height: 32 }} />

      <Stack>
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          {title}
        </Typography>

        <Typography variant="body1" sx={{ lineHeight: 1, fontWeight: 600 }}>
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  );
}
