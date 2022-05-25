import { chakra, Container, Text, useColorModeValue } from '@chakra-ui/react';

const Jumbotron: React.FC = () => {
  const color = useColorModeValue(
    'var(--chakra-colors-green-500)',
    'var(--chakra-colors-green-200)'
  );
  return (
    <Container p={4} maxW="container.md" mb={8}>
      <Text
        mb={8}
        align="center"
        fontWeight="700"
        fontSize={['3xl', '4xl', '5xl']}
      >
        Hapus latar belakang foto
        <chakra.span color={color}> dengan mudah</chakra.span>
      </Text>
      <Text
        align="center"
        color="gray.500"
        fontWeight="medium"
        fontSize={['md', 'lg', 'xl']}
      >
        RMBG adalah alat untuk menghapus latar belakang pada foto hanya dengan
        mengupload gambar yang diinginkan.
      </Text>
    </Container>
  );
};

export default Jumbotron;
