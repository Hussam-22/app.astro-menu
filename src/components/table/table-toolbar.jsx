import PropTypes from 'prop-types';

import { Stack, TextField, Typography, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

TableToolbar.propTypes = {
  filterName: PropTypes.string,
  text: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function TableToolbar({ filterName, onFilterName, text }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2.5, px: 3 }}
    >
      <TextField
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="Search..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          ),
        }}
      />
      {text && (
        <Typography variant="body2" sx={{ color: 'info.main' }}>
          {text}
        </Typography>
      )}
    </Stack>
  );
}
