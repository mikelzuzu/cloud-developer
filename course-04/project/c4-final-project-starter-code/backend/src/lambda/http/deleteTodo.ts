import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

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
