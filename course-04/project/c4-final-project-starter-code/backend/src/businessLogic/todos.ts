import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/TodosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos()
}

export async function getTodosFromUser(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosFromUser(userId)
}

export async function getTodoFromUser(todoId: string, userId: string): Promise<TodoItem> {
  return todoAccess.getTodoFromUser(todoId, userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString(),
  })
}

export async function updateTodo(
    itemId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string
  ): Promise<void> {
  
    return await todoAccess.updateTodo({
      todoId: itemId,
      userId: userId,
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done,
      createdAt: new Date().toISOString()
    })
  }

  export async function deleteTodo(
    todoId: string,
    userId: string
  ): Promise<void> {
  
    return await todoAccess.deleteTodo(todoId, userId)
  }