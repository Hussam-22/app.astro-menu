import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Card, Stack, Divider, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import TotalScans from 'src/sections/branches/components/analytic/TotalScans';
import TotalOrders from 'src/sections/branches/components/analytic/TotalOrders';

StatisticsOverviewCard.propTypes = {
  tableInfo: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

function StatisticsOverviewCard({ tableInfo, month, year }) {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');
  const { fsGetTableOrdersByPeriod, fsGetBranch, fsGetTableInfo } = useAuthContext();

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', tableInfo.branchID],
    queryFn: () => fsGetBranch(tableInfo.branchID),
  });

  const { data: tableData = {} } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['table', tableInfo.docID, month, year],
    queryFn: () => fsGetTableInfo(tableInfo.userID, branchInfo.docID, tableInfo.docID),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['tableOrders', tableInfo.docID, tableInfo.branchID, month, year],
    queryFn: () => fsGetTableOrdersByPeriod(tableInfo.docID, tableInfo.branchID, month, year),
  });

  const totalOrdersThisMonth =
    orders
      ?.filter(
        (order) =>
          order.isPaid &&
          new Date(order.initiationTime.seconds * 1000).getMonth() === month &&
          new Date(order.initiationTime.seconds * 1000).getFullYear() === year
      )
      .reduce((accumulator, currentOrder) => accumulator + currentOrder.totalBill, 0) || 0;

  const totalOrdersCountThisMonth = orders?.filter((order) => order.isPaid)?.length || 0;
  const totalScans = tableData?.statisticsSummary?.scans?.[year]?.[month] || 0;
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack
        direction="column"
        spacing={2}
        divider={
          <Divider
            orientation="horizontal"
            flexItem
            sx={{ borderStyle: 'dashed', my: isMobile && 1 }}
          />
        }
        justifyContent="center"
        sx={{ height: '100%' }}
      >
        <TotalOrders
          title="Total Orders"
          total={totalOrdersCountThisMonth}
          price={+totalOrdersThisMonth.toFixed(2)}
          icon="fluent-emoji-high-contrast:money-bag"
          color={theme.palette.success.main}
          currency={branchInfo?.currency}
        />
        <TotalScans
          title="Total Scans"
          total={totalScans}
          percent={0}
          price={0}
          icon="clarity:qr-code-line"
          color={theme.palette.info.main}
        />
      </Stack>
    </Card>
  );
}

export default StatisticsOverviewCard;
