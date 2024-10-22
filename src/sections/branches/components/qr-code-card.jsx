import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';

import { Box, Card, Stack, useTheme, TextField, IconButton } from '@mui/material';

import { DOMAINS } from 'src/config-global';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

function QRCodeCard({ tableInfo }) {
  const theme = useTheme();
  const { user } = useAuthContext();

  const qrURL = `${DOMAINS.menu}/${user.businessProfileID}/${tableInfo?.branchID}/${tableInfo?.docID}/home`;

  const copUrlHandler = () => {
    navigator.clipboard.writeText(qrURL);
  };

  const downloadQR = () => {
    const canvas = document.getElementById(tableInfo.index);
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `display-only-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const onShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `QR Code for ${tableInfo?.index}`,
          text: 'Scan this QR code to view the menu',
          url: qrURL,
        })
        .then(() => true)
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Web Share API not supported in your browser.');
    }
  };

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'center',
          mt: 2,
        }}
      >
        <QRCodeCanvas
          value={qrURL}
          size={200}
          id={tableInfo?.index}
          style={{
            border: `solid 5px ${theme.palette.primary.main}`,
            borderRadius: 3,
            padding: 10,
          }}
        />
        <Stack direction="row" spacing={3}>
          <IconButton
            variant="text"
            onClick={downloadQR}
            sx={{ p: 0, m: 0, color: theme.palette.secondary.main }}
            disableRipple
          >
            <Iconify icon="uil:image-download" sx={{ width: 24, height: 24 }} />
          </IconButton>

          <IconButton
            variant="text"
            onClick={copUrlHandler}
            sx={{
              p: 0,
              m: 0,
              color: theme.palette.secondary.main,
              transition: 'transform 0.2s ease',
              '&:active': { transform: 'scale(1.2)' },
            }}
            disableRipple
          >
            <Iconify icon="solar:copy-linear" sx={{ width: 24, height: 24 }} />
          </IconButton>

          <IconButton
            variant="text"
            onClick={onShare}
            sx={{ p: 0, m: 0, color: theme.palette.secondary.main }}
            disableRipple
          >
            <Iconify icon="ph:share-fat-fill" sx={{ width: 24, height: 24 }} />
          </IconButton>
        </Stack>
        <TextField name="URL" value={qrURL} size="small" fullWidth aria-readonly />
      </Box>
    </Card>
  );
}
export default QRCodeCard;
QRCodeCard.propTypes = { tableInfo: PropTypes.object };
