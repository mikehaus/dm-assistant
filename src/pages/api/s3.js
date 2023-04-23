import s3 from "s3";

const client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

const S3_PARAMS = {
  localFile: file,
  s3Params: {
    Bucket: process.env.S3_BUCKET_NAME,
    // KEY: 'some/remote/file',
    // TODO: MAY NEED OTHER OPTIONS STATED HERE: See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  },
};

export const uploadImageToS3 = (file) => {
  const uploader = client.uploadFile(S3_PARAMS);

  uploader.on("error", (err) => console.err("unable to upload: ", err.stack));
  uploader.on("progress", () =>
    console.log(
      "progress: ",
      uploader.progressMd5Amount,
      uploader.progressAmount,
      uploader.progressTotal
    )
  );
  // TODO: Hook into flow and put file in database
  uploader.on("end", () => console.log("Finished Uploading file!"));
};

export const downloadFileFromS3 = () => {
  const downloader = client.downloadFile(S3_PARAMS);

  downloader.on("error", (err) =>
    console.error("unable to download file: ", err.stack)
  );
  downloader.on("progress", () =>
    console.log(
      "progress: ",
      downloader.progressAmount,
      downloader.progressTotal
    )
  );
  downloader.on("end", () => console.log("Finished downloader file!"));
};
