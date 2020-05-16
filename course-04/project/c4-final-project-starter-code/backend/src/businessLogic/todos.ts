import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/TodosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const todoAccess = new TodoAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos()
}

export async function getTodosFromUser(userId: string, limit, nextKey): Promise<DocumentClient.QueryOutput> {
  return todoAccess.getTodosFromUser(userId, limit, nextKey)
}

export async function getTodoFromUser(todoId: string, userId: string): Promise<TodoItem> {
  return todoAccess.getTodoFromUser(todoId, userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  //const bucketName = process.env.TODOS_S3_BUCKET

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString(),
    //removed attachment as it is not in S3 bucket yet. It is updated once the upload url is retrieved
    //attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  })
}

export async function updateTodo(
    todoId: string,
    userId: string,
    updateTodoRequest: UpdateTodoRequest,
  ): Promise<void> {
    //need to find creation date of todo item
    const todo = await todoAccess.getTodoFromUser(todoId, userId)

    return await todoAccess.updateTodo({
      todoId: todoId,
      userId: userId,
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done,
      createdAt: todo.createdAt
    })
  }

  export async function updateAttachment(
    todoId: string,
    userId: string,
    attachmentUrl: string,
  ): Promise<void> {
    //need to find creation date of todo item
    const todo = await todoAccess.getTodoFromUser(todoId, userId)

    return await todoAccess.updateAttachment(todoId, userId, todo.createdAt, attachmentUrl)
  }

  export async function deleteTodo(
    todoId: string,
    userId: string
  ): Promise<void> {
    const todo = await todoAccess.getTodoFromUser(todoId, userId)
    return await todoAccess.deleteTodo(todoId, userId, todo.createdAt)
  }