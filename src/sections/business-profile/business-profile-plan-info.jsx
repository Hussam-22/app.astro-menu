import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Link, Card, Stack, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { useAuthContext } from 'src/auth/hooks';
import { fDate, fDistance } from 'src/utils/format-time';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import { stripeCreatePortalSession } from 'src/stripe/functions';

// BusinessProfilePlanInfo.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function BusinessProfilePlanInfo() {
  const {
    businessProfile: { subscriptionInfo, email },
  } = useAuthContext();
  const { status, active } = useGetProductInfo();

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (data) => console.log(data),
  });

  const branch = subscriptionInfo.product_details.marketing_features.find((feature) =>
    feature.name.toLowerCase().includes('branch')
  ).name;

  const qr_codes = subscriptionInfo.product_details.marketing_features.find((feature) =>
    feature.name.toLowerCase().includes('qr')
  ).name;

  const languages = subscriptionInfo.product_details.marketing_features.find((feature) =>
    feature.name.toLowerCase().includes('translation')
  ).name;

  const pos = subscriptionInfo.product_details.marketing_features.find(
    (feature) =>
      feature.name.toLowerCase().includes('pos') &&
      !feature.name.toLowerCase().includes('not included')
  );

  const analytics = subscriptionInfo.product_details.marketing_features.find(
    (feature) =>
      feature.name.toLowerCase().includes('analytics') &&
      !feature.name.toLowerCase().includes('not included')
  );

  const selfOrder = subscriptionInfo.product_details.marketing_features.find(
    (feature) =>
      feature.name.toLowerCase().includes('self order') &&
      !feature.name.toLowerCase().includes('not included')
  );

  const startDate = fDate(new Date(subscriptionInfo.current_period_start * 1000));
  const endDate = fDate(new Date(subscriptionInfo.current_period_end * 1000));
  const remainingDays = fDistance(new Date(), new Date(subscriptionInfo.current_period_end * 1000));

  const isTrial = subscriptionInfo?.status === 'trialing';

  const trialStart = isTrial && fDate(new Date(subscriptionInfo.trial_start * 1000));
  const trialEnd = isTrial && fDate(new Date(subscriptionInfo.trial_end * 1000));
  const trialRemainingDays =
    isTrial && fDistance(new Date(), new Date(subscriptionInfo.trial_end * 1000));

  const labelContent = () => {
    if (status === 'Active') return { label: 'Active', color: 'success' };
    return { label: status, color: 'error' };
  };

  const openPortalSession = async () => stripeCreatePortalSession(email);

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
              {trialStart && trialEnd ? 'Trial' : 'Subscribed'}
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
              <Typography variant="h5">{subscriptionInfo.product_details.name}</Typography>
              <Typography variant="h6" sx={{ color: 'success.main' }}>
                {subscriptionInfo.price_details.unit_amount.toFixed(2) / 100} AED /
                {subscriptionInfo.items.data[0].plan.interval}
              </Typography>
            </Stack>
            <Image
              src={subscriptionInfo.product_details.images[0]}
              sx={{ borderRadius: 1, mx: 2 }}
            />
          </Stack>
          <Stack direction="column" spacing={2} flexGrow={1}>
            {isTrial && (
              <PlanInfoItem
                title="Trail Period"
                titleColor="warning.main"
                content={`${trialStart} to ${trialEnd}`}
                subContent={`${trialRemainingDays} remaining`}
                subContentColor="grey.600"
              />
            )}

            {!isTrial && (
              <PlanInfoItem
                title="Subscription Period"
                titleColor="primary.main"
                content={`${startDate} to ${endDate}`}
                subContent={active ? `${remainingDays} remaining` : 'Expired'}
                subContentColor="grey.600"
              />
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(25px, 1fr))',
                rowGap: 3,
              }}
            >
              <FeatureItem icon="lucide:scan-search" value="Unlimited*" title="Total Scans" />
              <FeatureItem
                icon="heroicons:building-storefront"
                value={`${branch}`}
                title="Branches"
              />
              <FeatureItem icon="lucide:qr-code" value={`${qr_codes} / branch`} title="QR Codes" />
              <FeatureItem icon="hugeicons:translate" value={`${languages}`} title="Languages" />
              <FeatureItem icon="mdi:network-pos" value={!!pos} title="POS Dashboard" />
              <FeatureItem icon="hugeicons:analytics-up" value={!!analytics} title="Analytics" />
              <FeatureItem
                icon="hugeicons:shopping-basket-add-03"
                value={!!selfOrder}
                title="Self Order"
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" sx={{ color: 'grey.600' }}>
                * Unlimited scans are subject to fair use policy
              </Typography>
              <Link
                href="https://astro-menu.vercel.app/features"
                target="_blank"
                underline="always"
                color="primary"
                sx={{ typography: 'caption' }}
              >
                Click here to learn more about each feature
              </Link>
            </Stack>
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
            onClick={() => mutate(openPortalSession)}
            loading={isPending}
            sx={{ whiteSpace: 'nowrap', px: 5, minWidth: '25%' }}
          >
            Open Subscription Portal
          </LoadingButton>
        </Stack>
      </Card>

      {/* <Card sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" p={3}>
          <LoadingButton
            variant="contained"
            color="secondary"
            startIcon={<Iconify icon="akar-icons:gear" />}
            onClick={() => mutate(createCustomer)}
            loading={isPending}
            sx={{ whiteSpace: 'nowrap', px: 5, minWidth: '25%' }}
          >
            Create Customer
          </LoadingButton>

          <LoadingButton
            variant="contained"
            color="secondary"
            startIcon={<Iconify icon="akar-icons:gear" />}
            onClick={() => mutate(createCheckoutSession)}
            loading={isPending}
            sx={{ whiteSpace: 'nowrap', px: 5, minWidth: '25%' }}
          >
            Create Checkout Session
          </LoadingButton>
        </Stack>
      </Card> */}
    </>
  );
}

export default BusinessProfilePlanInfo;

PlanInfoItem.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  subContent: PropTypes.string,
  subContentColor: PropTypes.string,
  titleColor: PropTypes.string,
};
function PlanInfoItem({
  title,
  content,
  subContent,
  subContentColor = 'common.black',
  titleColor = 'grey.400',
}) {
  return (
    <Stack direction="column" spacing={0}>
      <Typography variant="overline" sx={{ color: titleColor }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={3}>
        <Typography variant="body2">{content}</Typography>
        {subContent && (
          <Typography variant="body2" sx={{ color: subContentColor }}>
            {subContent}
          </Typography>
        )}
      </Stack>
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
    <Stack direction="column" spacing={0.5} alignItems="center">
      <Iconify icon={icon} color={value ? 'success' : 'grey.400'} sx={{ width: 28, height: 28 }} />
      <Typography
        variant="overline"
        sx={{ color: value ? 'primary.main' : 'grey.400', whiteSpace: 'wrap', textAlign: 'center' }}
      >
        {title}
      </Typography>
      {indicator}
    </Stack>
  );
}
