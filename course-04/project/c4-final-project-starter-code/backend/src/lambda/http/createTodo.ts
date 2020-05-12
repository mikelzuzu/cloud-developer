import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todos'

const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  // TODO: Implement creating a new TODO item
  const newItem = await createTodo(newTodo, userId)
  //delete userId in the return for security
  delete newItem.userId

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
