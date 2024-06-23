import PropTypes from 'prop-types';

import { Stack, Badge, Typography, IconButton } from '@mui/material';

import Image from 'src/components/image/image';

ActionButton.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string,
  icon: PropTypes.string,
  badgeContent: PropTypes.any,
  sx: PropTypes.object,
};

export default function ActionButton({ onClick, label, icon, badgeContent, sx }) {
  return (
    <IconButton disableTouchRipple disableRipple sx={{ p: 0 }} onClick={onClick}>
      <Stack direction="column" spacing={0} sx={{ alignSelf: 'center', alignItems: 'center' }}>
        <Badge badgeContent={badgeContent} color="primary">
          <Image src={icon} sx={{ width: 28, height: 28 }} />
        </Badge>
        <Typography variant="caption" color="primary" sx={{ ...sx, fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>
    </IconButton>
  );
}
