import {
  Button,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import { FaGithub } from 'react-icons/fa';

import Jumbotron from '../components/Jumbotron';
import Dropzone from '../components/Dropzone';
import Navbar from '../components/Navbar';
import type { NextPage } from 'next';
import Head from 'next/head';

interface HomeProps {
  backendURL: string;
  backendStatus: number;
  backendMessage: string;
}

const Home: NextPage<HomeProps> = (props) => {
  const { backendURL, backendStatus, backendMessage } = props;

  return (
    <>
      <Head>
        <title>RMBG - Background Image Removal</title>
        <meta name="description" content="Background Image Removal" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Navbar
        backendURL={backendURL}
        backendStatus={backendStatus}
        backendMessage={backendMessage}
      />
      <Container maxW={'container.sm'} mb={10}>
        <Jumbotron />
        <Dropzone backendURL={backendURL} />
        <Stack align={'center'} mt={10}>
          <Text fontWeight={'medium'}>
            Dibuat oleh{' '}
            <chakra.a
              href={'https://github/Refansa'}
              color={useColorModeValue('cyan.600', 'cyan.200')}
            >
              Refansa
            </chakra.a>
          </Text>
          <Stack direction={'row'} align={'center'}>
            <Text fontWeight={'medium'}>
              Sumber kode tersedia secara terbuka di{' '}
            </Text>
            <Button
              as={'a'}
              size={'sm'}
              leftIcon={<FaGithub />}
              href={'https://github/Refansa/rmbg'}
            >
              Github
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Home;
export { getServerSideProps } from '../components/Chakra';
