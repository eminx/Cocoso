import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';
import ChevronDownIcon from 'lucide-react/dist/esm/icons/chevron-down';

import { StateContext } from '../LayoutContainer';
import { call } from '../utils/shared';
import ConfirmModal from '../generic/ConfirmModal';
import NiceSlider from '../generic/NiceSlider';

const buttonProps = {
  color: 'brand.700',
  fontFamily: "'Sarabun', sans-serif",
  fontSize: '15px',
  fontWeight: 'normal',
  lineHeight: 1.2,
  p: '2',
  textAlign: 'left',
  variant: 'ghost',
};

export default function FederationIconMenu() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { allHosts, currentHost, currentUser, isDesktop, platform } = useContext(StateContext);
  const [hostInfo, setHostInfo] = useState(null);
  const [tc] = useTranslation('common');
  const [t] = useTranslation('members');
  const navigate = useNavigate();

  if (!platform || !platform.isFederationLayout) {
    return null;
  }

  const handleSetHostInfo = async () => {
    try {
      const info = await call('getPortalHostInfoPage');
      setHostInfo(info);
      setInfoOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const isFederationLayout = platform && platform.isFederationLayout;
  const isPortalHost = currentHost?.isPortalHost;

  if (!isFederationLayout) {
    return null;
  }

  return (
    <>
      <HStack ml="2" className="federation-logo">
        <Image
          fit="contain"
          src="https://samarbetet.s3.eu-central-1.amazonaws.com/emin/adaptive-icon.png"
          w={isDesktop ? '54px' : '40px'}
          h={isDesktop ? '54px' : '40px'}
          onClick={() => handleSetHostInfo()}
        />

        <Box>
          {!currentUser ? (
            <Link to="/communities">
              <Button {...buttonProps} as="span">
                {tc('labels.allCommunities')}
              </Button>
            </Link>
          ) : (
            <Menu
              infoOpen={menuOpen}
              onOpen={() => setMenuOpen(true)}
              onClose={() => setMenuOpen(false)}
            >
              <MenuButton {...buttonProps} as={Button} rightIcon={<ChevronDownIcon size="18px" />}>
                {currentUser ? t('profile.myCommunities') : tc('labels.allCommunities')}
              </MenuButton>

              <MenuList>
                {currentUser
                  ? currentUser.memberships?.map((m) => (
                      <MenuItem key={m.host} onClick={() => (location.href = `https://${m.host}`)}>
                        {m.hostname}
                      </MenuItem>
                    ))
                  : allHosts.map((h) => (
                      <MenuItem key={h.host} onClick={() => (location.href = `https://${h.host}`)}>
                        {h.name}
                      </MenuItem>
                    ))}
                <Divider colorScheme="gray.700" mt="2" />
                <MenuItem
                  key="all-communities"
                  onClick={() =>
                    currentHost?.isPortalHost
                      ? navigate('/communities')
                      : (location.href = `https://${platform?.portalHost}/communities`)
                  }
                >
                  {tc('labels.allCommunities')}
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Box>
      </HStack>

      <ConfirmModal
        confirmText={tc('modals.toPortalApp')}
        hideFooter={isPortalHost && isFederationLayout}
        isCentered
        scrollBehavior="inside"
        size="2xl"
        title={platform?.name}
        visible={infoOpen}
        onConfirm={() => (window.location.href = `https://${platform.portalHost}`)}
        onCancel={() => setInfoOpen(false)}
        onOverlayClick={() => setInfoOpen(false)}
      >
        {hostInfo && (
          <Box>
            {hostInfo.images && (
              <Center mb="6">
                <NiceSlider alt={hostInfo.title} height="auto" images={hostInfo.images} />
              </Center>
            )}

            {hostInfo.longDescription && (
              <Box className="text-content">{parseHtml(hostInfo?.longDescription)}</Box>
            )}
          </Box>
        )}
      </ConfirmModal>
    </>
  );
}
