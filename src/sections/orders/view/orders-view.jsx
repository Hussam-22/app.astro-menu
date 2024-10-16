import { useState } from 'react';

import { Box, Tab, Tabs, Divider, useTheme, Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import SearchSingleOrder from 'src/sections/orders/search-single-order';
import SearchMultipleOrders from 'src/sections/orders/search-multiple-orders';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function OrdersView() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('Search Multiple Orders');

  const TABS = [
    {
      value: 'Search Multiple Orders',
      icon: <Iconify icon="fluent:form-multiple-48-regular" width={20} height={20} />,
      component: <SearchMultipleOrders />,
    },
    {
      value: 'Search Single Order',
      icon: <Iconify icon="solar:bill-list-broken" width={20} height={20} />,
      component: <SearchSingleOrder />,
    },
  ];

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Orders List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Orders List',
          },
        ]}
        // action={<DownloadCSV name="customers-emails-list" />}
      />

      <Tabs
        allowScrollButtonsMobile
        variant="scrollable"
        scrollButtons="auto"
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
        sx={{ bgcolor: theme.palette.background.paper, mt: 2, px: 2, pb: 1, borderRadius: 1 }}
      >
        {TABS.map((tab) => (
          <Tab disableRipple key={tab.value} label={tab.value} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

      {TABS.map((tab) => {
        const isMatched = tab.value === currentTab;
        return (
          isMatched && (
            // <Box component={m.div} {...getVariant('fadeInUp')} key={tab.value} id={tab.value}>
            <Box key={tab.value} id={tab.value}>
              {tab.component}
            </Box>
          )
        );
      })}
    </Container>
  );
}
export default OrdersView;
