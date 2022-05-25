import type { AppProps } from 'next/app';
import Chakra from '../components/Chakra';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Chakra cookies={pageProps.cookies}>
      <Component {...pageProps} />
    </Chakra>
  );
};

export default App;
