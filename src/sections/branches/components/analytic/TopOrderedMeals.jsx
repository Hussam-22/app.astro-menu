import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

TopOrderedMeals.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  totalMealsToDisplay: PropTypes.number,
  topMealsArray: PropTypes.array,
};

export default function TopOrderedMeals({
  totalMealsToDisplay,
  topMealsArray,
  icon,
  color,
  title,
}) {
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

        {topMealsArray.slice(0, totalMealsToDisplay).map((meal) => (
          <Typography variant="subtitle2" sx={{ color }} key={meal[0]}>
            {`${meal[0]} (${meal[1]})`}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}
