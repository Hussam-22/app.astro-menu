import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import { STRIPE } from 'src/config-global';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { useAuthContext } from 'src/auth/hooks';
import { fDate, fDistance } from 'src/utils/format-time';

// BusinessProfilePlanInfo.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function BusinessProfilePlanInfo() {
  const { businessProfile } = useAuthContext();
  const {
    media,
    name,
    description,
    trialExpiration,
    isTrial,
    isActive,
    isMenuOnly,
    limits: { analytics, scans, subUser, branch, languages, tables, pos },
  } = businessProfile.planInfo.at(-1);
  const paymentInfo = businessProfile.paymentInfo.at(-1);

  const trialExpirationDate = fDate(new Date(trialExpiration.seconds * 1000));
  const remainingDaysInNumbers = Math.floor((trialExpiration.seconds - Date.now() / 1000) / 86400);
  const remainingDays = fDistance(new Date(trialExpiration.seconds * 1000), new Date());

  const labelContent = () => {
    if (remainingDaysInNumbers > 0) return { label: 'Active', color: 'success' };
    return { label: 'Expired', color: 'error' };
  };

  // ----------------------------------------------------------------------------

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  const getCheckoutUrl = async () => {
    const body = {
      items: [{ id: 'prod_Q9pp1fjgXC82sy', quantity: 2 }],
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRIPE.secretKey}`,
    };

    // https://stripe-astro-menu.vercel.app/create-checkout-session
    // http://localhost:4242/create-checkout-session
    // gebp-dgbh-dfpy-dsor-szfs

    const response = await fetch('https://stripe-astro-menu.vercel.app/create-checkout-session', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const res = await response.json();

    console.log(res);

    window.location = res.url;
  };

  const getPortalSessionUrl = async () => {
    const body = {
      customerEmail: 'hussam@hotmail.co.uk',
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRIPE.secretKey}`,
    };

    // https://stripe-astro-menu.vercel.app/create-checkout-session
    // http://localhost:4242/create-checkout-session
    // gebp-dgbh-dfpy-dsor-szfs

    const response = await fetch('https://stripe-astro-menu.vercel.app/create-portal-session', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const res = await response.json();

    window.location = res.url;
  };

  return (
    <>
      <Card sx={{ p: 3, position: 'relative' }}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ position: 'absolute', top: 25, right: 25 }}
        >
          {isTrial && (
            <Label color={isTrial ? 'warning' : 'primary'} sx={{ fontSize: 16, p: 2 }}>
              {isTrial ? 'Trial' : 'Subscribed'}
            </Label>
          )}
          <Label color={labelContent().color} sx={{ fontSize: 16, p: 2 }}>
            {labelContent().label}
          </Label>
        </Stack>
        <Stack
          spacing={3}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack
            direction="column"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ maxWidth: '18%' }}
          >
            <Stack direction="column" spacing={0} justifyContent="center" alignItems="center">
              <Typography variant="overline" sx={{ color: 'grey.400' }}>
                current plan
              </Typography>
              <Typography variant="h4">{name}</Typography>
              <Typography variant="overline">
                {isTrial ? 'Free' : `${paymentInfo.amount}$ / ${paymentInfo.term}`}
              </Typography>
            </Stack>
            <Image src={`/assets/icons/plans/${media.icon}.svg`} sx={{ borderRadius: 1, mx: 2 }} />
          </Stack>
          <Stack direction="column" spacing={2} flexGrow={1}>
            {isTrial && (
              <PlanInfoItem
                title="Trial Expiration Date"
                content={`${trialExpirationDate} | In ${remainingDays}`}
              />
            )}

            <PlanInfoItem title="Description" content={description} />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack direction="row" spacing={2} justifyContent="space-evenly" flexWrap>
              <FeatureItem
                icon="lucide:scan-search"
                value={scans === 0 ? 'Unlimited*' : scans}
                title="Total Scans"
              />
              <FeatureItem
                icon="heroicons:building-storefront"
                value={`${branch}`}
                title="Branches"
              />
              <FeatureItem icon="lucide:qr-code" value={`${tables} per branch`} title="QR Codes" />
              <FeatureItem icon="hugeicons:translate" value={`${languages}`} title="Languages" />
              <FeatureItem icon="mdi:network-pos" value={!!pos} title="POS Dashboard" />
              {/* <FeatureItem
              icon="heroicons:users"
              value={subUser > 1 ? `${subUser} users` : false}
              title="Sub Users"
            /> */}
              <FeatureItem icon="hugeicons:analytics-up" value={!!analytics} title="Analytics" />
              <FeatureItem
                icon="hugeicons:shopping-basket-add-03"
                value={!isMenuOnly}
                title="Self Order"
              />
            </Stack>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              * Unlimited scans are subject to fair use policy
            </Typography>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" p={3}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Use the{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Subscription Portal
            </Box>{' '}
            to Upgrade/Downgrade your Plan, Download payment Invoices, Update your Payment Info or
            Cancel your Subscription
          </Typography>
          <LoadingButton
            variant="contained"
            color="secondary"
            startIcon={<Iconify icon="akar-icons:gear" />}
            onClick={() => mutate(getPortalSessionUrl)}
            loading={isPending}
            sx={{ whiteSpace: 'nowrap', px: 5 }}
          >
            Open Subscription Portal
          </LoadingButton>
        </Stack>
      </Card>
    </>
  );
}

export default BusinessProfilePlanInfo;

// eslint-disable-next-line react/prop-types
function PlanInfoItem({ title, content }) {
  return (
    <Stack direction="column" spacing={0}>
      <Typography variant="overline" sx={{ color: 'grey.400' }}>
        {title}
      </Typography>
      <Typography>{content}</Typography>
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
      <Typography variant="overline" sx={{ whiteSpace: 'wrap', textAlign: 'center' }}>
        {value}
      </Typography>
    );

  return (
    <Stack direction="column" spacing={1} alignItems="center">
      <Iconify icon={icon} color={value ? 'success' : 'grey.400'} sx={{ width: 28, height: 28 }} />
      <Typography
        variant="overline"
        sx={{ color: value ? 'success.main' : 'grey.400', whiteSpace: 'wrap', textAlign: 'center' }}
      >
        {title}
      </Typography>
      {indicator}
    </Stack>
  );
}
