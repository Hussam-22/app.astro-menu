import PropTypes from 'prop-types';

import { Card, Stack, CardHeader } from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';

import TranslationTextField from './TranslationTextField';

// ----------------------------------------------------------------------

LanguageCard.propTypes = {
  languageKey: PropTypes.string,
  reduxSlice: PropTypes.string,
  showTitleField: PropTypes.bool,
  showDescriptionField: PropTypes.bool,
};

export default function LanguageCard({
  languageKey,
  reduxSlice,
  showTitleField = true,
  showDescriptionField = true,
}) {
  return (
    <Card>
      <CardHeader title={LANGUAGE_CODES[languageKey]} />
      <Stack direction="column" spacing={3} sx={{ p: 2 }}>
        {showTitleField && (
          <TranslationTextField
            field="title"
            label="Title"
            languageKey={languageKey}
            reduxSlice={reduxSlice}
          />
        )}
        {showDescriptionField && (
          <TranslationTextField
            field="desc"
            label="Description"
            languageKey={languageKey}
            reduxSlice={reduxSlice}
            direction="row"
          />
        )}
      </Stack>
    </Card>
  );
}
