import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

import { Box, Chip, Card, Stack, useTheme, Typography, CardHeader } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

IncomeStatistics.propTypes = {
  branchID: PropTypes.string,
  userData: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
  currency: PropTypes.string,
};

export default function IncomeStatistics({ branchID, userData, year, month, currency }) {
  const theme = useTheme();
  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const ordersCount = userData.statisticsSummary?.branches[branchID]?.orders?.[year]?.[month] || 0;
  const monthsIncome = userData?.statisticsSummary?.branches[branchID]?.income || {};
  const selectedMonthIncome =
    userData?.statisticsSummary?.branches[branchID]?.income?.[year]?.[month] || 0;
  const avg = (+selectedMonthIncome / +ordersCount).toFixed(2) || 0;

  if (ordersCount === 0)
    return (
      <Card sx={{ p: 3, height: 1 }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          direction="row"
          spacing={1}
          sx={{ my: 'auto', height: 1 }}
        >
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
    <Card>
      <CardHeader title="Total Income" action={<Chip label={monthLong} />} />
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" sx={{ color: theme.palette.success.main }}>
          {`${currency} 
          ${selectedMonthIncome.toFixed(2)}`}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ color: theme.palette.grey[500] }}>
          <Typography variant="caption">from {ordersCount} Orders</Typography>
          <Typography variant="caption">|</Typography>
          <Typography variant="caption">{`Avg ${currency} ${avg} per Orders`}</Typography>
        </Stack>

        {Object.keys(monthsIncome).length !== 0 && (
          <IncomeYearStatistics incomeData={monthsIncome} year={year} />
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
    // eslint-disable-next-line no-unsafe-optional-chaining
    (_, index) => incomeData?.[year]?.[index]?.toFixed(0) || 0
  );

  // const chartData = {
  //   year: 'Year',
  //   data: [{ name: 'Income', data: income }],
  // };

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
  // return <ReactApexChart type="bar" series={chartData.data} options={chartOptions} height={200} />;
}
