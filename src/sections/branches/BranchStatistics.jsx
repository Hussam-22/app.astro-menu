import { useState } from 'react';
import PropTypes from 'prop-types';

import { Card, Grid, Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useGetBranchInfo } from 'src/hooks/use-get-branch-info';
import MonthYearPicker from 'src/sections/branches/components/MonthYearPicker';
import ScansUsageLinear from 'src/sections/branches/components/analytic/ScansUsageLinear';
import IncomeStatistics from 'src/sections/branches/components/analytic/IncomeStatistics';
import MostOrderedMeals from 'src/sections/branches/components/analytic/MostOrderedMeals';
import TablesOccupation from 'src/sections/branches/components/analytic/TablesOccupation';

const yearsSince2023 = new Date().getFullYear() - 2023;
const availableYears = [...Array(yearsSince2023 + 1)].map((value, index) => 2023 + index);

function BranchStatistics() {
  const { id: branchID } = useParams();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const {
    totalOrders,
    totalTurnoverStr,
    averageTurnoverStr,
    totalScans,
    totalIncome,
    avgIncomePerOrder,
    currency,
  } = useGetBranchInfo(branchID, year, month);

  const changeMonthHandler = (value) => setMonth(+value);
  const changeYearHandler = (value) => setYear(+value);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ pl: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
        >
          <Typography variant="h6" color="secondary">
            Change Period
          </Typography>
          <MonthYearPicker
            month={month}
            year={year}
            availableYears={availableYears}
            updateMonth={changeMonthHandler}
            updateYear={changeYearHandler}
          />
        </Stack>
      </Grid>
      <SingleStatisticCard title="Total Orders" value={totalOrders} unit="Orders" />
      <SingleStatisticCard title="Tables Turnover" value={totalTurnoverStr} />
      <SingleStatisticCard title="Avg Table Turnover" value={averageTurnoverStr} />
      <SingleStatisticCard title="Total Income" value={totalIncome.toFixed(2)} unit={currency} />
      <SingleStatisticCard
        title="Avg Income per Order"
        value={avgIncomePerOrder.toFixed(2)}
        unit={currency}
      />
      <SingleStatisticCard title="Total Scans" value={totalScans} unit="scans" />

      <Grid item xs={12} md={6}>
        <ScansUsageLinear month={month} year={year} />
      </Grid>
      <Grid item xs={12} md={6}>
        <IncomeStatistics branchID={branchID} month={month} year={year} />
      </Grid>
      <Grid item sm={12}>
        <MostOrderedMeals branchID={branchID} month={month} year={year} />
      </Grid>
      <Grid item sm={12}>
        <TablesOccupation branchID={branchID} month={month} year={year} />
      </Grid>
    </Grid>
  );
}

export default BranchStatistics;

// ----------------------------------------------------------------------------

SingleStatisticCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string,
  note: PropTypes.string,
};

function SingleStatisticCard({ title, value, unit, note }) {
  return (
    <Grid item xs={12} md={2}>
      <Card sx={{ p: 2 }}>
        <Typography variant="caption">{title}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" color="secondary">
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {unit}
          </Typography>
        </Stack>
      </Card>
    </Grid>
  );
}
