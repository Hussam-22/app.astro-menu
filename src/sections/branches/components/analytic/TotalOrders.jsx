import PropTypes from 'prop-types';

import { Box, Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

TotalOrders.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  currency: PropTypes.string,
  price: PropTypes.number,
  total: PropTypes.number,
};

export default function TotalOrders({ title, total, icon, color, price, currency }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start">
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        <Iconify icon={icon} sx={{ color, width: 48, height: 48 }} />
      </Stack>

      <Stack spacing={0.5} sx={{ ml: 2 }}>
        <Typography variant="h6">{title}</Typography>

        <Typography variant="h4" sx={{ color }}>
          {price || 0} {currency}
        </Typography>

        <Typography variant="subtitle2">
          {total ? fShortenNumber(total) : 0}{' '}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Orders
          </Box>
        </Typography>
      </Stack>
    </Stack>
  );
}
