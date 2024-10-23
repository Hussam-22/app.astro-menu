import PropTypes from 'prop-types';

// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { useTheme, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';

//
import LinkItem from './link-item';

// ----------------------------------------------------------------------

export default function CustomBreadcrumbs({
  links,
  action,
  heading,
  moreLink,
  activeLast,
  sx,
  ...other
}) {
  const lastLink = links[links.length - 1].name;
  const theme = useTheme();

  return (
    <Box sx={{ borderBottom: `dashed 1px ${theme.palette.divider}`, pb: 1, mb: 2, ...sx }}>
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }}>
        <Box sx={{ flexGrow: 1 }}>
          {/* HEADING */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {heading && (
              <Typography variant="h4" gutterBottom>
                {heading}
              </Typography>
            )}
            {action && (
              <Box sx={{ flexShrink: 0 }}>
                <IconButton
                  color="secondary"
                  onClick={action}
                  disableFocusRipple
                  disableTouchRipple
                  disableRipple
                >
                  <Typography variant="body2" sx={{ px: 0.5 }}>
                    Add
                  </Typography>
                  <Iconify icon="subway:add" sx={{ width: 24, height: 24 }} />{' '}
                </IconButton>
              </Box>
            )}
          </Stack>

          {/* BREADCRUMBS */}
          {!!links.length && (
            <Breadcrumbs separator={<Separator />} {...other}>
              {links.map((link) => (
                <LinkItem
                  key={link.name || ''}
                  link={link}
                  activeLast={activeLast}
                  disabled={link.name === lastLink}
                />
              ))}
            </Breadcrumbs>
          )}
        </Box>
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

CustomBreadcrumbs.propTypes = {
  sx: PropTypes.object,
  action: PropTypes.func,
  links: PropTypes.array,
  heading: PropTypes.string,
  moreLink: PropTypes.array,
  activeLast: PropTypes.bool,
};

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
    />
  );
}
