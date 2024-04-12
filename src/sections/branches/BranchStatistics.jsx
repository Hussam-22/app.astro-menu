import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Grid, Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import MonthYearPicker from 'src/sections/branches/components/MonthYearPicker';
import IncomeStatistics from 'src/sections/branches/components/analytic/IncomeStatistics';
import ScansUsageLinear from 'src/sections/branches/components/analytic/ScansUsageLinear';

const yearsSince2023 = new Date().getFullYear() - 2023;
const availableYears = [...Array(yearsSince2023 + 1)].map((value, index) => 2023 + index);

function BranchStatistics() {
  const { id: branchID } = useParams();
  const { user, fsGetBranch } = useAuthContext();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const changeMonthHandler = (value) => setMonth(+value);
  const changeYearHandler = (value) => setYear(+value);

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
  });

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
      <Grid item xs={12} md={6}>
        <ScansUsageLinear userData={user} branch={branchInfo} month={month} year={year} />
      </Grid>
      <Grid item xs={12} md={6}>
        <IncomeStatistics userData={user} branchID={branchInfo.docID} month={month} year={year} />
      </Grid>
      {/* <Grid item xs={12} md={12}>
        <MostOrderedMeals userData={user} branch={branchInfo} month={month} year={year} />
      </Grid> */}
      {/* <Grid item xs={12} md={6}>
        <TablesOccupation userData={userData} branch={branch} month={month} year={year} />
      </Grid> */}
    </Grid>
  );
}

export default BranchStatistics;