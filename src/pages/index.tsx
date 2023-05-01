import { SignIn, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';
import { AxiosError } from 'axios';

import { getOpenAiCompletion, handleGenerateImages } from './api/openAi';

const DEFAULT_COMPLETIONS_MODEL = 'text-davinci-003';
const DEFAULT_COMPLETIONS_PROMPT =
  'Provide and idea for a Dungeons and Dragons quest';

const PyramidLoader = () => {
  return (
    <div className="pyramid-loader">
      <div className="pyramid-loader-wrapper">
        <span className="pyramid-loader-side pyramid-loader-side1" />
        <span className="pyramid-loader-side pyramid-loader-side2" />
        <span className="pyramid-loader-side pyramid-loader-side3" />
        <span className="pyramid-loader-side pyramid-loader-side4" />
      </div>
    </div>
  );
};

type CompletionChoice = {
  finish_reason: string;
  index: number;
  logprobs: number | null;
  text: string;
};

type CompletionResponse = {
  choices: CompletionChoice[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

type CardDataUpdateType = 'TITLE' | 'DESCRIPTION' | 'PROMPT';

type CardFormData = {
  prompt: string;
  title: string;
  description: string;
};

type CardData = {
  imageUrl: string;
  title: string;
  description: string;
};

const Home: NextPage = () => {
  const user = useUser();

  const [answer, setAnswer] = useState('');
  const [cardFormVisible, setCardFormVisible] = useState(false);
  const [cardFormData, setCardFormData] = useState<CardFormData>({
    prompt: '',
    title: '',
    description: '',
  });
  const [cardData, setCardData] = useState<CardData>({
    imageUrl: '',
    title: '',
    description: '',
  });
  const [cardIsVisible, setCardIsVisible] = useState<boolean>(false);

  // TODO: Add debounced input value to prevent requery
  const { isLoading, data, error } = useQuery<CompletionResponse, AxiosError>(
    ['completion'],
    () =>
      getOpenAiCompletion(DEFAULT_COMPLETIONS_PROMPT, DEFAULT_COMPLETIONS_MODEL)
  );

  // TODO: Find way to handle data to prevent error on div
  // TODO: This is really janky. Find way to redo type
  const generateAdventure = () => {
    const choices = data?.choices;

    const choice = choices ? choices[0] : { text: '' };
    setAnswer(choice?.text || '');
  };

  const updateCardData = (
    e: ChangeEvent<HTMLInputElement>,
    inputOption: CardDataUpdateType
  ) => {
    if (inputOption === 'PROMPT') {
      setCardFormData({
        prompt: e.target.value,
        title: cardFormData.title,
        description: cardFormData.description,
      });
    }
    if (inputOption === 'TITLE')
      setCardFormData({
        prompt: cardFormData.prompt,
        title: e.target.value,
        description: cardFormData.description,
      });
    if (inputOption === 'DESCRIPTION')
      setCardFormData({
        prompt: cardFormData.prompt,
        description: e.target.value,
        title: cardFormData.title,
      });
  };

  // TODO: Load while image is creating
  // TODO: Put toast if image isn't loaded or error with function
  const generateCard = async () => {
    const generatedImage = await handleGenerateImages(cardFormData.prompt).then(
      (imageData: { url: string }) => {
        const { url } = imageData;
        setCardData({
          imageUrl: url,
          title: cardFormData.title,
          description: cardFormData.description,
        });
        if (url) {
          setCardIsVisible(true);
          setCardFormVisible(false);
        }
        return;
      }
    );
    setCardFormVisible(false);
  };

  // TODO: Find better way to handle async function.
  // can do useEffect but don't want it to retrigger and really don't want it to be stuck using empty deps array
  const generateImage = async () => {
    console.log('generating image');
    const generatedImageResponse = await handleGenerateImages(
      'A dungeons and dragons human fighter in a renaissance painting style'
    );
    console.log(generatedImageResponse);
    // return;
  };

  if (!user.isLoaded) {
    return (
      <div className="flex justify-center">
        <PyramidLoader />
      </div>
    );
  }

  const LoadingSplash = () => (
    <div className="text-lg text-blue-500">Loading...</div>
  );

  const ErrorSplash = () => (
    <div className="text-lg text-red-500">
      Sorry! There was an error generating a quest idea. Please try again.
    </div>
  );

  // TODO: refactor some of the things to use tailwind instead of raw css for practice
  return (
    <>
      <Head>
        <title>DM Assistant</title>
        <meta
          name="description"
          content="A toolbelt for the busy Game Master"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        {!!user.isSignedIn && (
          <div className="fixed right-4 top-3">
            <UserButton />
          </div>
        )}
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-cyan-200">DM ASSISTANT</span>
          </h1>
          <div>
            {!user.isSignedIn && (
              <div className="clerk-btn">
                <SignInButton />
              </div>
            )}
            {!!user.isSignedIn && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                  <div
                    className="flex max-w-xs cursor-pointer flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                    onClick={generateAdventure}
                  >
                    <h3 className="text-2xl font-bold">Adventure Generator</h3>
                    <div className="text-lg">
                      Generate an adventure or quest.
                    </div>
                  </div>
                  <div
                    className="flex max-w-xs cursor-pointer flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                    onClick={() => setCardFormVisible(true)}
                  >
                    <h3 className="text-2xl font-bold">
                      Trading Card Generator
                    </h3>
                    <div className="text-lg">
                      Generate a trading card for a DND item.
                    </div>
                  </div>
                </div>
                {!!isLoading && <LoadingSplash />}
                {!!error && <ErrorSplash />}
                {!!answer?.length && !isLoading && (
                  <div className="my-4 h-fit w-1/2 rounded-xl bg-gray-700 p-4">
                    <h3 className="text-lg font-bold text-slate-100">
                      Your generated adventure:
                    </h3>
                    <div className="mt-2 text-sm text-slate-300">{answer}</div>
                  </div>
                )}
                {cardFormVisible && (
                  <>
                    <div className="m-4 flex w-full items-center p-4">
                      <label>Prompt</label>
                      <input
                        className="mx-4 h-8 w-96 rounded-lg bg-sky-900 px-2 shadow-sm"
                        value={cardFormData.prompt}
                        placeholder="What do you want your image to look like?"
                        onChange={(e) => updateCardData(e, 'PROMPT')}
                      />
                    </div>
                    <div className="m-4 flex w-full items-center p-4">
                      <label>Title</label>
                      <input
                        className="mx-4 h-8 w-96 rounded-lg bg-sky-900 px-2 shadow-sm"
                        value={cardFormData.title}
                        placeholder="Set your card title here"
                        onChange={(e) => updateCardData(e, 'TITLE')}
                      />
                    </div>

                    <div>
                      <label>Description</label>
                      <input
                        className="mx-4 h-8 w-96 rounded-lg bg-sky-900 px-2 shadow-sm"
                        value={cardFormData.description}
                        placeholder="Set your description here"
                        onChange={(e) => updateCardData(e, 'DESCRIPTION')}
                      />
                    </div>
                    <button
                      className="my-4 h-10 w-20 rounded-xl bg-sky-700 hover:bg-sky-600"
                      onClick={generateCard}
                    >
                      Submit
                    </button>
                  </>
                )}
                {cardIsVisible && (
                  <div className="h-96 w-56 rounded-lg m-10 bg-gray-700 flex-col grow items-center ">
                    <Image src={`${cardData.imageUrl}`}
                      width={150} height={150} className="m-4 roundex-xl" alt="Dnd item"/>
                    <h2 className="mx-4">{cardData.title}</h2>
                    <p className="m-4">{cardData.description}</p>
                  </div>
                )}
              </>
            )}
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
