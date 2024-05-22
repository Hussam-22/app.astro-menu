import PropTypes from 'prop-types';

import { Card, Stack, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import Image from 'src/components/image/image';
import { useAuthContext } from 'src/auth/hooks';

// BusinessProfilePaymentInfo.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function BusinessProfilePaymentInfo() {
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

  const trialExpirationDate = fDate(new Date(trialExpiration.seconds * 1000));
  const remainingDays = Math.floor((trialExpiration.seconds - Date.now() / 1000) / 86400);

  const labelContent = () => {
    if (isTrial) return { label: 'Trial', color: 'info' };
    if (isActive) return { label: 'Active', color: 'success' };
    return { label: 'Expired', color: 'error' };
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack
        spacing={3}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
      >
        <Image
          src={`/assets/icons/plans/${media.icon}.svg`}
          sx={{ width: 150, height: 150, borderRadius: 1, mx: 2 }}
        />
        <Stack direction="column" spacing={2} flexGrow={1}>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <PlanInfoItem title="Current Plan" content={name} />
            <Label color={labelContent().color} sx={{ fontSize: 16, p: 2 }}>
              {labelContent().label}
            </Label>
          </Stack>
          <PlanInfoItem
            title="Trial Expiration Date"
            content={`${trialExpirationDate} | ${remainingDays} Day(s) Remaining`}
          />
          <PlanInfoItem title="Description" content={description} />
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Stack direction="row" spacing={2} justifyContent="space-evenly">
            <FeatureItem icon="lucide:scan-search" value={scans} title="Total Scans" />
            <FeatureItem
              icon="heroicons:building-storefront"
              value={`${branch} branch(es)`}
              title="Branches"
            />
            <FeatureItem icon="lucide:qr-code" value={`${tables} QR Code(s)`} title="QR Codes" />
            <FeatureItem
              icon="hugeicons:translate"
              value={`${languages} Language(s)`}
              title="Languages"
            />
            <FeatureItem
              icon="heroicons:users"
              value={subUser > 1 ? `${subUser} users` : false}
              title="Sub Users"
            />
            <FeatureItem icon="hugeicons:analytics-up" value={!!analytics} title="Analytics" />
            <FeatureItem
              icon="hugeicons:shopping-basket-add-03"
              value={!isMenuOnly}
              title="Self Order"
            />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export default BusinessProfilePaymentInfo;
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
