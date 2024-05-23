import PropTypes from 'prop-types';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Card, Stack, Button, Divider, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { useAuthContext } from 'src/auth/hooks';

// BusinessProfilePaymentInfo.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function BusinessProfilePaymentInfo() {
  const { businessProfile } = useAuthContext();

  const { ownerInfo, country, address } = businessProfile;
  const { term, amount, nextPaymentDate, paymentDate } = businessProfile.paymentInfo.at(-1);

  const nextPayment = fDate(new Date(nextPaymentDate.seconds * 1000));
  const lastPayment = fDate(new Date(paymentDate.seconds * 1000));

  return (
    <Grid container spacing={1}>
      <Grid xs={12} sm={8}>
        <Stack spacing={2}>
          <Card sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={5}
              alignItems="center"
              divider={<Divider orientation="vertical" sx={{ borderStyle: 'dashed' }} flexItem />}
            >
              <Stack direction="column" spacing={1}>
                <Information title="Billing Name:" content={ownerInfo.displayName} />
                <Information title="Billing Address:" content={`${address} - ${country}`} />
                <Information title="Billing Term:" content={term} />
                <Information title="Amount:" content={`${amount}$`} />
                <Information title="Payment method:" content="**** **** **** 5041" />
              </Stack>
              <Stack direction="column" spacing={1} alignSelf="flex-start">
                <Information title="Last Payment" content={lastPayment} />
                <Information title="Next Payment Date" content={nextPayment} />
                <Information
                  title="Next Payment Amount"
                  content="500$"
                  sx={{ color: 'success.main', fontWeight: 'bold' }}
                />
              </Stack>
            </Stack>
            <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
            <Stack>
              <Button
                variant="contained"
                color="error"
                sx={{ alignSelf: 'flex-end' }}
                startIcon={<Iconify icon="hugeicons:cancel-02" />}
              >
                Cancel Subscription
              </Button>
            </Stack>
          </Card>
          <Card sx={{ p: 3 }}>Credit Card Info</Card>
        </Stack>
      </Grid>
      <Grid xs={12} sm={4}>
        <Card sx={{ p: 3 }}>Payment History</Card>
      </Grid>
    </Grid>
  );
}

export default BusinessProfilePaymentInfo;
// ----------------------------------------------------------------------------

Information.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  sx: PropTypes.object,
};

function Information({ title, content, sx }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ color: 'grey.500', width: 140 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ ...sx }}>
        {content}
      </Typography>
    </Stack>
  );
}
// ----------------------------------------------------------------------------

FeatureItem.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};
function FeatureItem({ icon, value, title }) {
  const indicator =
    typeof value === 'boolean' ? (
      <Iconify
        icon={value ? 'iconamoon:check-bold' : 'mdi:close'}
        sx={{ color: value ? 'success.main' : 'grey.400', width: 28, height: 28, mt: -0.75 }}
      />
    ) : (
      <Typography variant="body2">{value}</Typography>
    );

  return (
    <Stack direction="column" spacing={1} alignItems="center">
      <Iconify icon={icon} color={value ? 'success' : 'grey.400'} sx={{ width: 28, height: 28 }} />
      <Typography variant="overline" sx={{ color: value ? 'success.main' : 'grey.400' }}>
        {title}
      </Typography>
      {indicator}
    </Stack>
  );
}
