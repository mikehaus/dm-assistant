import {
  SignIn,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data } = api.completions.getAll.useQuery();

  if (!data) return <div>Loading...</div>;

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
              // <div className="flex justify-center bg-teal-700 text-slate-100 p-4 rounded-xl">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                <Link
                  className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                  href="http://google.com"
                  target="_blank"
                >
                  <h3 className="text-2xl font-bold">Adventure Generator</h3>
                  <div className="text-lg">Generate an adventure or quest.</div>
                </Link>
              </div>
            )}
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
          </div>
          <div>
            {data?.map((completion) => (
              <div key={completion.id}>{completion.prompt}</div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
