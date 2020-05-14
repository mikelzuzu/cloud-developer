import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { getTodosFromUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('getTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  logger.debug(`Retrieving all Todos for user ${userId}.`)
  try {
    const items = await getTodosFromUser(userId)
    //delete userId in the todos list for security
    items.forEach(todo => delete todo.userId)
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        items
      })
    }
  } catch(error) {
    logger.error('Error getting Todos.', { errorMessage: error.message })
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error"
      })
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
