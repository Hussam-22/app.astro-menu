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
  const titleData = {
    translated: data?.translation[languageKey]?.title || '',
    editedTranslation: data?.translationEdited[languageKey]?.title || '',
  };

  const descriptionData = {
    translated: data?.translation[languageKey]?.desc || '',
    editedTranslation: data?.translationEdited[languageKey]?.desc || '',
  };
  return (
    <Card>
      <CardHeader title={LANGUAGE_CODES[languageKey]} />
      <Stack direction="column" spacing={3} sx={{ p: 2 }}>
        {showTitleField && (
          <TranslationTextField
            field="title"
            label="Title"
            languageKey={languageKey}
            data={titleData}
          />
        )}
        {showDescriptionField && (
          <TranslationTextField
            direction="row"
            field="desc"
            label="Description"
            languageKey={languageKey}
            data={descriptionData}
          />
        )}
      </Stack>
    </Card>
  );
}
