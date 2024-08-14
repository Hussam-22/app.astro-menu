import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Chip, Card, Stack, CircularProgress } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useGetBranchInfo } from 'src/hooks/use-get-branch-info';
import AnalyticsConversionRates from 'src/sections/overview/analytics/analytics-conversion-rates';
import NoStatisticsAvailable from 'src/sections/branches/components/analytic/no-statistics-available';
// import { AnalyticsConversionRates } from 'src/sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

MostOrderedMeals.propTypes = {
  branchID: PropTypes.string,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function MostOrderedMeals({ branchID, month, year }) {
  const { fsGetAllMeals } = useAuthContext();
  const { mealsStats } = useGetBranchInfo(branchID, year, month);

  console.log(mealsStats);

  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const { data: allMeals = [], isLoading } = useQuery({
    queryKey: [`meals`],
    queryFn: () => fsGetAllMeals(),
  });

  const filteredMeals = allMeals.filter((meal) => Object.keys(mealsStats).includes(meal.docID));

  const mealsUsage =
    !isLoading &&
    filteredMeals
      .map((meal) => ({
        label: meal.title,
        value: mealsStats[meal.docID] || 0,
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

  if (mealsUsage.length === 0) return <NoStatisticsAvailable />;

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
