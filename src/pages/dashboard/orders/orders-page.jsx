import { Helmet } from 'react-helmet-async';

import OrdersView from 'src/sections/orders/view/orders-view';

function CustomersPage() {
  return (
    <>
      <Helmet>
        <title>Customers</title>
      </Helmet>
      <OrdersView />
    </>
  );
}
export default CustomersPage;
