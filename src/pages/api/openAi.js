// import { Configuration, OpenAIApi } from "openai";

// type CompletionSuccessResponse = {
//   object: string,
//   created: number,
//   choices: Array<CompletionChoices>,
//   usage: CompletionUsage,
// }
//
// type CompletionChoices = {
//   text: string,
//   index: number,
// }
//
// type CompletionUsage = {
//   promptTokens: number,
//   completionTokens: number,
//   totalTokens: number,
// }
//
// type CompletionErrorResponse = {
//   status: number,
//   data: string,
//   message: string,
// }
//
// type CompletionResponse = CompletionSuccessResponse | CompletionErrorResponse;

// const configuration = new Configuration({
//   apiKey: process.env.OPEN_AI_SECRET_KEY,
// });

// const openai = new OpenAIApi(configuration);

const COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/completions';

// TODO: Handle error sad path, handle typings
export async function getOpenAiCompletion(
  prompt,
  model = "text-davinci-003",
) {
  // const getCompletion = await openai.createCompletion({
  //   model,
  //   prompt,
  //   max_tokens: 100,
  // }).then((response) => response.data);
  //
  // return getCompletion;
  const response = await fetch(COMPLETIONS_ENDPOINT, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer: ${process.env.OPEN_AI_SECRET_KEY}`
    },
    body: JSON.stringify({
      prompt: prompt,
      model: model,
      max_tokens: 100,
      n: 1,
      stop: "\n"
    }),
  });

  const data = await response.json();
  
  return data;
}
