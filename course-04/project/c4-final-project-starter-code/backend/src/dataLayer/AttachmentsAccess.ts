import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { S3 } from 'aws-sdk';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('AttachmentsAccess')

export class AttachmentAccess {

  constructor(
    private readonly s3: S3 = createS3Client(),
    private readonly bucketName = process.env.TODOS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  getAttachmentUploadUrl(todoId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}

function createS3Client() {
  if (process.env.IS_OFFLINE) {
    logger.log('Creating a local S3 instance')
    return new XAWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: 'S3RVER', // This specific key is required when working offline
      secretAccessKey: 'S3RVER',
      endpoint: 'http://localhost:8000',
    })
  }

  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}