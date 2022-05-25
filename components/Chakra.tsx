import { GetServerSideProps } from 'next';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import '@fontsource/black-ops-one/400.css';

import {
  ChakraProvider,
  localStorageManager,
  cookieStorageManager,
} from '@chakra-ui/react';

import theme from '../lib/theme';

const Chakra = ({ cookies, children }: any) => {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManager(cookies)
      : localStorageManager;

  return (
    <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
      {children}
    </ChakraProvider>
  );
};

const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const backendURL: string = process.env.NGROK_URL || '';

  const getAPIStatus = async () => {
    let status: number = 404;
    let message: string = 'BAD';

    try {
      const response: Response = await fetch(backendURL);
      const json = await response.json();

      status = response.status;
      message = json.message;

      return { status, message };
    } catch {
      return { status, message };
    }
  };

  const { status, message } = await getAPIStatus();

  return {
    props: {
      backendURL,
      backendStatus: status,
      backendMessage: message,
      cookies: req.headers.cookie ?? '',
    },
  };
};

export default Chakra;
export { getServerSideProps };
