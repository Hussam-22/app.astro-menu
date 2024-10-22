import { memo } from 'react';
import PropTypes from 'prop-types';

import { Box, Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { SOCIAL_ICONS } from 'src/_mock/socials';
import { RHFTextField } from 'src/components/hook-form';
import { useGetProductInfo } from 'src/hooks/use-get-product';

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
          <SocialLinkItem
            key={item.value}
            name={`socialLinks.${item.value}`}
            label={item.name}
            icon={item.icon}
            helperText={item?.helperText}
          />
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
  helperText: PropTypes.string,
};

function SocialLinkItem({ name, label, icon, helperText }) {
  const { isMenuOnly } = useGetProductInfo();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} sx={{ width: 32, height: 32 }} />

      <Stack direction="column" flexGrow={1}>
        <RHFTextField name={name} label={label} />
        {helperText && !isMenuOnly && (
          <Typography variant="caption" color="secondary.main" sx={{ pl: 1 }}>
            *{helperText}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
