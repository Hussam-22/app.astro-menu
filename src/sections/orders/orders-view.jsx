import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import DownloadCSV from 'src/utils/download-csv';
import { useSettingsContext } from 'src/components/settings';
import OrdersListTable from 'src/sections/orders/table/orders-tables';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function OrdersView() {
  const { themeStretch } = useSettingsContext();

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
        action={<DownloadCSV name="customers-emails-list" />}
      />

      <OrdersListTable />
    </Container>
  );
}
export default OrdersView;
