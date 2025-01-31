import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';
import parseHtml from 'html-react-parser';
import { Helmet } from 'react-helmet';
import NiceSlider from '../generic/NiceSlider';

import { parseTitle } from '../utils/shared';
import PagesList from './PagesList';

function SimplePage({ description, images, title }) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={images && images[0]} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* <Center>
        <Heading
          as="h1"
          lineHeight={1}
          my="4"
          size="lg"
          textAlign="center"
          textShadow="1px 1px 1px #fff"
        >
          {title}
        </Heading>
      </Center> */}

      {images && (
        <Center py="2" mb="0">
          <NiceSlider alt={title} images={images} />
        </Center>
      )}

      {description && (
        <Center>
          <Box bg="white" className="text-content" maxW="540px" p="6" my="4">
            {description && parseHtml(description)}
          </Box>
        </Center>
      )}
    </>
  );
}

export default function PageHybrid({ pages }) {
  const { pageTitle } = useParams();
  const currentPage = pages.find((page) => parseTitle(page.title) === pageTitle);
  const navigate = useNavigate();

  if (!pages || pages.length === 0) {
    return null;
  }

  if (!currentPage) {
    navigate(`/pages/${parseTitle(pages[0].title)}`);
    return null;
  }

  return (
    <>
      <PagesList currentPage={currentPage} pages={pages} />
      <SimplePage
        description={currentPage.longDescription}
        images={currentPage.images}
        title={currentPage.title}
      />
    </>
  );
}
