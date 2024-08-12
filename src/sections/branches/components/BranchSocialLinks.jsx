import { memo } from 'react';
import PropTypes from 'prop-types';

import { Box, Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { SOCIAL_ICONS } from 'src/_mock/socials';
import { RHFTextField } from 'src/components/hook-form';

function BranchSocialLinks() {
  return (
    <Box>
      <Typography variant="h3">Social Links</Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
          mt: 1,
        }}
      >
        {SOCIAL_ICONS.map((item) => (
          <SocialLinkItem key={item.value} name={item.value} label={item.name} icon={item.icon} />
        ))}
      </Box>
    </Box>
  );
}

export default memo(BranchSocialLinks);

// ----------------------------------------------------------------------------
SocialLinkItem.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.string,
};

function SocialLinkItem({ name, label, icon }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} />
      <RHFTextField name={name} label={label} />
    </Stack>
  );
}
