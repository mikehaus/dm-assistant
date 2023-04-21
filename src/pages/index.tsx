import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import PropTypes, { InferProps } from "prop-types";

import { api } from "~/utils/api";
import { handleOpenAiCompletion } from "./api/openAi";

const DEFAULT_COMPLETIONS_MODEL = "text-davinci-003";
const DEFAULT_COMPLETIONS_PROMPT =
  "Provide and idea for a Dungeons and Dragons quest";

type CompletionCardProps = {
  result: string;
};

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

const CompletionCard = ({ result }: CompletionCardProps) => {
  return <div className="card">{result}</div>;
};

const Home: NextPage = () => {
  const user = useUser();

  const [answer, setAnswer] = useState("");
  const [questInputValue, setQuestInputValue] = useState("");

  // TODO: Find way to handle data to prevent error on div
  const generateAdventure = async () => {
    // TODO: Handle the response better to prevent runtime error
    const adventureData = await handleOpenAiCompletion(
      DEFAULT_COMPLETIONS_PROMPT,
      DEFAULT_COMPLETIONS_MODEL,
    );

    const { choices } = adventureData;

    setAnswer(
      choices[0]?.text ||
        "Sorry! There was an error generating a quest idea. Please try again.",
    );
  };

  if (!user.isLoaded) {
    return (
      <div className="flex justify-center">
        <PyramidLoader />
      </div>
    );
  }

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
                <input
                  type="text"
                  className="flex justify-center w-1/2 h-14 text-sky-200 bg-sky-900 p-3 my-4 rounded-full"
                  placeholder="test"
                  value={questInputValue}
                  onChange={(e) => setQuestInputValue(e.target.value)}
                />
                {answer !== "" && (
                  <div className="answer-card my-4 h-fit w-1/2 rounded-xl p-4">
                    <h3 className="text-lg text-sky-300 font-bold">
                      Your generated adventure:
                    </h3>
                    <div className="text-sm text-sky-400 mt-2">{answer}</div>
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
