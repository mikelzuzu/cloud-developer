import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_INDEX) {
  }

  async getAllTodos(): Promise<TodoItem[]> {
    logger.info("Getting all todos")

    const result = await this.docClient.scan({
      TableName: this.todosTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodosFromUser(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos from user: ', userId)

    const result = await this.docClient.scan({
      TableName: this.todosTable,
      FilterExpression: "#userId = :userId_val",
      ExpressionAttributeNames: {
          "#userId": "userId",
      },
      ExpressionAttributeValues: { ":userId_val": userId }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodoFromUser(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('Getting the todo ' + todoId + ' from user: ' +  userId)

    //TODO: convert to get
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: "#todoId = :todoId_val and #userId = :userId_val",
      ExpressionAttributeNames: {
          "#userId": "userId",
          "#todoId": "todoId"
      },
      ExpressionAttributeValues: { 
        ":todoId_val": todoId,
        ":userId_val": userId
      },
      ScanIndexForward: false,
      Limit: 1
    }).promise()

    const item = result.Items[0]
    if (item === undefined) {
      logger.error('Todo not found')
      throw new Error('Todo not found')
    }
    return item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info("Creating todo from user: " + todo.userId)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()
    return todo    
  }

  async updateTodo(todo: TodoItem): Promise<void> {
    logger.info('Todo for updating')
    try {
        await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            userId: todo.userId,
            createdAt: todo.createdAt
        },
        ConditionExpression: "#todoId = :todoId_val",
        UpdateExpression: 'SET #name = :name_val, #dueDate = :date_val, #done = :done_val',
        ExpressionAttributeValues:{
            ":todoId_val": todo.todoId,
            ":name_val": todo.name,
            ":date_val": todo.dueDate,
            ":done_val": todo.done
        },
        ExpressionAttributeNames: {
          "#todoId": "todoId",
          "#name": "name",
          "#dueDate": "dueDate",
          "#done": "done"
        },
        ReturnValues: "UPDATED_NEW"
        }).promise()
          
    } catch(error) {
        logger.error('Todo not updated', error.message);
        logger.error(error.message);
        throw error
    }
    logger.info('Todo updated!')
  }

  async deleteTodo(todoId: string, userId: string, createdAt: string): Promise<void> {
    try {
        await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            userId,
            createdAt
        },
        ConditionExpression:"todoId = :todoId_val",
        ExpressionAttributeValues: {
            ":todoId_val": todoId
        }
        }).promise()
    } catch(error) {
        logger.error('Todo not deleted', error.message);
        logger.error(error.message)
        throw error
    }
    logger.info('Todo deleted!')
    
  }
}

function createDynamoDBClient() {
  logger.debug('Creating a DynamoDB instance')
  if (process.env.IS_OFFLINE) {
    logger.debug('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  logger.debug('Creating a DynamoDB instance in AWS')
  return new XAWS.DynamoDB.DocumentClient()
}