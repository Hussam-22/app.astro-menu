import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Chip, Card, Stack, useTheme, Typography, CircularProgress } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import AnalyticsConversionRates from 'src/sections/overview/analytics/analytics-conversion-rates';
// import { AnalyticsConversionRates } from 'src/sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

MostOrderedMeals.propTypes = {
  branch: PropTypes.object,
  userData: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function MostOrderedMeals({ userData, branch, month, year }) {
  const theme = useTheme();
  const { fsGetAllMeals } = useAuthContext();

  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const { data: allMeals = [], isLoading } = useQuery({
    queryKey: [`meals`],
    queryFn: () => fsGetAllMeals(),
  });

  const mealsStats =
    userData?.statisticsSummary?.branches[branch.docID]?.meals?.[year]?.[month] || {};

  const mealsUsage =
    !isLoading &&
    Object.entries(mealsStats)
      .map((item) => ({
        label: allMeals.find((meal) => meal.docID === item[0]).title,
        value: item[1],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

  if (isLoading)
    return (
      <Card
        sx={{
          p: 3,
          height: 100,
        }}
      >
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      </Card>
    );

  if (mealsUsage.length === 0)
    return (
      <Card sx={{ p: 3 }}>
        <Stack alignItems="center" justifyContent="center" direction="row" spacing={1}>
          <Iconify
            icon="ph:warning-circle-light"
            sx={{ width: 28, height: 28, color: theme.palette.text.disabled }}
          />
          <Typography variant="h4" sx={{ color: theme.palette.text.disabled }}>
            No Statistics Available
          </Typography>
        </Stack>
      </Card>
    );

  return (
    !isLoading &&
    mealsUsage.length !== 0 && (
      <AnalyticsConversionRates
        title="Most Ordered Meals"
        subheader="The chart represents top 10 most ordered meals"
        action={<Chip label={monthLong} />}
        chart={{
          series: mealsUsage,
        }}
      />
    )
  );
}
