// import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import http from "https";
import { v3 as uuidv4 } from "uuid";

// TODO: REWORK FILE TO TS ONCE I HAVE MAIN REQUESTS WORKING

const COMPLETIONS_ENDPOINT = "https://api.openai.com/v1/completions";
const DEFAULT_COMPLETION_PROMPT =
  "Provide an idea for a dungeons and dragons quest";
const DEFAULT_COMPLETION_MODEL = "text-davinci-003";
const DEFAULT_IMAGE_PROMPT =
  "Provide an image of a silver shield with embellishments and runes along the edges";

const configuration = new Configuration({
  organization: process.env.OPEN_AI_ORG_ID,
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});
const openAi = new OpenAIApi(configuration);

// TODO: Handle error sad path, handle typings
// TODO: Rework with node pkg
export async function getOpenAiCompletion(
  prompt = DEFAULT_COMPLETION_PROMPT,
  model = DEFAULT_COMPLETION_MODEL
) {
  const response = axios
    .post(
      COMPLETIONS_ENDPOINT,
      {
        prompt: prompt,
        model: model,
        max_tokens: 100,
        n: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPEN_AI_SECRET_KEY}`,
        },
      }
    )
    .then((response) => response.data)
    .catch((error) => error);

  return response;
}

// TODO: Implement sad path for generate image
// TODO: Extend to handle upload for multiple files
// TODO: Work on uuid hashing mechanism for security: create uuid hash function, append to file name, decrypt uuid from hash to retrieve and store files in db;
export async function getGeneratedImages(prompt = DEFAULT_IMAGE_PROMPT) {
  const response = await openAi
    .createImage(
      {
        prompt: prompt,
        n: 1,
        size: "512x512",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPEN_AI_SECRET_KEY}`,
        },
      }
    )
    .then((data) => streamImageToS3(data))
    .catch((err) => console.error(err));
}

// TODO: add file to database on upload
const streamImageToS3 = (imageResponseData) => {
  // imageResponseData: {created: number, data: { { url: string }[] };

  const fileUid = uuidv4();
  const imageUrl = imageResponseData.data[0].url;
  const fileName = `img-${fileUid}.png`;

  const imageFile = fs.createWriteStream(fileName);
  const request = http.get(imageUrl, (response) => {
    response.pipe(imageFile);
    imageFile.on("finish", () => {
      imageFile.close();
      alert("Image file downloaded!");
    });
  });
};
