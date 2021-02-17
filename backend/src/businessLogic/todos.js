import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import TodosAccess from '../dataLayer/todosAccess';
import TodosStorage from '../dataLayer/todosStorage';
import { getUserId } from '../lambda/utils';
import { CreateTodoRequest } from '../requests/CreateTodoTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'

const todosAccess = new TodosAccess();
const todosStorage = new TodosStorage();
const logger = createLogger('todosAccess')

export async function createTodo(event: APIGatewayProxyEvent, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();
    const bucketName = await todosStorage.getBucketName();

    const todoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest
    };
    
    logger.info('Create To-do', {userId: userId, todoId: todoId, bucketname: bucketName} )
    
    await todosAccess.addTodoToDB(todoItem);

    return todoItem;
}

export async function deleteTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    const todoExist = await todosAccess.getTodoFromDB(todoId, userId)

    if (!todoExist) {
        logger.warn('To-do not found', {userId: userId, todoId: todoId} )
        return false;
    }

    logger.info('Delete To-do', {userId: userId, todoId: todoId} )

    await todosAccess.deleteTodoFromDB(todoId, userId);

    return true;
}

export async function getTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    logger.info('Get to-do by ID', {userId: userId, todoId: todoId} )

    return await todosAccess.getTodoFromDB(todoId, userId);
}

export async function getTodos(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);

    logger.info('Get all To-dos', {userId: userId} )

    return await todosAccess.getAllTodosFromDB(userId);
}

export async function updateTodo(event: APIGatewayProxyEvent,
                                 updateTodoRequest: UpdateTodoRequest) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    const todoExist = await todosAccess.getTodoFromDB(todoId, userId)

    if (!todoExist) {
        logger.warn('To-do not found', {userId: userId, todoId: todoId} )
        return false;
    }

    logger.info('Update to-do', {userId: userId, todoId: todoId} )

    await todosAccess.updateTodoInDB(todoId, userId, updateTodoRequest);

    return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<string> {
    const bucketName = await todosStorage.getBucketName();
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    const todoId = event.pathParameters.todoId;

    const createSignedUrlRequest = {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    }

    logger.info('Generate upload url', {bucketName: bucketName, todoId: todoId} )

    return await todosStorage.getSignedUploadURL(createSignedUrlRequest);
}