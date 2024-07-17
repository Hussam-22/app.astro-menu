import { useState } from 'react';
import PropTypes from 'prop-types';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Stack, Button, Avatar, useTheme } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import DownloadAllQRs from 'src/sections/branches/components/DownloadAllQRs';

import ChangeDefaultMenu from './dialogs/ChangeDefaultMenu';

TablesCard.propTypes = {
  tables: PropTypes.array,
  onTableClick: PropTypes.func,
  selectedTableID: PropTypes.string,
};

function TablesCard({ tables, onTableClick, selectedTableID }) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { isMenuOnly, maxTables } = useGetProductInfo();

  const onClose = () => setIsOpen(false);

  const downloadAllTableQRImages = () => {
    tables.map((table) => {
      const canvas = document.getElementById(table.docID);
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${table.index}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return null;
    });
  };

  return (
    <Grid xs={12}>
      <Stack direction="column" spacing={1}>
        {!isMenuOnly && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="text"
              startIcon={<Iconify icon="mdi:file-replace-outline" />}
              onClick={() => setIsOpen(true)}
            >
              Change Menu for All QRs
            </Button>
            <Button
              variant="text"
              startIcon={<Iconify icon="uil:image-download" />}
              onClick={downloadAllTableQRImages}
            >
              Download All QR Images
            </Button>
          </Box>
        )}
        <Card sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px 20px',
            }}
          >
            {[...tables]
              .sort((a, b) => a.index - b.index)
              .map((table) => (
                <Avatar
                  key={table.docID}
                  variant="rounded"
                  sx={{
                    width: 32,
                    height: 32,
                    border: `2px solid ${
                      table.isActive ? theme.palette.success.lighter : theme.palette.error.main
                    }`,
                    bgcolor:
                      // eslint-disable-next-line no-nested-ternary
                      selectedTableID === table.docID
                        ? table.isActive
                          ? 'success.main'
                          : 'error.main'
                        : 'unset',
                  }}
                >
                  <Button onClick={() => onTableClick(table)} sx={{ color: 'text.primary' }}>
                    {table.index}
                  </Button>
                </Avatar>
              ))}
          </Box>

          {isOpen && <ChangeDefaultMenu isOpen={isOpen} onClose={onClose} />}
          <DownloadAllQRs tables={tables} />
        </Card>
      </Stack>
    </Grid>
  );
}

export default TablesCard;
