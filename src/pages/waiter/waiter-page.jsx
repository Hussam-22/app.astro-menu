import { Helmet } from 'react-helmet-async';

import WaiterView from 'src/sections/waiter/view/waiter-view';

export default function WaiterPage() {
  return (
    <>
      <Helmet>
        <title>Waiter Page</title>
      </Helmet>
      <WaiterView />
    </>
  );
}
