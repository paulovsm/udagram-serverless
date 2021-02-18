import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodos } from '../../businessLogic/todos';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info('Get all to-dos')

  const items = await getTodos(event)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: items
    })
  };

})

handler.use(
  cors({
    credentials: true
  })
)
