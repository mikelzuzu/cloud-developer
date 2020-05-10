import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger';

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
    logger.info('Getting all todos from user: %s', userId)

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
    logger.info('Getting the todo %s from user: %s', todoId,  userId)

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
        ":todo_val": todoId,
        ":userId_val": userId
      },
      ScanIndexForward: false,
      Limit: 1
    }).promise()

    const item = result.Items[0]
    return item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo from user: %s', todo.userId)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()
    return todo    
  }

  async updateTodo(todo: TodoItem): Promise<void> {
    try {
        await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            itemId: todo.todoId,
            userId: todo.userId
        },
        UpdateExpression: 'SET name = :name_val, dueDate = :date_val, done = :done_val',
        ExpressionAttributeValues:{
            ":name_val": todo.name,
            ":date_val": todo.dueDate,
            ":done_val": todo.done
        },
        ReturnValues: "UPDATED_NEW"
        }).promise()
          
    } catch(error) {
        logger.error('Todo not updated', error.message);
        throw error
    }
    logger.info('Todo updated!')
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    try {
        await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            todoId
        },
        ConditionExpression:"userId = :user_val",
        ExpressionAttributeValues: {
            ":user_val": userId
        }
        }).promise()
    } catch(error) {
        logger.error('Todo not deleted', error.message);
        throw error
    }
    logger.info('Todo deleted!')
    
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}