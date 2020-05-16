import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../../utils/logger'

const esHost = process.env.ES_ENDPOINT
const logger = createLogger('getTodos')

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info('Processing events batch from DynamoDB', { event: JSON.stringify(event) })

    for (const record of event.Records) {

        if (record.eventName !== 'INSERT') {
            continue
        }
        logger.info('Processing record', { item: JSON.stringify(record) })
        const newItem = record.dynamodb.NewImage

        const todoId = newItem.todoId.S

        const body = {
            todoId: newItem.todoId.S,
            userId: newItem.userId.S,
            name: newItem.name.S,
            dueDate: newItem.dueDate.S,
            createdAt: newItem.createdAt.S
        }

        try {
            await es.index({
                index: 'todos-index',
                type: 'todos',
                id: todoId,
                body
            })
        } catch (error) {
            logger.error('Error sending data to elasticsearch.', { errorMessage: error.message })
        }

    }
}