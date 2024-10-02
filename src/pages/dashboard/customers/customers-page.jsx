import { Helmet } from 'react-helmet-async';

import CustomersView from 'src/sections/customers/customers-view';

function CustomersPage() {
  return (
    <>
      <Helmet>
        <title>Customers</title>
      </Helmet>
      <CustomersView />
    </>
  );
}
export default CustomersPage;
