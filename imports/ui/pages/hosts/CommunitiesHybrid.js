import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Center, Code, Img, Link as CLink, Text } from '@chakra-ui/react';
import HTMLReactParser from 'html-react-parser';
import { useTranslation } from 'react-i18next';
import CheckIcon from 'lucide-react/dist/esm/icons/check';

import PageHeading from '../../listing/PageHeading';
import InfiniteScroller from '../../listing/InfiniteScroller';
import NewGridThumb from '../../listing/NewGridThumb';
import ConfirmModal from '../../generic/ConfirmModal';
import { message } from '../../generic/message';
import { call } from '../../utils/shared';

export default function CommunitiesHybrid({ currentUser, hosts, Host }) {
  const [modalItem, setModalItem] = useState(null);
  const [tc] = useTranslation('common');
  const navigate = useNavigate();

  const sortValue = 'name';

  const handleSetModalHost = async (host) => {
    try {
      const info = await call('getHostInfoPage', host.host);
      setModalItem({ ...host, info });
    } catch (error) {
      console.log(error);
    }
  };

  const getHostsSorted = () => {
    if (!hosts || hosts.length === 0) {
      return [];
    }
    return hosts.sort((a, b) => {
      if (sortValue === 'name') {
        const nameA = a?.name;
        const nameB = b?.name;
        return nameA?.localeCompare(nameB);
      }
      return new Date(b?.createdAt) - new Date(a?.createdAt);
    });
  };

  const getHostsDivided = (hostsSorted) => {
    if (!currentUser) {
      return hostsSorted;
    }

    const myHosts = currentUser.memberships;
    const myHostsSorted = myHosts.sort((a, b) => {
      if (sortValue === 'name') {
        const nameA = a?.hostname;
        const nameB = b?.hostname;
        return nameA?.localeCompare(nameB);
      }
      return new Date(b?.createdAt) - new Date(a?.createdAt);
    });

    return [
      ...myHostsSorted.map((mh) => ({
        ...mh,
        logo: hostsSorted.find((h) => mh.host === h.host)?.logo,
        isMember: true,
      })),
      ...hostsSorted.filter((h) => !myHosts.some((mh) => h.host === mh.host)),
    ];
  };

  const joinCommunity = async () => {
    if (!currentUser) {
      navigate('/register');
      return;
    }

    const host = modalItem.host;

    try {
      await call('setSelfAsParticipant', host);
      message.success(tc('communities.success', { community: modalItem.name }));
      setModalItem(null);
    } catch (error) {
      message.error(error.reason || error.error);
    }
  };

  const handleActionButtonClick = () => {
    window.location.href = `https://${modalItem.host}`;
  };

  const hostsSorted = getHostsSorted();
  const hostsRendered = getHostsDivided(hostsSorted).filter((h) => h.host !== Host.host);

  return (
    <>
      <PageHeading heading={tc('platform.communities')} />

      <Box px="2" mt="4">
        <InfiniteScroller hideFiltrerSorter items={hostsRendered}>
          {(host) => (
            <Box key={host.host} alignSelf="center" m="2" width={300}>
              <Box onClick={() => handleSetModalHost(host)}>
                <NewGridThumb
                  coverText={host.host}
                  fixedImageHeight
                  imageUrl={host.logo}
                  title={host.name || host.hostname}
                />
              </Box>

              <Box p="2">
                {host.isMember ? (
                  <Text color="white" textAlign="center" my="1">
                    {tc('communities.member')} <CheckIcon color="green.100" fontSize="md" mt="-1" />
                  </Text>
                ) : (
                  <Center>
                    <Button
                      bg="white"
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetModalHost(host)}
                    >
                      {tc('communities.join')}
                    </Button>
                  </Center>
                )}
              </Box>
            </Box>

            // <Box
            //   key={host._id}
            //   borderRadius="8px"
            //   cursor="pointer"
            //   mb="2"
            //   onClick={() => setModalItem(host)}
            // >
            //   <NewGridThumb
            //     fixedImageHeight
            //     host={Host?.isPortalHost ? host.host : null}
            //     imageUrl={host.images?.[0]}
            //     title={host.label}
            //   />
            // </Box>
          )}
        </InfiniteScroller>

        {modalItem && (
          <ConfirmModal
            confirmText={modalItem.isMember ? tc('actions.toHost') : tc('communities.join')}
            isCentered
            scrollBehavior="inside"
            size="lg"
            title={modalItem.name}
            visible
            onConfirm={modalItem.isMember ? handleActionButtonClick : joinCommunity}
            onCancel={() => setModalItem(null)}
          >
            <Center bg="gray.100" p="2">
              <Box>
                <Center>
                  <Text as="span" fontSize="sm">
                    {tc('actions.toHost')}:
                  </Text>
                  <Code fontSize="sm" linebreak="anywhere" mb="-3px" noOfLines={1}>
                    <CLink as="span" color="blue.600" onClick={handleActionButtonClick}>
                      {modalItem.host}
                    </CLink>
                  </Code>
                </Center>
                {modalItem.logo && (
                  <Center p="2">
                    <Img fit="contain" w="160px" src={modalItem.logo} />
                  </Center>
                )}
              </Box>
            </Center>

            <Box bg="white" maxW="520px" p="4">
              <Text fontSize="sm" fontWeight="bold" textAlign="center">
                {tc('communities.info', { community: modalItem.name })}
              </Text>
            </Box>

            <Box py="4" maxW="520px">
              {modalItem.info && (
                <div className="text-content">{HTMLReactParser(modalItem?.info)}</div>
              )}
            </Box>
          </ConfirmModal>
        )}
      </Box>
    </>
  );
}
