import {
  Icon,
  Flex,
  Button,
  Heading,
  Tooltip,
  IconButton,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';

import { FaSun, FaMoon } from 'react-icons/fa';
import { MdImage } from 'react-icons/md';

import Link from 'next/link';

interface BackendStatusProps {
  backendURL: string;
  backendStatus: number;
  backendMessage: string;
}

interface NavbarProps extends BackendStatusProps {}

const BackendStatus: React.FC<BackendStatusProps> = (props) => {
  const { backendURL, backendStatus, backendMessage } = props;

  const buttonBreakpoint = useBreakpointValue(['sm', 'sm', 'md']);
  const statusBreakpoint = useBreakpointValue([
    backendMessage,
    `${backendStatus} ${backendMessage}`,
    `STATUS ${backendStatus} ${backendMessage}`,
  ]);

  const backgroundColor = backendStatus === 200 ? 'green' : 'red';

  return (
    <>
      <Tooltip label="Backend API Status" hasArrow>
        <Button
          as="a"
          mr={4}
          target="_blank"
          fontWeight="700"
          borderRadius="lg"
          href={backendURL}
          size={buttonBreakpoint}
          colorScheme={backgroundColor}
        >
          {statusBreakpoint}
        </Button>
      </Tooltip>
    </>
  );
};

const Logo: React.FC = () => {
  const color = useColorModeValue('green.500', 'green.200');

  return (
    <Flex color={color} mr={4} align="center" userSelect="none">
      <Link href="/">
        <a>
          <Flex align="center" mt={0.5}>
            <Icon as={MdImage} fontSize={{ base: '3xl', md: '4xl' }} mr={1} />
            <Heading
              as="h1"
              size="lg"
              fontWeight="semibold"
              mt={{ base: 0.5, md: 0 }}
            >
              RMBG
            </Heading>
          </Flex>
        </a>
      </Link>
    </Flex>
  );
};

const ToggleMode: React.FC = () => {
  const { toggleColorMode } = useColorMode();

  const icon = useColorModeValue(<FaMoon />, <FaSun />);

  const buttonBreakpoint = useBreakpointValue(['sm', 'sm', 'md']);

  return (
    <Flex ml="auto">
      <Tooltip label="Switch Mode" hasArrow>
        <IconButton
          aria-label="Change color mode"
          onClick={toggleColorMode}
          variant="ghost"
          colorScheme="green"
          size={buttonBreakpoint}
          icon={icon}
        />
      </Tooltip>
    </Flex>
  );
};

const Navbar: React.FC<NavbarProps> = (props) => {
  const { backendURL, backendStatus, backendMessage } = props;

  const backgroundColor = useColorModeValue('white', 'gray.800');

  return (
    <Flex
      p={4}
      top="0"
      w="100vw"
      maxW="100vw"
      zIndex={100}
      align="center"
      boxShadow="xs"
      bg={backgroundColor}
      pos={['relative', 'relative', 'sticky']}
    >
      <Logo />
      <BackendStatus
        backendStatus={backendStatus}
        backendURL={backendURL}
        backendMessage={backendMessage}
      />
      <ToggleMode />
    </Flex>
  );
};

export default Navbar;
