import { Configuration, OpenAIApi } from "openai";

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

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});

const openai = new OpenAIApi(configuration);

// TODO: Handle error sad path, handle typings
export async function handleOpenAiCompletion(
  prompt: string,
  model = "text-davinci-003"
) {
  const { data } = await openai.createCompletion({ model, prompt });

  return data;
}
