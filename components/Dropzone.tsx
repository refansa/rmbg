/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';

import {
  Box,
  Icon,
  Text,
  Flex,
  Image,
  Stack,
  chakra,
  Button,
  Tooltip,
  Container,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';

import { VscError } from 'react-icons/vsc';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { MdImage, MdOutlineErrorOutline } from 'react-icons/md';

import axios from 'axios';
import { fromImage } from 'imtool';
import pRetry, { FailedAttemptError } from 'p-retry';

import truncate from '../lib/truncate';
import 'animate.css';

interface DropzoneProps {
  backendURL: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ backendURL }) => {
  interface CounterProps {
    success: number;
    reject: number;
    error: number;
  }

  interface PromptStyleProps {
    type: 'idle' | 'error' | 'success';
    message: any;
  }

  interface ImageProps {
    src?: string;
    fileName?: string;
    fileFullName?: string;
    fileExtension?: string;
  }

  let timeoutID: any;

  // Max file dimension to limit the size of the image
  const MAX_FILE_DIMENSION: number = 2048;

  const PROMPT_NO_OF_LINES: number = 5;

  const [disabled, setDisabled] = useState<boolean>(false);
  const [counter, setCounter] = useState<CounterProps>({
    success: 0,
    reject: 0,
    error: 0,
  });

  const [prompt, setPrompt] = useState<PromptStyleProps>({
    type: 'idle',
    message: `Catatan: Jika salah satu dari dimensi gambar melebihi ${MAX_FILE_DIMENSION} pixel, maka gambar tersebut akan dikompres sebelum diproses dan akan keluar dengan resolusi tersebut.`,
  });

  const [images, setImages] = useState<ImageProps[]>([]);

  const errorColor = useColorModeValue('red.500', 'red.200');
  const successColor = useColorModeValue('green.500', 'green.200');
  const idleColor = useColorModeValue('blackAlpha.900', 'whiteAlpha.900');

  const transparentImage = useColorModeValue(
    'transparent.png',
    'transparent-dark.png'
  );

  const promptFactory: React.FC<PromptStyleProps> = ({ type, message }) => {
    switch (type) {
      case 'error':
        return (
          <Text
            my={6}
            fontWeight="500"
            textAlign="center"
            color={errorColor}
            noOfLines={PROMPT_NO_OF_LINES}
            className={'animate__animated animate__headShake'}
          >
            {message}
          </Text>
        );
      case 'success':
        return (
          <Text
            my={6}
            fontWeight="500"
            textAlign="center"
            color={successColor}
            noOfLines={PROMPT_NO_OF_LINES}
          >
            {message}
          </Text>
        );
      default:
        return (
          <Text
            my={6}
            fontWeight="500"
            color={idleColor}
            textAlign="center"
            noOfLines={PROMPT_NO_OF_LINES}
          >
            {message}
          </Text>
        );
    }
  };

  const onDropAccepted = useCallback(async (acceptedFiles: File[]) => {
    clearTimeout(timeoutID);
    setDisabled(true);

    const clearPrompt = (delay: number) => {
      timeoutID = setTimeout(() => {
        setPrompt({
          type: 'idle',
          message: `Jika salah satu dari dimension gambar melebihi ${MAX_FILE_DIMENSION} pixel, maka gambar tersebut akan dikompres sebelum diproses dan akan keluar dengan resolusi tersebut.`,
        });
      }, delay);
    };

    const file = acceptedFiles[0];
    const fileName = file.name.split('.')[0];
    const fileExtension = file.name.split('.').pop();

    const tool = await fromImage(file);
    const scaledFile = await tool
      .thumbnail(MAX_FILE_DIMENSION)
      .toFile(file.name);

    try {
      const response = await pRetry(
        async () => {
          const response = await axios({
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            method: 'POST',
            responseType: 'blob',
            url: `${backendURL}/api/`,
            data: {
              file: scaledFile,
            },
            onUploadProgress: (progressEvent: ProgressEvent) => {
              const percentCompleted: number = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              setPrompt({
                type: 'success',
                message: (
                  <>
                    Sedang mengupload file {percentCompleted}%
                    <br />
                    <chakra.span
                      _dark={{ color: 'white' }}
                      _light={{ color: 'black' }}
                    >
                      {truncate(fileName, 20)}.{fileExtension}
                    </chakra.span>
                  </>
                ),
              });

              if (percentCompleted === 100) {
                setPrompt({
                  type: 'success',
                  message: (
                    <>
                      Sedang memproses file...
                      <br />
                      <chakra.span
                        _dark={{ color: 'white' }}
                        _light={{ color: 'black' }}
                      >
                        {truncate(fileName, 20)}.{fileExtension}
                      </chakra.span>
                    </>
                  ),
                });
              }
            },
            onDownloadProgress: (progressEvent: ProgressEvent) => {
              const percentCompleted: number = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              setPrompt({
                type: 'success',
                message: (
                  <>
                    Sedang mendownload file {percentCompleted}%
                    <br />
                    <chakra.span
                      _dark={{ color: 'white' }}
                      _light={{ color: 'black' }}
                    >
                      {truncate(fileName, 20)}.{fileExtension}
                    </chakra.span>
                  </>
                ),
              });
            },
          });

          if (response.status === 404) {
            throw new Error('404 Not Found');
          }

          return response;
        },
        {
          retries: 5,
          onFailedAttempt: async (error: FailedAttemptError) => {
            // Try pinging the server to see if it's still up.
            try {
              await fetch(`${backendURL}`);
            } catch (err) {
              console.log(err);
            }

            setTimeout(() => {
              setPrompt({
                type: 'error',
                message: (
                  <>
                    Pemrosesan file gagal, coba lagi... ({error.retriesLeft})
                    <br />
                    <chakra.span
                      _dark={{ color: 'white' }}
                      _light={{ color: 'black' }}
                    >
                      {truncate(fileName, 20)}.{fileExtension}
                    </chakra.span>
                  </>
                ),
              });
            }, 3000);
          },
        }
      );

      const blob: Blob = response.data;
      const url: string = URL.createObjectURL(blob);

      setImages((images) => [
        ...images,
        { src: url, fileFullName: file.name, fileExtension, fileName },
      ]);

      setCounter((counter) => ({
        ...counter,
        success: counter.success + 1,
      }));

      clearPrompt(0);
      setDisabled(false);
    } catch (err: any) {
      setCounter((counter) => ({
        ...counter,
        error: counter.error + 1,
      }));

      setPrompt({
        type: 'error',
        message: err.message,
      });

      clearPrompt(5000);
      setDisabled(false);
    }
  }, []);

  const {
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    getInputProps,
  } = useDropzone({
    accept: { 'image/*': [] },
    disabled,
    onDropAccepted,
    onDropRejected: (files: FileRejection[]) => {
      files.forEach(() => {
        setCounter((counter) => ({
          ...counter,
          reject: counter.reject + 1,
        }));
      });
    },
  });

  const dropBorder = isDragAccept
    ? 'green.500'
    : isDragReject
    ? 'red.500'
    : 'gray.500';

  const dropBg = useColorModeValue(
    isDragActive ? 'blackAlpha.100' : 'transparent',
    isDragActive ? 'whiteAlpha.100' : 'transparent'
  );

  return (
    <Container>
      <Flex
        p={10}
        bg={dropBg}
        align={'center'}
        borderRadius={4}
        color={'gray.500'}
        {...getRootProps()}
        direction={'column'}
        border={'3px dashed'}
        borderColor={dropBorder}
        opacity={disabled ? '0.1' : '1'}
        cursor={disabled ? 'wait' : 'cursor'}
        transition={'background-color 0.2s linear'}
        _hover={{
          bg: useColorModeValue('blackAlpha.100', 'whiteAlpha.100'),
        }}
      >
        <input {...getInputProps()} />
        <Icon as={MdImage} mb={4} w={16} h={16} />
        <Text
          fontSize={'md'}
          align={'center'}
          userSelect={'none'}
          fontWeight={'medium'}
        >
          Tarik dan lepas filenya disini
          <br />
          atau
          <br />
          klik untuk memilih file
        </Text>
      </Flex>
      {promptFactory(prompt)}
      <Box>
        <Flex>
          <Flex flex={{ base: 1 }} display={{ base: 'none', sm: 'flex' }} />
          <Flex
            flex={{ base: 1 }}
            justify={{ base: 'flex-start', sm: 'center' }}
          >
            <Text
              my={4}
              fontSize={'3xl'}
              textAlign={'center'}
              fontWeight={'semibold'}
            >
              Hasil
            </Text>
          </Flex>
          <Stack
            align={'center'}
            direction={'row'}
            flex={{ base: 1 }}
            justify={'flex-end'}
          >
            <Tooltip label={'Success'}>
              <Stack direction={'row'} spacing={1} align={'center'}>
                <Icon
                  w={6}
                  h={6}
                  color={successColor}
                  as={IoIosCheckmarkCircleOutline}
                ></Icon>
                <Text fontSize={'lg'}>{counter.success}</Text>
              </Stack>
            </Tooltip>
            <Tooltip label={'Failed'}>
              <Stack direction={'row'} spacing={1} align={'center'}>
                <Icon
                  w={6}
                  h={6}
                  color={errorColor}
                  as={MdOutlineErrorOutline}
                ></Icon>
                <Text fontSize={'lg'}>{counter.error}</Text>
              </Stack>
            </Tooltip>
            <Tooltip label={'Rejected'}>
              <Stack direction={'row'} spacing={1} align={'center'}>
                <Icon w={6} h={6} color={'darkgray'} as={VscError}></Icon>
                <Text fontSize={'lg'}>{counter.reject}</Text>
              </Stack>
            </Tooltip>
          </Stack>
        </Flex>
        {images.length > 0 ? (
          <SimpleGrid spacing={10} columns={[1, 2]}>
            {images.map(
              (
                { src, fileName, fileFullName, fileExtension }: ImageProps,
                index: number
              ) => (
                <Stack
                  key={index}
                  rounded={4}
                  spacing={0}
                  shadow={'md'}
                  overflow={'hidden'}
                  direction={'column'}
                >
                  <Image
                    src={src}
                    alt={fileName}
                    width={'100%'}
                    height={'180px'}
                    objectFit={'contain'}
                    backgroundSize={'cover'}
                    objectPosition={'center'}
                    backgroundPosition={'center'}
                    backgroundImage={`url("/${transparentImage}")`}
                  />
                  <Tooltip label={fileFullName} hasArrow>
                    <Button
                      as={'a'}
                      href={src}
                      rounded={'none'}
                      colorScheme={'green'}
                      download={`${fileName}-rmbg.${fileExtension}`}
                      _focus={{
                        border: 'none',
                      }}
                    >
                      Download
                    </Button>
                  </Tooltip>
                </Stack>
              )
            )}
          </SimpleGrid>
        ) : (
          <Stack justify={'center'} align={'center'} spacing={5}>
            <Image src={'/empty.svg'} alt={'Empty'} boxSize={'240px'} />
            <Text textAlign={'center'} fontSize={'xl'} fontWeight={'medium'}>
              Hasil akan tampil disini, silahkan upload file yang ingin
              diproses.
            </Text>
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default Dropzone;
