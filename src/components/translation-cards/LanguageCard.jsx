import PropTypes from 'prop-types';

import { Card, Stack, CardHeader } from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';

import TranslationTextField from './TranslationTextField';

// ----------------------------------------------------------------------

LanguageCard.propTypes = {
  languageKey: PropTypes.string,
  showTitleField: PropTypes.bool,
  showDescriptionField: PropTypes.bool,
  data: PropTypes.object,
};

export default function LanguageCard({
  languageKey,
  showTitleField = true,
  showDescriptionField = true,
  data,
}) {
  return (
    <Card>
      <CardHeader title={LANGUAGE_CODES[languageKey].value} sx={{ color: 'primary.main' }} />
      <Stack direction="column" spacing={3} sx={{ p: 2 }}>
        {showTitleField && (
          <TranslationTextField field="title" label="Title" languageKey={languageKey} data={data} />
        )}
        {showDescriptionField && (
          <TranslationTextField
            direction="row"
            field="desc"
            label="Description"
            languageKey={languageKey}
            data={data}
          />
        )}
      </Stack>
    </Card>
  );
}
