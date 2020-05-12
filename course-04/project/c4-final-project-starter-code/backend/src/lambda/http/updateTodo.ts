import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  try {
    await updateTodo(todoId, userId, updatedTodo)
    //HTTP 200 or HTTP 204 should imply "resource updated successfully"
    //204 (No Content)
    return {
      statusCode: 204,
      body: ''
    }
  } catch (error) {
    // send back http 404 not found error
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: error.message
      })
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
