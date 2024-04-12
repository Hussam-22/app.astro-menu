import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Chip, Card, Stack, Divider, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import TotalScans from 'src/sections/branches/components/analytic/TotalScans';
import TotalOrders from 'src/sections/branches/components/analytic/TotalOrders';

StatisticsOverviewCard.propTypes = {
  tableInfo: PropTypes.object,
};

const thisMonth = new Date().getMonth();
const thisYear = new Date().getFullYear();
const dateShort = new Date().toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' });

function StatisticsOverviewCard({ tableInfo }) {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'sm');
  const { fsGetAllTableOrders } = useAuthContext();

  const { data: orders = [] } = useQuery({
    queryKey: ['tableOrders', tableInfo.docID],
    queryFn: () => fsGetAllTableOrders(tableInfo.docID),
  });

  // ----------------------------- Month Total Orders -----------------------------------------
  const totalOrdersThisMonth =
    orders
      ?.filter(
        (order) =>
          order.isPaid &&
          new Date(order.lastUpdate.seconds * 1000).getMonth() === thisMonth &&
          new Date(order.lastUpdate.seconds * 1000).getFullYear() === thisYear
      )
      .reduce((accumulator, currentOrder) => accumulator + currentOrder.totalBill, 0) || 0;

  const totalOrdersCountThisMonth = orders.filter((order) => order.isPaid).length;
  const totalScans = tableInfo?.statisticsSummary?.scans?.[thisYear]?.[thisMonth] || 0;
  // // ----------------------------- Month Top 3 Meals -----------------------------------------
  // const thisMonthOrders = orders.filter(
  //   (order) => fDate(new Date(order.confirmTime.seconds * 1000).getMonth()) === fDate(new Date().getMonth())
  // );
  // const flatMeals = thisMonthOrders.flatMap((order) => order.cart.map((cart) => cart.title));
  // const uniqueMeals = [...new Set(flatMeals)];
  // const duplicate = uniqueMeals
  //   .map((value) => [value, flatMeals.filter((str) => str === value).length])
  //   .sort((a, b) => a[1] - b[1])
  //   .reverse();

  // ----------------------------- Month Total Scans -----------------------------------------

  // branch?.statisticsSummary?.tables?.[tableID]?.scans?.[thisYear]?.[thisMonth] || 0;
  // ----------------------------------------------------------------------------

  return (
    <Card sx={{ mb: 2, py: 2, display: 'flex' }}>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        divider={
          <Divider
            orientation={isMobile ? 'horizontal' : 'vertical'}
            flexItem
            sx={{ borderStyle: 'dashed', my: isMobile && 1 }}
          />
        }
      >
        <TotalOrders
          title="Total Orders"
          total={totalOrdersCountThisMonth}
          price={totalOrdersThisMonth}
          icon="fluent-emoji-high-contrast:money-bag"
          color={theme.palette.success.main}
        />
        {/* <TopOrderedMeals
          title="Most 3 Ordered Meals"
          price={25}
          icon="game-icons:hot-meal"
          color={theme.palette.secondary.main}
          totalMealsToDisplay={3}
          topMealsArray={duplicate}
        /> */}
        <TotalScans
          title="Total Scans"
          total={totalScans}
          percent={0}
          price={0}
          icon="clarity:qr-code-line"
          color={theme.palette.info.main}
        />
      </Stack>
      <Chip label={dateShort} sx={{ position: 'absolute', right: 10, top: 5 }} />
    </Card>
  );
}

export default StatisticsOverviewCard;
