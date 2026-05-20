// src/config/fastapi.js
const axios                        = require('axios');
const { GetObjectCommand }         = require('@aws-sdk/client-s3');
const { getSignedUrl }             = require('@aws-sdk/s3-request-presigner');
const s3Client                     = require('./s3');

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

const fastapiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type':   'application/json',
    'X-Internal-Key': INTERNAL_API_KEY,
  },
});

/**
 * Generate a temporary pre-signed URL for a private S3 file.
 * Expires in 15 minutes — enough time for FastAPI to download and process.
 */
const generatePresignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key:    fileKey,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
};

/**
 * Notify FastAPI to start processing a file.
 * Generates a pre-signed URL so FastAPI can access the private S3 file.
 * pipeline: 'report' | 'prescription'
 */
const notifyFastAPI = async (pipeline, payload) => {
  const route = pipeline === 'prescription' ? '/extract-prescription' : '/ingest';

  console.log('[fastapi] file_key received:', payload.file_key); // ← add this
  
  const presignedUrl = await generatePresignedUrl(payload.file_key);
  
  console.log('[fastapi] presigned URL generated:', presignedUrl); // ← add this

  const response = await fastapiClient.post(route, {
    ...payload,
    file_url: presignedUrl,
  });

  return response.data;
};

module.exports = { notifyFastAPI, generatePresignedUrl };