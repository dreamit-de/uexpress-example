import { 
    GraphQLServer, 
    NoStacktraceJsonLogger 
} from '@dreamit/graphql-server'
import { 
    userSchema, 
    userSchemaResolvers 
} from './ExampleSchemas'
import express from 'ultimate-express'
import { 
    GraphQLServerRequest, 
    GraphQLServerResponse 
} from '@dreamit/graphql-server-base'
import { Server } from 'node:http'
import bodyParser from 'body-parser'

export function startWebServer(): Server {
    const graphqlServer = new GraphQLServer(
        {
            schema: userSchema,
            rootValue: userSchemaResolvers,
            logger: new NoStacktraceJsonLogger('expressjs-server', 'user-service'),
            contextFunction: (): unknown => {
                return {}
            }
        }
    )
    
    const graphQLServerPort = 7070
    const graphQLServerExpress = express()
    graphQLServerExpress.use(bodyParser.text({type: '*/*'}))
    graphQLServerExpress.all('/graphql', 
        (request: GraphQLServerRequest, response: GraphQLServerResponse) => {
            return graphqlServer.handleRequest(request, response)
        })
    const server = graphQLServerExpress.listen(graphQLServerPort)
    console.info(`Starting GraphQL server on port ${graphQLServerPort}`)
    return server
}
