import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};
const theme = extendTheme({
  config,
  colors: {
    greenAlpha: {
      50: 'rgba(56, 161, 105, 0.04)',
      100: 'rgba(56, 161, 105, 0.06)',
      200: 'rgba(56, 161, 105, 0.08)',
      300: 'rgba(56, 161, 105, 0.16)',
      400: 'rgba(56, 161, 105, 0.24)',
      500: 'rgba(56, 161, 105, 0.36)',
      600: 'rgba(56, 161, 105, 0.48)',
      700: 'rgba(56, 161, 105, 0.64)',
      800: 'rgba(56, 161, 105, 0.80)',
      900: 'rgba(56, 161, 105, 0.92)',
    },
  },
  fonts: {
    heading: 'Black Ops One, cursive',
    body: 'Poppins, sans-serif',
  },
});

export default theme;
