import { memo } from 'react';

import { Box } from '@mui/system';
import { Typography } from '@mui/material';

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
        <RHFTextField name="socialLinks.facebook" label="Facebook" />
        <RHFTextField name="socialLinks.instagram" label="Instagram" />
        <RHFTextField name="socialLinks.twitter" label="Twitter" />
        <RHFTextField name="socialLinks.youtube" label="Youtube" />
        <RHFTextField name="socialLinks.snapchat" label="Snapchat" />
        <RHFTextField name="socialLinks.tiktok" label="Tiktok" />
        <RHFTextField name="socialLinks.linkedin" label="LinkedIn" />
        <RHFTextField name="socialLinks.website" label="Website" />
      </Box>
    </Box>
  );
}

export default memo(BranchSocialLinks);
