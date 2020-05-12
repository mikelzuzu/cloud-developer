import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getAttachmentUploadUrl } from '../../businessLogic/attachments'
import { updateAttachment } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  //update todo if url
  const attachmentUrl = `https://${process.env.TODOS_S3_BUCKET}.s3.amazonaws.com/${todoId}`
  await updateAttachment(todoId, userId, attachmentUrl)
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const uploadURL = await getAttachmentUploadUrl(todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: uploadURL
    })
}
})

handler.use(
  cors({
    credentials: true
  })
)
