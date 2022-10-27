import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const styles = {
  global: (props) => ({
    '*::placeholder': {
      color: 'gray.900',
    },
  }),
};

const chakraTheme = extendTheme({
  colors: {
    gray: {
      100: 'rgb(245, 245, 245)',
      200: 'rgb(235, 235, 235)',
      300: 'rgb(225, 225, 225)',
      400: 'rgb(215, 215, 215)',
      500: 'rgb(155, 155, 155)',
      600: 'rgb(85, 85, 85)',
      700: 'rgb(65, 65, 65)',
      800: 'rgb(45, 45, 45)',
      900: 'rgb(25, 25, 25)',
    },
  },
  components: {
    Input: {
      defaultProps: {
        variant: 'filled',
      },
    },
    Select: {
      defaultProps: {
        variant: 'filled',
      },
    },
    Tabs: {
      defaultProps: {
        colorScheme: 'gray.800',
      },
    },
    TabList: {
      defaultProps: {
        flexWrap: 'wrap',
      },
    },
    Textarea: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
  fonts: {
    // heading: "'Charter-bold', 'Sarabun', sans-serif",
    heading: "'Sarabun', sans-serif",
    body: "'Sarabun', sans-serif",
  },
});

export { chakraTheme, styles };
