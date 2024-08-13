import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import ReactApexChart from 'react-apexcharts';

import { Box, Chip, Card, Stack, useTheme, Typography, CardHeader } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useChart } from 'src/components/chart';
import { useGetBranchInfo } from 'src/hooks/use-get-branch-info';

// ----------------------------------------------------------------------

ScansUsageLinear.propTypes = {
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function ScansUsageLinear({ month, year }) {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const { totalScans, totalOrders, avgScanPerOrder, scanData } = useGetBranchInfo(
    branchID,
    year,
    month
  );

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
          <Typography variant="caption">Avg {avgScanPerOrder} scan per Orders</Typography>
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
