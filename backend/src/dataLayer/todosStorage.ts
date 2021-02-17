import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';
import * as AWS from 'aws-sdk';
import { createLogger } from '../utils/logger'

import * as AWSXRay from 'aws-xray-sdk';
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todosAccess')

export default class TodosStorage {
    constructor(
        private readonly todosStorage = process.env.IMAGES_S3_BUCKET,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4'})
    ) {}

   async getBucketName() {
        logger.info('Get bucket name')
        return this.todosStorage;
    }

   async getSignedUploadURL(createSignedUrlRequest: CreateSignedURLRequest) {
        logger.info('Get s3 signed url', {createSignedUrlRequest: createSignedUrlRequest} )
        return this.s3.getSignedUrl('putObject', createSignedUrlRequest);
    }
}