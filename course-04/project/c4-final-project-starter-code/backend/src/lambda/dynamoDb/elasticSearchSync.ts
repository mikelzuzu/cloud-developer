import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../../utils/logger'

const esHost = process.env.ES_ENDPOINT
const logger = createLogger('getTodos')

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  logger.info('Processing events batch from DynamoDB', { event:JSON.stringify(event) })

  for (const record of event.Records) {
    logger.debug('Processing record', { item:JSON.stringify(record) })
    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb.NewImage

    const todoId = newItem.todoId.S

    const body = {
        todoId: newItem.imageId.S,
        userId: newItem.groupId.S,
        attachmentUrl: newItem.imageUrl.S,
        name: newItem.title.S,
        createdAt: newItem.timestamp.S,
        done: newItem.done.S
      }

    await es.index({
      index: 'todos-index',
      type: 'todos',
      id: todoId,
      body
    })

  }
}