import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { fullTextSearch } from '../../businessLogic/todos';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('searchTodos.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info('Search To-Dos by term')

  const items = await fullTextSearch(event)

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