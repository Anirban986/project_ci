// src/config/s3.js
// S3 client used by both multer-s3 (upload) and deleteFromS3 (deletion)

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region:      process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Delete a file from S3 by its object key
 */
const deleteFromS3 = async (fileKey) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key:    fileKey,
  });
  return s3Client.send(command);
};

module.exports = s3Client;
module.exports.deleteFromS3 = deleteFromS3;