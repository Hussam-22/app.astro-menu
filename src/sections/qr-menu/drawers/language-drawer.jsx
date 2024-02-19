import useSWR from 'swr';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Stack, Drawer } from '@mui/material';

import Image from 'src/components/image';
import { fetcher } from 'src/utils/axios';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

LanguageDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function LanguageDrawer({ openState, toggleDrawer }) {
  const { user } = useQrMenuContext();

  return (
    <Drawer
      anchor="bottom"
      open={openState}
      PaperProps={{
        sx: {
          maxHeight: '50%',
          minHeight: '20%',
        },
      }}
      onClose={() => toggleDrawer('cart')}
    >
      <Stack
        direction="column"
        spacing={1}
        sx={{ p: 3, mx: 'auto' }}
        justifyContent="left"
        alignItems="left"
      >
        {user?.languages.length !== 0 &&
          user.languages.map((language) => (
            <LanguageButton toggleDrawer={toggleDrawer} code={language} key={language} />
          ))}
      </Stack>
    </Drawer>
  );
}

export default LanguageDrawer;

// ----------------------------------------------------------------------------

function LanguageButton({ code, toggleDrawer }) {
  const { setLanguage, selectedLanguage } = useQrMenuContext();
  const [loading, setLoading] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(
    `https://restcountries.com/v3.1/lang/${LANGUAGE_CODES[code]}?fields=languages,flags`,
    fetcher
  );

  const onlanguagechange = () => {
    setLoading(true);

    setTimeout(() => {
      setLanguage(code);
      setLoading(false);
      toggleDrawer('cart');
    }, 500);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {!isValidating && data.length !== 0 && (
        <Image
          src={`${data.filter((item) => Object.keys(item.languages).length === 1)[0].flags.svg}`}
          sx={{ width: 44, height: 28, borderRadius: 1 }}
          onClick={() => onlanguagechange(code)}
        />
      )}
      <LoadingButton
        variant={selectedLanguage === code ? 'contained' : 'outlined'}
        onClick={() => onlanguagechange(code)}
        loading={loading}
        sx={{
          minWidth: 200,
        }}
      >
        {LANGUAGE_CODES[code]}
      </LoadingButton>
    </Stack>
  );
}

LanguageButton.propTypes = {
  code: PropTypes.string,
  toggleDrawer: PropTypes.func,
};
