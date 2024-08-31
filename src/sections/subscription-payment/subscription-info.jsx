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

// SubscriptionInfo.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function SubscriptionInfo() {
  const {
    businessProfile: { subscriptionInfo, productInfo, ownerInfo },
  } = useAuthContext();
  const { status, isActive } = useGetProductInfo();

  const { metadata } = productInfo;

  // console.log({ subscriptionInfo, ownerInfo, status, isActive });

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (data) => console.log(data),
  });

  const startDate = fDate(new Date(subscriptionInfo.current_period_start * 1000));
  const endDate = fDate(new Date(subscriptionInfo.current_period_end * 1000));
  const remainingDays = fDistance(new Date(), new Date(subscriptionInfo.current_period_end * 1000));

  const isTrial = subscriptionInfo?.status === 'trialing';

  const trialStart = isTrial && fDate(new Date(subscriptionInfo.trial_start * 1000));
  const trialEnd = isTrial && fDate(new Date(subscriptionInfo.trial_end * 1000));
  const trialRemainingDays =
    isTrial && fDistance(new Date(), new Date(subscriptionInfo.trial_end * 1000));

  const labelContent = () => {
    if (status === 'active') return { label: 'Active', color: 'success' };
    return { label: status, color: 'error' };
  };

  const openPortalSession = async () => stripeCreatePortalSession(ownerInfo.email);

  return (
    <>
      <Card sx={{ mb: 2 }}>
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
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ maxWidth: '18%' }}
          >
            <Stack direction="column" spacing={0} justifyContent="center" alignItems="center">
              <Typography variant="overline" sx={{ color: 'grey.400' }}>
                current plan
              </Typography>
              <Typography variant="h5">{productInfo.name}</Typography>
              <Typography variant="h6" sx={{ color: 'success.main' }}>
                {subscriptionInfo.price_details.unit_amount.toFixed(2) / 100} AED /
                {subscriptionInfo.items.data[0].plan.interval}
              </Typography>
            </Stack>
            <Image
              src={subscriptionInfo.product_details.images[0]}
              sx={{ borderRadius: 1, mx: 2, width: '60%' }}
            />
          </Stack>

          <Stack direction="column" spacing={2} flexGrow={1}>
            {isTrial && (
              <PlanInfoItem
                title="Trail Period"
                titleColor="warning.main"
                content={`${trialStart} to ${trialEnd}`}
                subContent={`${trialRemainingDays} remaining`}
              />
            )}

            {!isTrial && (
              <PlanInfoItem
                title="Subscription Period"
                titleColor="primary.main"
                content={`${startDate} to ${endDate}`}
                subContent={isActive ? `${remainingDays} remaining` : 'Expired'}
                subContentColor="grey.600"
              />
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack
              direction="column"
              spacing={0.5}
              divider={<Divider orientation="horizontal" sx={{ borderStyle: 'dashed' }} />}
            >
              <FeatureItem
                value="Unlimited* (Unlimited scans are subject to fair use policy)"
                title="Total Scans"
              />
              <FeatureItem value={`${metadata?.branches}`} title="Branches" />
              <FeatureItem value={`${metadata?.tables} / per branch`} title="QR Codes" />
              <FeatureItem value={`${metadata?.meals}`} title="Meals" />
              <FeatureItem value={`${metadata?.menus}`} title="Menus" />
              <FeatureItem value={`${metadata?.languages}`} title="Translation Languages" />
              <FeatureItem
                value={metadata?.pos === 'true' ? 'Included' : 'Not Included'}
                title="POS Dashboard"
              />
              <FeatureItem
                value={metadata?.kitchen === 'true' ? 'Included' : 'Not Included'}
                title="Kitchen Dashboard"
              />
              <FeatureItem
                value={metadata?.analytics === 'true' ? 'Included' : 'Not Included'}
                title="Analytics "
              />
              <FeatureItem
                value={metadata?.isMenuOnly === 'false' ? 'Included' : 'Not Included'}
                title="Self Order"
              />
            </Stack>

            <Link
              href="https://astro-menu.vercel.app/features"
              target="_blank"
              underline="always"
              color="primary"
              sx={{ typography: 'body2', textAlign: 'right' }}
            >
              Click here to learn more about each feature
            </Link>
          </Stack>
        </Stack>
      </Card>
    </>
  );
}

export default SubscriptionInfo;

PlanInfoItem.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  subContent: PropTypes.string,
};
function PlanInfoItem({ title, content, subContent }) {
  return (
    <Stack direction="column" spacing={0}>
      <Typography sx={{ fontWeight: '600' }}>{title}</Typography>
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem sx={{ borderColor: '#D9D9D9' }} />}
      >
        <Typography variant="body2">{content}</Typography>
        {subContent && <Typography variant="body2">{subContent}</Typography>}
      </Stack>
    </Stack>
  );
}
// ----------------------------------------------------------------------------

FeatureItem.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};
function FeatureItem({ value, title }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '0.3fr 1fr' }}>
      <Typography sx={{ fontWeight: 600 }}>{title}: </Typography>
      <Typography sx={{ textTransform: 'capitalize' }}>{value}</Typography>
    </Box>
  );
}
