import { Stack } from '@mui/material';

import BusinessProfilePlanInfo from 'src/sections/business-profile/components/business-profile-plan-info';
import BusinessProfilePaymentInfo from 'src/sections/business-profile/components/business-profile-payment-info';

function BusinessProfilePlanPaymentInfo() {
  return (
    <Stack direction="column" spacing={2}>
      <BusinessProfilePlanInfo />
      <BusinessProfilePaymentInfo />
    </Stack>
  );
}
export default BusinessProfilePlanPaymentInfo;
