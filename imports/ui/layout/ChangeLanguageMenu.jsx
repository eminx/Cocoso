import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Menu, MenuButton, MenuList, MenuItem, Select, Text } from '@chakra-ui/react';

import { allLangs } from '../../startup/i18n';

export default ChangeLanguage = ({
  hideHelper = false,
  isCentered = false,
  register,
  select,
  onChange,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  if (!select)
    return (
      <Box textAlign={isCentered ? 'center' : 'initial'}>
        {!hideHelper && <Text fontSize="sm">{t('common:langs.form.label')}:</Text>}
        <Menu placement="top">
          <MenuButton fontWeight="bold" textDecoration="underline">
            {t(`common:langs.${i18n.language}`)}
          </MenuButton>
          <MenuList>
            {allLangs.map((lang) => (
              <MenuItem
                key={lang.value}
                color="gray.700"
                fontWeight={lang.value === currentLang ? 'bold' : 'normal'}
                onClick={() => i18n.changeLanguage(lang.value)}
              >
                {lang.label}
                {/* {t(`common:langs.${lang}`)} */}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>
    );

  return (
    <Box>
      {!hideHelper && <Text fontSize="sm">{t('common:langs.form.label')}:</Text>}
      <Select
        name="lang"
        placeholder={t('common:langs.form.holder')}
        onChange={(e) => onChange(e.target.value)}
        {...(register && register('lang'))}
      >
        {allLangs.map((lang) => (
          <option key={lang.value} selected={lang.value === currentLang} value={lang.value}>
            {lang.label}
            {/* {t(`common:langs.${lang}`)} */}
          </option>
        ))}
      </Select>
    </Box>
  );
};
