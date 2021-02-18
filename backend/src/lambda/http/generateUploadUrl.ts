import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { generateUploadUrl } from '../../businessLogic/todos';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl.handler')

export const handler =  middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const theSignedUrl = await generateUploadUrl(event);

  logger.info('Get image upload url', {todoId: todoId})

  return {
    statusCode: 202,
    body: JSON.stringify({
      uploadUrl: theSignedUrl
    })
  };
})

handler.use(
  cors({
    credentials: true
  })
)
