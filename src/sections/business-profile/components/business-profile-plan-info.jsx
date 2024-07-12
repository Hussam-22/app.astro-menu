import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Button, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { useAuthContext } from 'src/auth/hooks';
import { fDate, fDistance } from 'src/utils/format-time';
import { stripeCreateCustomer, stripeCreatePortalSession } from 'src/stripe/functions';

// BusinessProfilePlanInfo.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function BusinessProfilePlanInfo() {
  const { businessProfile, fsGetStripePayments, fsGetStripePlan } = useAuthContext();
  const {
    isMenuOnly,
    limits: { analytics, scans, branch, languages, tables, pos },
  } = businessProfile.planInfo.at(-1);

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (data) => console.log(data),
  });

  const { data: stripePaymentsData, error: stripePaymentsError } = useQuery({
    queryKey: ['stripePayments'],
    queryFn: async () => fsGetStripePayments('cus_QSJrj2wHrcqD9b'),
  });

  const { data: stripePlanData, error: stripePlanError } = useQuery({
    queryKey: ['stripePlanInfo', stripePaymentsData?.[0]?.items?.data?.[0]?.price?.product],
    queryFn: async () => fsGetStripePlan(stripePaymentsData?.[0]?.items?.data?.[0]?.price?.product),
  });

  const isTrial = stripePaymentsData[0]?.status === 'trialing';

  console.log(stripePaymentsData[0]);

  console.log(new Date(stripePaymentsData[0].trial_end * 1000));

  const startDate = fDate(new Date(stripePaymentsData[0].current_period_start * 1000));
  const endDate = fDate(new Date(stripePaymentsData[0].current_period_end * 1000));
  const remainingDays = fDistance(
    new Date(),
    new Date(stripePaymentsData[0].current_period_end * 1000)
  );

  const trialStart = stripePaymentsData[0]?.trial_start
    ? fDate(new Date(stripePaymentsData[0].trial_start * 1000))
    : undefined;
  const trialEnd = stripePaymentsData[0]?.trial_end
    ? fDate(new Date(stripePaymentsData[0].trial_end * 1000))
    : undefined;
  const trialRemainingDays =
    trialStart && trialEnd
      ? fDistance(new Date(), new Date(stripePaymentsData[0].trial_end * 1000))
      : undefined;

  const labelContent = () => {
    if (remainingDays > 0) return { label: 'Active', color: 'success' };
    return { label: 'Expired', color: 'error' };
  };

  const openPortalSession = async () => stripeCreatePortalSession('hussam@hotmail.co.uk');

  // const createCheckoutSession = async () => stripeCreateCheckoutSession([], true);
  const createCustomer = async () =>
    stripeCreateCustomer('hussam.alkhudari@gmail.com', 'Hussam Al Khudari');

  return (
    <>
      <Button variant="soft" onClick={createCustomer}>
        Create Customer
      </Button>
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
              <Typography variant="h4">{stripePlanData?.name}</Typography>
              <Typography variant="h5">
                {stripePlanData?.price_details &&
                  stripePlanData.price_details.unit_amount.toFixed(2) / 100}{' '}
                AED
              </Typography>
            </Stack>
            <Image src={stripePlanData?.images[0]} sx={{ borderRadius: 1, mx: 2 }} />
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
                titleColor="success.main"
                content={`${startDate} to ${endDate}`}
                subContent={`${remainingDays} remaining`}
                subContentColor="grey.600"
              />
            )}

            <PlanInfoItem title="Description" content={stripePlanData?.description} />
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
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography>{content}</Typography>
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
