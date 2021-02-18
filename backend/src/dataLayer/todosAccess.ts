import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todosAccess')

export default class TodosAccess {
  constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODO_TABLE,
      private readonly indexName = process.env.TODO_INDEX,
      private readonly todosStorage = process.env.IMAGES_S3_BUCKET
  ) {}

  async addTodoToDB(todoItem) {
    logger.info('Inserting new to-do into db ', {todoItem: todoItem} )

    await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
    }).promise();
  }

  async deleteTodoFromDB(todoId, userId) {
    logger.info('Removing to-do from db', { todoId: todoId, userId: userId})

    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            todoId,
            userId
        }
    }).promise();
  }

  async getTodoFromDB(todoId, userId) {
    logger.info('Retrieving to-do from db', { todoId: todoId, userId: userId})

    const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: {
            todoId,
            userId
        }
    }).promise();

    return result.Item;
  }

  async getAllTodosFromDB(userId) {
    logger.info('Retrieving all to-dos from db by userID', {userId: userId})

    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    return result.Items;
  }

  async updateTodoInDB(todoId, userId, updatedTodo) {
    logger.info('Updating to-do into db', { todoId: todoId, userId: userId})
    
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            todoId,
            userId
        },
        UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeValues: {
            ':name': updatedTodo.name,
            ':dueDate': updatedTodo.dueDate,
            ':done': updatedTodo.done
        },
        ExpressionAttributeNames: {
            '#name': 'name',
            '#dueDate': 'dueDate',
            '#done': 'done'
        }
    }).promise();
  }

  async updateTodoAttachmentUrl(todoId, attachmentUrl){
    logger.info('Updating to-do url into db', { todoId: todoId, attachmentUrl: attachmentUrl})

    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            "todoId": todoId
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": `https://${this.todosStorage}.s3.amazonaws.com/${attachmentUrl}`
        }
    }).promise();
  }
}