import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Card, Grid, Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import MonthYearPicker from 'src/sections/branches/components/MonthYearPicker';
import IncomeStatistics from 'src/sections/branches/components/analytic/IncomeStatistics';
import ScansUsageLinear from 'src/sections/branches/components/analytic/ScansUsageLinear';
import MostOrderedMeals from 'src/sections/branches/components/analytic/MostOrderedMeals';
import TablesOccupation from 'src/sections/branches/components/analytic/TablesOccupation';

const yearsSince2023 = new Date().getFullYear() - 2023;
const availableYears = [...Array(yearsSince2023 + 1)].map((value, index) => 2023 + index);

function BranchStatistics() {
  const { id: branchID } = useParams();
  const { fsGetBranch, businessProfile } = useAuthContext();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const changeMonthHandler = (value) => setMonth(+value);
  const changeYearHandler = (value) => setYear(+value);

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
  });

  const totalOrders =
    businessProfile.statisticsSummary.branches[branchID]?.orders[year][month] || 0;
  const totalTurnover =
    businessProfile.statisticsSummary.branches[branchID]?.turnover[year][month] || 0;
  const averageTurnover = totalTurnover / totalOrders || 0;
  const totalScans = businessProfile.statisticsSummary.branches[branchID]?.scans[year][month] || 0;
  const totalIncome =
    businessProfile.statisticsSummary.branches[branchID]?.income[year][month] || 0;
  const avgIncomePerOrder = totalIncome / totalOrders || 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ pl: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
        >
          <Typography variant="h6" color="primary">
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
      <SingleStatisticCard
        title="Tables Turnover"
        value={totalTurnover.toFixed(2)}
        unit="Minuets"
      />
      <SingleStatisticCard
        title="Avg Table Turnover"
        value={averageTurnover.toFixed(2)}
        unit="Minuets"
      />

      <SingleStatisticCard
        title="Total Income"
        value={totalIncome.toFixed(2)}
        unit={branchInfo.currency}
      />
      <SingleStatisticCard
        title="Avg Income per Order"
        value={avgIncomePerOrder.toFixed(2)}
        unit={branchInfo.currency}
      />
      <SingleStatisticCard title="Total Scans" value={totalScans} unit="scans" />

      <Grid item xs={12} md={6}>
        <ScansUsageLinear
          userData={businessProfile}
          branch={branchInfo}
          month={month}
          year={year}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <IncomeStatistics
          userData={businessProfile}
          branchID={branchInfo.docID}
          month={month}
          year={year}
          currency={branchInfo.currency}
        />
      </Grid>
      <Grid item sm={12}>
        <MostOrderedMeals
          userData={businessProfile}
          branch={branchInfo}
          month={month}
          year={year}
        />
      </Grid>
      <Grid item sm={12}>
        <TablesOccupation
          userData={businessProfile}
          branch={branchInfo}
          month={month}
          year={year}
        />
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
          <Typography variant="h5" color="primary">
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
