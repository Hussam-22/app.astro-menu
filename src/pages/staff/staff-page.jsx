import { Helmet } from 'react-helmet-async';

import StaffView from 'src/sections/waiter-staff-dashboard/view/staff-view';

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
