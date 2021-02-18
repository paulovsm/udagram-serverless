import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../utils/logger'

const logger = createLogger('elasticSearchSync.handler')

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export default class TodosES {
    constructor(
        
    ) {}

    async search(query: String) {
        logger.info('Searching ElasticSearch ', {query: query} )

        const response = await es.search({
            index: 'todos-index',
            type: 'todo',
            q: query.toString()
        })

        const hits = response.hits.hits.map(i => i._source)

        logger.info('ElasticSearch results', {hits: hits} )

        return hits
    }

}