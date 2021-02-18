import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../../utils/logger'

const logger = createLogger('elasticSearchSync.handler')

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  logger.info('Processing events batch from DynamoDB', {event: event})

  for (const record of event.Records) {
    logger.info('Processing record', {record: record})

    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb.NewImage

    const todoId = newItem.todoId.S

    const body = {
        userId: newItem.userId.S,
        todoId: newItem.todoId.S,
        name: newItem.name.S,
        dueDate: newItem.dueDate.S,
        done: newItem.done.BOOL,
        createdAt: newItem.createdAt.S
    }

    await es.index({
        index: 'todos-index',
        type: 'todo',
        id: todoId,
        body
    })

  }
}
