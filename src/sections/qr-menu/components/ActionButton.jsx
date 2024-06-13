import PropTypes from 'prop-types';

import { Stack, Badge, Typography, IconButton } from '@mui/material';

import Image from 'src/components/image/image';

ActionButton.propTypes = {
  clickAction: PropTypes.func,
  label: PropTypes.string,
  icon: PropTypes.string,
  badgeContent: PropTypes.any,
  sx: PropTypes.object,
};

export default function ActionButton({ clickAction, label, icon, badgeContent, sx }) {
  return (
    <IconButton disableTouchRipple disableRipple sx={{ p: 0 }} onClick={() => clickAction()}>
      <Stack direction="column" spacing={0} sx={{ alignSelf: 'center', alignItems: 'center' }}>
        <Badge badgeContent={badgeContent} color="warning">
          <Image src={icon} sx={{ width: 28, height: 28 }} />
        </Badge>
        <Typography variant="caption" color="primary" sx={{ ...sx, fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>
    </IconButton>
  );
}
