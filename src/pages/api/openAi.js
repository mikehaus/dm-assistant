// import { Configuration, OpenAIApi } from "openai";
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
// import fs from "fs";
// import http from "https";
import { v4 as uuidv4 } from 'uuid';
// import { uploadFileToS3 } from "./s3";
// import { instanceOf } from "prop-types";
import { putS3Object } from './s3Client';

// TODO: REWORK FILE TO TS ONCE I HAVE MAIN REQUESTS WORKING

const COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/completions';
const DEFAULT_COMPLETION_PROMPT =
  'Provide an idea for a dungeons and dragons quest';
const DEFAULT_COMPLETION_MODEL = 'text-davinci-003';
const DEFAULT_IMAGE_PROMPT =
  'Provide an image of a silver shield with embellishments and runes along the edges';

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
          'Content-Type': 'application/json',
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
// TODO: look at using a pre-trained model
export async function handleGenerateImages(prompt = DEFAULT_IMAGE_PROMPT) {
  const response = await openAi
    .createImage(
      {
        prompt: prompt,
        n: 1,
        size: '512x512',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPEN_AI_SECRET_KEY}`,
        },
      }
    )
    .then((res) => {
      return res.data.data[0];
      // return getBufferFromUrl(data)
    })
    .catch((err) => console.error(err));
  // .then((data) => downloadImage(data))
  // .catch((err) => console.error(err));

  return response;
}

// MARK: 2nd version of image gen due to Next.js not handling fs module well
export async function getBufferFromUrl(imageResponseData) {
  const fileUid = uuidv4();
  // This imageUrl is valid to use
  const imageUrl = imageResponseData.data.data[0].url;
  const fileName = `img-${fileUid}.png`;

  // get openAi url and store in ArrayBuffer (generic raw binary data buffer)
  const axiosResponse = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  const data = axiosResponse?.data;
  // TODO: Handle validation that data is actually an instanceof buffer
  if (!data) {
    console.error(
      'Error processing OpenAi Image url. Response should be of type buffer'
    );
  }

  await putS3Object(data, `dnd/${fileUid}`);
  // TODO: Send buffer to s3 client
  return data;
}

// TODO: add file to database on upload
// const downloadImage = (imageResponseData) => {
//   // imageResponseData: {created: number, data: { { url: string }[] };
//
//   const fileUid = uuidv4();
//   const imageUrl = imageResponseData.data[0].url;
//   const fileName = `img-${fileUid}.png`;
//
//   const imageFile = fs.createWriteStream(fileName);
//   const request = http.get(imageUrl, (response) => {
//     response.pipe(imageFile);
//     imageFile.on("finish", () => {
//       uploadFileToS3(imageFile);
//       imageFile.close();
//       alert("Image file downloaded!");
//     });
//   });
// };
