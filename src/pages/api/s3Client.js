import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
/*
 * Module to handle sending and recieving images with clientS3 yarn package.
 * This is a second WIP way of handling without using a put on a downloaded file since
 * next can't use fs without submitting to a bunch of janky getServerSideProps stuff
 */

const REGION = "us-west-1" 
export const s3Client = new S3Client({ region: REGION });
const bucketParams = {
  Bucket: process.env.S3_BUCKET_NAME,
};

export async function putS3Object(body, key) {
  try {
    const data = await s3Client.send(
      new PutObjectCommand({
        ...bucketParams,
        Body: body,
        Key: key,
      })
    );
    console.log(
      "Successfully uploaded object: " + bucketParams.Bucket + "/" + `public/myFolder/${key}`
    );
    return data;
  } catch (error) {
    console.error(error);
  }
}
