import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

import { Box, Chip, Card, Stack, useTheme, Typography, CardHeader } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

ScansUsageLinear.propTypes = {
  branch: PropTypes.object,
  userData: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function ScansUsageLinear({ userData, branch, month, year }) {
  const theme = useTheme();
  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const scanData = userData?.statisticsSummary?.branches[branch.docID]?.scans || {};
  const totalScans =
    userData?.statisticsSummary?.branches[branch.docID]?.scans?.[year]?.[month] || 0;
  const totalOrders =
    userData?.statisticsSummary?.branches[branch.docID]?.orders?.[year]?.[month] || 0;
  const avg = (+totalScans / +totalOrders).toFixed(2) || 0;

  if (totalScans === 0)
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
      <CardHeader title="Total Scan" action={<Chip label={monthLong} />} />
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" sx={{ color: theme.palette.success.main }}>
          {totalScans}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ color: theme.palette.grey[500] }}>
          <Typography variant="caption">from {totalOrders} Orders</Typography>
          <Typography variant="caption">|</Typography>
          <Typography variant="caption">Avg {avg} scan per Orders</Typography>
        </Stack>

        {Object.keys(scanData).length !== 0 && (
          <ScanUsageOverTheYear incomeData={scanData} year={year} />
        )}
      </Box>
    </Card>
  );
}

// -------------------------------------------------------------------

ScanUsageOverTheYear.propTypes = {
  incomeData: PropTypes.object,
  year: PropTypes.number,
};

function ScanUsageOverTheYear({ incomeData, year }) {
  const initialArrayOfZeroes = Array(12).fill(0);
  const income = initialArrayOfZeroes.map((_, index) => incomeData?.[year]?.[index] || 0);

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
        formatter: (val) => `${val}`,
      },
    },
  });

  return (
    <ReactApexChart type="bar" series={[{ data: income }]} options={chartOptions} height={200} />
  );
}
