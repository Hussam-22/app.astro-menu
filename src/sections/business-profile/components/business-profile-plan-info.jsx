import PropTypes from 'prop-types';

import { Card, Stack, Button, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import Image from 'src/components/image/image';
import { useAuthContext } from 'src/auth/hooks';

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
    limits: { analytics, scans, subUser, branch, languages, tables },
  } = businessProfile.planInfo.at(-1);
  const paymentInfo = businessProfile.paymentInfo.at(-1);

  const trialExpirationDate = fDate(new Date(trialExpiration.seconds * 1000));
  const remainingDays = Math.floor((trialExpiration.seconds - Date.now() / 1000) / 86400);

  const labelContent = () => {
    if (isTrial) return { label: 'Trial', color: 'info' };
    if (isActive) return { label: 'Active', color: 'success' };
    return { label: 'Expired', color: 'error' };
  };

  return (
    <Card sx={{ p: 3, position: 'relative' }}>
      <Label
        color={labelContent().color}
        sx={{ fontSize: 16, p: 2, position: 'absolute', top: 25, right: 25 }}
      >
        {labelContent().label}
      </Label>
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
              {`${paymentInfo.amount}$ / ${paymentInfo.term}`}
            </Typography>
          </Stack>
          <Image src={`/assets/icons/plans/${media.icon}.svg`} sx={{ borderRadius: 1, mx: 2 }} />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="heroicons-solid:switch-vertical" />}
          >
            Change Plan
          </Button>
        </Stack>
        <Stack direction="column" spacing={2} flexGrow={1}>
          {isTrial && (
            <PlanInfoItem
              title="Trial Expiration Date"
              content={`${trialExpirationDate} | ${remainingDays} Day(s) Remaining`}
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
        </Stack>
      </Stack>
      <Typography variant="body2" sx={{ mt: 2, color: 'grey.600' }}>
        * Unlimited scans are subject to fair use policy
      </Typography>
    </Card>
  );
}

export default BusinessProfilePlanInfo;
// ----------------------------------------------------------------------------

PlanInfoItem.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
};

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
