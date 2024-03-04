import { Helmet } from 'react-helmet-async';

import StaffView from 'src/sections/staff/view/waiter-view';

export default function StaffPage() {
  return (
    <>
      <Helmet>
        <title>Waiter Page</title>
      </Helmet>
      <StaffView />
    </>
  );
}
