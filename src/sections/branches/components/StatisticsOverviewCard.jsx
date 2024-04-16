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
  const { fsGetTableOrdersByPeriod, fsGetBranch } = useAuthContext();

  const { data: branchInfo = {}, isFetching } = useQuery({
    queryKey: ['branch', tableInfo.branchID],
    queryFn: () => fsGetBranch(tableInfo.branchID),
    notifyOnChangeProps: [month, year],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['tableOrders', tableInfo.docID, tableInfo.branchID],
    queryFn: () => fsGetTableOrdersByPeriod(tableInfo.docID, tableInfo.branchID),
  });

  console.log(isFetching);

  const totalOrdersThisMonth =
    orders
      ?.filter(
        (order) =>
          order.isPaid &&
          new Date(order.lastUpdate.seconds * 1000).getMonth() === month &&
          new Date(order.lastUpdate.seconds * 1000).getFullYear() === year
      )
      .reduce((accumulator, currentOrder) => accumulator + currentOrder.totalBill, 0) || 0;

  const totalOrdersCountThisMonth = orders?.filter((order) => order.isPaid)?.length || 0;
  const totalScans = tableInfo?.statisticsSummary?.scans?.[year]?.[month] || 0;
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
          price={totalOrdersThisMonth}
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
