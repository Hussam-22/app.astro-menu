import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Card, Stack, Divider, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { fShortenNumber } from 'src/utils/format-number';
import { useResponsive } from 'src/hooks/use-responsive';
import OverviewCard from 'src/sections/branches/components/analytic/Overview-card';

StatisticsOverviewCard.propTypes = {
  tableInfo: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

function StatisticsOverviewCard({ tableInfo, month, year }) {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');
  const { fsGetTableOrdersByPeriod, fsGetBranch, fsGetTableInfo, fsGetAllMenus } = useAuthContext();

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', tableInfo.branchID],
    queryFn: () => fsGetBranch(tableInfo.branchID),
  });

  const { data: tableData = {} } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['table', tableInfo.docID, month, year],
    queryFn: () => fsGetTableInfo(tableInfo.businessProfileID, branchInfo.docID, tableInfo.docID),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['tableOrders', tableInfo.docID, tableInfo.branchID, month, year],
    queryFn: () => fsGetTableOrdersByPeriod(tableInfo.docID, tableInfo.branchID, month, year),
  });

  const { data: menusList = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
  });

  const totalOrdersThisMonth = useMemo(
    () =>
      orders
        ?.filter(
          (order) =>
            order?.isPaid &&
            new Date(order.initiationTime.seconds * 1000).getMonth() === month &&
            new Date(order.initiationTime.seconds * 1000).getFullYear() === year
        )
        .reduce((accumulator, currentOrder) => accumulator + +currentOrder.totalBill, 0) || 0,
    [month, orders, year]
  );

  const formattedTotalOrdersThisMonth = Number.isNaN(totalOrdersThisMonth)
    ? 0
    : totalOrdersThisMonth.toFixed(2);

  const totalOrdersCountThisMonth = orders?.filter((order) => order.isPaid)?.length || 0;
  const totalScans = tableData?.statisticsSummary?.scans?.[year]?.[month] || 0;

  const selectedMenu = useMemo(
    () => menusList.find((menu) => menu.docID === tableInfo.menuID),
    [menusList, tableInfo.menuID]
  );

  return (
    <Card sx={{ py: 1 }}>
      <Stack
        direction="row"
        divider={
          <Divider
            orientation="horizontal"
            flexItem
            sx={{ borderStyle: 'dashed', my: isMobile && 1 }}
          />
        }
        justifyContent="space-evenly"
      >
        <OverviewCard
          title="Active Menu"
          subtitle={selectedMenu?.title}
          icon="fluent:food-32-regular"
          color="primary.main"
        />

        {tableData?.index !== 0 && (
          <OverviewCard
            title="Total Income"
            subtitle={formattedTotalOrdersThisMonth}
            icon="solar:money-bag-line-duotone"
          />
        )}

        {tableData?.index !== 0 && (
          <OverviewCard
            title="Total Orders"
            subtitle={totalOrdersCountThisMonth ? fShortenNumber(totalOrdersCountThisMonth) : 0}
            icon="line-md:circle-to-confirm-circle-transition"
          />
        )}

        <OverviewCard
          title="Total Scans"
          subtitle={totalScans ? fShortenNumber(totalScans) : 0}
          icon="clarity:qr-code-line"
        />
      </Stack>
    </Card>
  );
}

export default StatisticsOverviewCard;
