import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Stack, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import TablesCard from 'src/sections/branches/components/TablesCard';
import OrdersListCard from 'src/sections/branches/components/OrdersListCard';
import MonthYearPicker from 'src/sections/branches/components/MonthYearPicker';
import SelectedTableInfoCard from 'src/sections/branches/components/SelectedTableInfoCard';

const yearsSince2023 = new Date().getFullYear() - 2023;
const availableYears = [...Array(yearsSince2023 + 1)].map((value, index) => 2023 + index);

function BranchTables() {
  const theme = useTheme();
  const { id: branchID } = useParams();
  const { fsGetBranchTables } = useAuthContext();
  const [selectedTable, setSelectedTable] = useState();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const changeMonthHandler = (value) => setMonth(+value);
  const changeYearHandler = (value) => setYear(+value);

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID],
    queryFn: () => fsGetBranchTables(branchID),
  });

  const handleOnTableClick = (table) => setSelectedTable(table);

  return (
    <Stack direction="column" spacing={2}>
      <TablesCard
        theme={theme}
        tables={tables}
        onTableClick={handleOnTableClick}
        selectedTableID={selectedTable?.docID}
      />
      {selectedTable && (
        <MonthYearPicker
          month={month}
          year={year}
          availableYears={availableYears}
          updateMonth={changeMonthHandler}
          updateYear={changeYearHandler}
        />
      )}
      {selectedTable && (
        <SelectedTableInfoCard tableInfo={selectedTable} month={month} year={year} />
      )}
      {selectedTable && selectedTable.index !== 0 && (
        <OrdersListCard tableInfo={selectedTable} month={month} year={year} />
      )}
    </Stack>
  );
}

export default BranchTables;
