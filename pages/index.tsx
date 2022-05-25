import Jumbotron from '../components/Jumbotron';
import Dropzone from '../components/Dropzone';
import { Container } from '@chakra-ui/react';
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
      <Container maxW="container.sm" mb={10}>
        <Jumbotron />
        <Dropzone backendURL={backendURL} />
      </Container>
    </>
  );
};

export default Home;
export { getServerSideProps } from '../components/Chakra';
