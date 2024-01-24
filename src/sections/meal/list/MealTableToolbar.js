import PropTypes from 'prop-types';

import { Stack, TextField, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

MealTableToolbar.propTypes = {
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function MealTableToolbar({ filterName, onFilterName }) {
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
        placeholder="Search Meal..."
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
    </Stack>
  );
}
