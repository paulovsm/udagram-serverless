import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo.handler')

export const handler= middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  // TODO: Remove a TODO item by id
  const success = await deleteTodo(event)

  if (!success) {
    logger.warn('cannot delete to-do', {todoId: todoId} )
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'To-do does not exist'
      })
    };
  }

  logger.info('delete to-do', {todoId: todoId} )

  return {
    statusCode: 202,
    body: JSON.stringify({})
  };

})

handler.use(
  cors({
    credentials: true
  })
)
