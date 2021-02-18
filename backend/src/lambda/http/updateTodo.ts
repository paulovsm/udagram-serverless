import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const updatedItem = await updateTodo(event, updatedTodo);

  if (!updatedItem) {
    logger.warn('Cannot update to-do', {todoId: todoId})
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Job does not exist'
      })
    };
  }

  logger.info('Update to-do', {todoId: todoId})

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: updatedItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
