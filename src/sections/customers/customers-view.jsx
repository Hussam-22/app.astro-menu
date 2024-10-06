import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import DownloadCSV from 'src/utils/download-csv';
import { useSettingsContext } from 'src/components/settings';
import OrdersListTable from 'src/sections/customers/table/orders-tables';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const TABLE_HEAD = [
  { id: 'customerEmail', label: 'Customer Email', align: 'left', width: '30%' },
  { id: 'lastOrder', label: 'Last Visit', align: 'left', width: '15%' },
  { id: 'branch', label: 'Last Branch', align: 'left', width: '20%' },
  { id: 'visits', label: 'Visits', align: 'left', width: '15%' },
  { id: 'actionButtons', label: '', align: 'left', width: '6%' },
];
// ----------------------------------------------------------------------

function CustomersView() {
  const { themeStretch } = useSettingsContext();

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Orders List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Customers', href: paths.dashboard.meal.list },
          {
            name: 'Orders List',
          },
        ]}
        action={<DownloadCSV name="Orders-list" />}
      />

      <OrdersListTable />
    </Container>
  );
}
export default CustomersView;
