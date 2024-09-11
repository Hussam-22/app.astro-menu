import { Helmet } from 'react-helmet-async';

import SubscriptionPaymentView from 'src/sections/subscription-payment/view/subscription-payment-view';

function BusinessProfileManagePage() {
  return (
    <>
      <Helmet>
        <title> Subscription & Payment</title>
      </Helmet>
      <SubscriptionPaymentView />
    </>
  );
}
export default BusinessProfileManagePage;
