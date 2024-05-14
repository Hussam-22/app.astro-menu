import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Link,
  Card,
  Stack,
  alpha,
  Avatar,
  Button,
  Divider,
  useTheme,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { _socials } from 'src/_mock';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { useAuthContext } from 'src/auth/hooks';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LanguageDrawer from 'src/sections/qr-menu/drawers/language-drawer';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function QRMenuHomeView() {
  const theme = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const {
    businessProfile: {
      description,
      docID,
      defaultLanguage,
      businessName,
      translationEdited,
      translation,
    },
    branchInfo: { title, cover, wifiPassword, isActive: isBranchActive, email, number },
    tableInfo: { title: tableTitle, isActive: isTableActive, index },
    selectedLanguage,
  } = useQrMenuContext();
  const { fsGetImgDownloadUrl } = useAuthContext();
  const router = useRouter();

  const bucketPath = `${docID}/business-profile`;

  const { data: business_Logo = '' } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['business_Logo', docID],
    queryFn: () => fsGetImgDownloadUrl(bucketPath, 'logo_800x800.webp'),
    enabled: !!docID,
  });

  const getDescription = () => {
    if (selectedLanguage === defaultLanguage) return description;
    return translationEdited?.[selectedLanguage]?.desc
      ? translationEdited?.[selectedLanguage]?.desc
      : translation?.[selectedLanguage]?.desc;
  };

  const getTitle = () => {
    if (selectedLanguage === defaultLanguage) return businessName;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  if (!isBranchActive && isBranchActive !== undefined)
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 1,
          gap: 2,
        }}
      >
        <Iconify icon="zondicons:close-solid" sx={{ width: 64, height: 64 }} />
        <Typography variant="h1">Sorry this branch is not open !!</Typography>
      </Box>
    );

  return (
    <Box sx={{ py: 2 }}>
      <Card sx={{ p: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              variant="rounded"
              sx={{
                // width: 16,
                // height: 16,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
              color="default"
            >
              {index}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightBold }}>
              {tableTitle}
            </Typography>
          </Stack>
          <Stack direction="row">
            {wifiPassword && (
              <IconButton onClick={() => setIsWifiOpen(true)}>
                <Iconify
                  icon="tabler:wifi"
                  sx={{ color: 'common.alternative', width: 28, height: 28 }}
                />
              </IconButton>
            )}
            <IconButton onClick={() => setIsLangOpen(true)}>
              <Iconify
                icon="clarity:language-solid"
                sx={{ color: 'common.alternative', width: 28, height: 28 }}
              />
            </IconButton>
          </Stack>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
        <Stack direction="column" spacing={1}>
          <Box sx={{ position: 'relative' }}>
            <Image src={cover} sx={{ borderRadius: 1 }} ratio="16/9" />
            {business_Logo && (
              <Image
                src={business_Logo}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 1,
                  position: 'absolute',
                  zindex: 1,
                  bottom: -30,
                  right: 10,
                  border: `2px solid #000000`,
                }}
              />
            )}
          </Box>
          <Stack direction="column" spacing={0}>
            <Typography variant="h3">{getTitle()}</Typography>
            <Typography variant="caption">{title}</Typography>
          </Stack>
          <Typography variant="body2">{getDescription() || description}</Typography>
          <Button
            variant="contained"
            endIcon={<Iconify icon={isTableActive ? 'game-icons:meal' : 'zondicons:close-solid'} />}
            onClick={() => router.replace('menu')}
            disabled={!isTableActive}
            sx={{ my: 2 }}
          >
            {isTableActive ? 'Go to Menu' : 'Table is not accepting orders'}
          </Button>
          <Stack direction="column" alignItems="center" sx={{ mx: 1 }}>
            {email && <Typography variant="caption">{email}</Typography>}
            {number && <Typography variant="caption">{number}</Typography>}
            <SocialLinks />
          </Stack>
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
