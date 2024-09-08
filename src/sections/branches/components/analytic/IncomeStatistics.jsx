import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

import { Box, Chip, Card, Stack, useTheme, Typography, CardHeader } from '@mui/material';

import { useChart } from 'src/components/chart';
import { useGetBranchInfo } from 'src/hooks/use-get-branch-info';
import NoStatisticsAvailable from 'src/sections/branches/components/analytic/no-statistics-available';

// ----------------------------------------------------------------------

IncomeStatistics.propTypes = {
  branchID: PropTypes.string,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function IncomeStatistics({ branchID, year, month }) {
  const theme = useTheme();
  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const { totalOrders, totalIncome, avgIncomePerOrder, currency, allIncome } = useGetBranchInfo(
    branchID,
    year,
    month
  );

  if (totalOrders === 0 && (totalIncome === 0 || totalIncome === undefined))
    return <NoStatisticsAvailable />;

  return (
    <Card>
      <CardHeader title="Total Income" action={<Chip label={monthLong} />} />
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" sx={{ color: theme.palette.success.main }}>
          {`${currency} 
          ${+totalIncome.toFixed(2)}`}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ color: theme.palette.grey[500] }}>
          <Typography variant="caption">from {totalOrders} Orders</Typography>
          <Typography variant="caption">|</Typography>
          <Typography variant="caption">{`Avg ${currency} ${avgIncomePerOrder} per Orders`}</Typography>
        </Stack>

        {Object.keys(allIncome).length !== 0 && (
          <IncomeYearStatistics incomeData={allIncome} year={year} />
        )}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

IncomeYearStatistics.propTypes = {
  incomeData: PropTypes.object,
  year: PropTypes.number,
};

function IncomeYearStatistics({ incomeData, year }) {
  const initialArrayOfZeroes = Array(12).fill(0);
  const income = initialArrayOfZeroes.map(
    (_, index) => incomeData?.[year]?.[index]?.toFixed(2) || 0
  );

  const chartLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartLabels,
    },
    tooltip: {
      y: {
        formatter: (val) => val,
      },
    },
  });

  return (
    <ReactApexChart type="bar" series={[{ data: income }]} options={chartOptions} height={200} />
  );
}
