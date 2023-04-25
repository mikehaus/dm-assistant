import s3 from 's3';
/*
 * This is the first module attempt at using s3, but broke when attempting to upload a file.
 * FS module is janky in next as described in s3Client file, so leaving this here until I know the better
 * way to handle this of the two approaches. I like this better because the code seems a little cleaner but
 * my biggest concern is to get the upload working first
 */

// NOTE: IT LOOKS LIKE THIS PACKAGE USES FS WHICH MIGHT MAKE ME USE GETSERVERSIDEPROPS REGARDLESS
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

// TODO: May need to make this async
export const uploadFileToS3 = (file, fileUid) => {
  const S3_PARAMS = {
    localFile: file,
    s3Params: {
      Bucket: process.env.S3_BUCKET_NAME,
      KEY: `dnd/${fileUid}`,
      // TODO: MAY NEED OTHER OPTIONS STATED HERE: See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };

  const uploader = client.uploadFile(S3_PARAMS);

  uploader.on('error', (err) => console.error('unable to upload: ', err.stack));
  uploader.on('progress', () =>
    console.log(
      'progress: ',
      uploader.progressMd5Amount,
      uploader.progressAmount,
      uploader.progressTotal
    )
  );
  // TODO: Hook into flow and put file in database
  uploader.on('end', () => console.log('Finished Uploading file!'));
};

export const downloadFileFromS3 = (file) => {
  const S3_PARAMS = {
    localFile: file,
    s3Params: {
      Bucket: process.env.S3_BUCKET_NAME,
      // KEY: 'some/remote/file',
      // TODO: MAY NEED OTHER OPTIONS STATED HERE: See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };

  const downloader = client.downloadFile(S3_PARAMS);

  downloader.on('error', (err) =>
    console.error('unable to download file: ', err.stack)
  );
  downloader.on('progress', () =>
    console.log(
      'progress: ',
      downloader.progressAmount,
      downloader.progressTotal
    )
  );
  downloader.on('end', () => console.log('Finished downloader file!'));
};
