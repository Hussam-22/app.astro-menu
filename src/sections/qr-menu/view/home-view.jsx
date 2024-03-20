import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  Link,
  alpha,
  Stack,
  Button,
  Divider,
  useTheme,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import { _socials } from 'src/_mock';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LanguageDrawer from 'src/sections/qr-menu/drawers/language-drawer';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function QRMenuHomeView() {
  const theme = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const {
    user,
    branchInfo: { title, description, translationEdited, translation, cover, wifiPassword },
    tableInfo: { title: tableTitle },
    selectedLanguage,
  } = useQrMenuContext();
  const router = useRouter();

  const getDescription = () => {
    if (selectedLanguage === user.defaultLanguage) return description;
    return translationEdited?.[selectedLanguage]?.desc
      ? translationEdited?.[selectedLanguage]?.desc
      : translation?.[selectedLanguage]?.desc;
  };

  return (
    <Box sx={{ py: 2 }}>
      <Card sx={{ p: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightBold }}>
            {tableTitle}
          </Typography>
          <Stack direction="row">
            {wifiPassword && (
              <IconButton onClick={() => setIsWifiOpen(true)}>
                <Iconify icon="tabler:wifi" sx={{ color: '#000000', width: 28, height: 28 }} />
              </IconButton>
            )}
            <IconButton onClick={() => setIsLangOpen(true)}>
              <Iconify
                icon="clarity:language-solid"
                sx={{ color: '#000000', width: 28, height: 28 }}
              />
            </IconButton>
          </Stack>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
        <Stack direction="column" spacing={2}>
          <Image src={cover} sx={{ borderRadius: 1 }} ratio="16/9" />
          <Box>
            <Typography variant="overline">Welcome to</Typography>
            <Typography variant="h3">{title}</Typography>
            <Typography variant="body2">{getDescription()}</Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<Iconify icon="game-icons:meal" />}
            onClick={() => router.replace('menu')}
          >
            Go to Menu
          </Button>
          <SocialLinks />
          <Box>
            <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />
            <Typography variant="caption" component="div" sx={{ textAlign: 'center' }}>
              © All rights reserved | made by
              <Link href="https://minimals.cc/"> Mage Menu </Link>
            </Typography>
          </Box>
        </Stack>
      </Card>
      {isLangOpen && (
        <LanguageDrawer openState={isLangOpen} toggleDrawer={() => setIsLangOpen(false)} />
      )}
      {isWifiOpen && (
        <ConfirmDialog
          title="Wifi Password"
          content={<WifiTextField value={wifiPassword} />}
          open={isWifiOpen}
          onClose={() => setIsWifiOpen(false)}
        />
      )}
    </Box>
  );
}
export default QRMenuHomeView;
// QRMenuHomeView.propTypes = { tables: PropTypes.array };

// ----------------------------------------------------------------------------

function SocialLinks() {
  const { branchInfo } = useQrMenuContext();
  const socialLinksArr = Object.entries(branchInfo?.socialLinks || {}).filter(
    (link) => link[1] !== ''
  );
  return (
    <Stack direction="row" justifyContent="center">
      {socialLinksArr.map(([name, link]) => {
        const socialObj = _socials.find((social) => social.value === name);
        if (!socialObj) return null;
        return (
          <Link key={name} href='"https://minimals.cc/"' target="_blank" rel="noopener">
            <IconButton
              sx={{
                '&:hover': {
                  bgcolor: alpha(socialObj.color, 0.08),
                },
              }}
            >
              <Iconify color={socialObj.color} icon={socialObj.icon} />
            </IconButton>
          </Link>
        );
      })}
    </Stack>
  );
}

// ----------------------------------------------------------------------------
WifiTextField.propTypes = { value: PropTypes.string };

function WifiTextField({ value }) {
  const copUrlHandler = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <TextField
      name="URL"
      value={value}
      size="small"
      fullWidth
      aria-readonly
      InputProps={{
        endAdornment: (
          <IconButton
            size="small"
            sx={{
              p: 0,
              m: 0,
              transition: 'transform 0.2s ease',
              '&:active': { transform: 'scale(1.5)' },
            }}
            onClick={copUrlHandler}
          >
            <Iconify icon="mdi:clipboard-multiple-outline" sx={{ color: '#000000', ml: 2 }} />
          </IconButton>
        ),
      }}
    />
  );
}
