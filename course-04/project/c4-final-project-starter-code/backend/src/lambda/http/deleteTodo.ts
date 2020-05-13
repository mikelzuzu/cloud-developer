import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import HttpException from '../../utils/HttpException'

const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  
  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id

  const userId = getUserId(event)

  try {
    await deleteTodo(todoId, userId)
    //HTTP 200 or HTTP 204 should imply "resource deleted successfully"
    //204 (No Content)
    return {
      statusCode: 204,
      body: ''
    }
  } catch (error) {
    logger.error('Error deleting todo.', { errorMessage: error.message})
    if (error instanceof HttpException){
      // send back http 404 not found error
      const exception: HttpException = error
      return {
        statusCode: exception.status,
        body: JSON.stringify({
          error: exception.message
        })
      }
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Internal server error"
        })
      }
    }
  }

})

handler.use(
  cors({
    credentials: true
  })
)
