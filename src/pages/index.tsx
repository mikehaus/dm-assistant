import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";

import { getOpenAiCompletion } from "./api/openAi";

const DEFAULT_COMPLETIONS_MODEL = "text-davinci-003";
const DEFAULT_COMPLETIONS_PROMPT =
  "Provide and idea for a Dungeons and Dragons quest";

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
  finish_reason: string,
  index: number,
  logprobs: number | null,
  text: string
}

type CompletionResponse = {
  choices: CompletionChoice[],
  created: number,
  id: string,
  model: string,
  object: string
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number,
  }
}

const Home: NextPage = () => {
  const user = useUser();

  const [answer, setAnswer] = useState("");

  // TODO: Add debounced input value to prevent requery
  const { isLoading, data , error } = useQuery<CompletionResponse, AxiosError>(
    ["completion"],
    () => getOpenAiCompletion(
      DEFAULT_COMPLETIONS_PROMPT,
      DEFAULT_COMPLETIONS_MODEL,
    ),
  );

  // TODO: Find way to handle data to prevent error on div
  // TODO: This is really janky. Find way to redo type
  const generateAdventure = () => {
    const choices = data?.choices;

    const choice = choices ? choices[0] : { text: "" }; 
    setAnswer(choice?.text || "");
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
                </div>
                {!!isLoading && <LoadingSplash />}
                {!!error && <ErrorSplash />}
                {!!answer?.length && !isLoading && (
                  <div className="my-4 h-fit w-1/2 rounded-xl p-4 bg-gray-700">
                    <h3 className="text-lg text-slate-100 font-bold">
                      Your generated adventure:
                    </h3>
                    <div className="text-sm text-slate-300 mt-2">{answer}</div>
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
