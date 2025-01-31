import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Box, Link as CLink, Tabs as CTabs, Tab, TabList } from '@chakra-ui/react';

const linkStyle = {
  marginBottom: 0,
};

const tabProps = {
  _hover: {
    borderBottomColor: 'brand.200',
  },
  _focus: {
    boxShadow: 'none',
  },
  _selected: {
    borderBottomColor: 'brand.500',
  },
  as: 'span',
  fontFamily: "'Sarabun', sans-serif",
  fontWeight: 'bold',
  justifyContent: 'flex-start',
  paddingInline: '4',
};

function CoTab({ tab }) {
  if (!tab) {
    return null;
  }

  return (
    <Tab {...tabProps}>
      {tab.title}
      {tab.badge && (
        <Badge colorScheme="red" size="xs" mt="-2">
          {tab.badge}
        </Badge>
      )}
    </Tab>
  );
}

function Tabs({ tabs, children, ...otherProps }) {
  return (
    <Box position="relative" top="1px">
      <CTabs flexShrink="0" variant="line" {...otherProps}>
        <TabList flexWrap="wrap" borderBottom="none">
          {tabs?.map((tab, index) =>
            tab.path ? (
              <Link key={tab.title} to={tab.path} style={linkStyle} onClick={tab.onClick}>
                <CoTab index={index} tab={tab} />
              </Link>
            ) : (
              <CLink
                key={tab.title}
                _hover={{ textDecoration: 'none' }}
                style={linkStyle}
                onClick={tab.onClick}
              >
                <CoTab tab={tab} />
              </CLink>
            )
          )}
          {children}
        </TabList>
      </CTabs>
    </Box>
  );
}

export default Tabs;
