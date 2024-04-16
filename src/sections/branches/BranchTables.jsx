import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, useTheme } from '@mui/material';

import Iconify from 'src/components/iconify';
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
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  const changeMonthHandler = (value) => setMonth(+value);
  const changeYearHandler = (value) => setYear(+value);

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branchID],
    queryFn: () => fsGetBranchTables(branchID),
  });

  const handleOnTableClick = (table) => setSelectedTable(table);

  const reFetchData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    queryClient.invalidateQueries({
      queryKey: ['tableOrders', selectedTable.docID, branchID],
    });
  };

  return (
    <Stack direction="column" spacing={2}>
      <TablesCard
        theme={theme}
        tables={tables}
        onTableClick={handleOnTableClick}
        selectedTableID={selectedTable?.docID}
      />

      {selectedTable && (
        <SelectedTableInfoCard tableInfo={selectedTable} month={month} year={year} />
      )}

      <Divider sx={{ borderStyle: 'dashed', borderColor: theme.palette.divider }} />

      {selectedTable && (
        <Card sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
            <LoadingButton
              variant="soft"
              color="info"
              sx={{ alignSelf: 'flex-end' }}
              endIcon={<Iconify icon="uiw:reload" sx={{ width: 16, height: 16 }} />}
              onClick={reFetchData}
              loading={isLoading}
            >
              Re-fetch Data
            </LoadingButton>
            <Divider orientation="vertical" flexItem />
            <MonthYearPicker
              month={month}
              year={year}
              availableYears={availableYears}
              updateMonth={changeMonthHandler}
              updateYear={changeYearHandler}
              sx={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}
            />
          </Stack>
        </Card>
      )}
      {selectedTable && selectedTable.index !== 0 && (
        <OrdersListCard tableInfo={selectedTable} month={month} year={year} />
      )}
    </Stack>
  );
}

export default BranchTables;
