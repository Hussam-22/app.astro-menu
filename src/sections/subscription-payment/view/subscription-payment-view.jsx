// import { m } from 'framer-motion';

import { Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SubscriptionInfo from 'src/sections/subscription-payment/subscription-info';

function SubscriptionPaymentView() {
  const { themeStretch } = useSettingsContext();
  const {
    businessProfile: { subscriptionInfo },
  } = useAuthContext();

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Manage Your Subscription & Payment Info"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscription & Payment Info' },
        ]}
        action={<Typography variant="body2">ID: {subscriptionInfo.id}</Typography>}
      />
      <SubscriptionInfo />
    </Container>
  );
}
export default SubscriptionPaymentView;

// BranchManageView.propTypes = { tables: PropTypes.array };
