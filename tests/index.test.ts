import { startWebServer } from '~/src'
import { Server } from 'node:http'
import { 
    logoutMutation, 
    returnErrorQuery, 
    userOne, 
    userQuery, 
    usersQuery, 
    userTwo, 
    userVariables 
} from '@/ExampleSchemas'
import test, { after, before } from 'node:test'
import assert from 'node:assert'
import { ExecutionResult } from 'graphql'

let server: Server

before(() => {
    server = startWebServer() 
})

after(() => {
    server.close()
})

test('Should get correct responses for requests', async() => {
     
    // Get all users
    let response = await fetch('http://localhost:7070/graphql', {
        method: 'POST',
        body: JSON.stringify({query: usersQuery}),
        headers: {'Content-Type': 'application/json'}
    })
    let responseAsJson : ExecutionResult  = await response.json() as ExecutionResult
    assert.deepStrictEqual(responseAsJson.data?.users, [userOne, userTwo])

    // Get user one
    response = await fetch('http://localhost:7070/graphql', {
        method: 'POST',
        body: JSON.stringify({query: userQuery, variables: JSON.parse(userVariables)}),
        headers: {'Content-Type': 'application/json'}
    })
    responseAsJson = await response.json() as ExecutionResult
    assert.deepStrictEqual(responseAsJson.data?.user, userOne)

    // Get user two
    response = await fetch('http://localhost:7070/graphql', {
        method: 'POST',
        body: JSON.stringify({query: userQuery, variables: {'id201':'2'}}),
        headers: {'Content-Type': 'application/json'}
    })
    responseAsJson = await response.json() as ExecutionResult
    assert.deepStrictEqual(responseAsJson.data?.user, userTwo)

    // Get unknown user
    response = await fetch('http://localhost:7070/graphql', {
        method: 'POST',
        body: JSON.stringify({query: userQuery, variables: {'id201':'3'}}),
        headers: {'Content-Type': 'application/json'}
    })
    responseAsJson = await response.json() as ExecutionResult
    assert(responseAsJson.errors)
    assert.equal(responseAsJson.errors[0].message, 'User for userid=3 was not found')

    // Get returnError response
    response = await fetch('http://localhost:7070/graphql', {
        method: 'POST',
        body: JSON.stringify({query: returnErrorQuery}),
        headers: {'Content-Type': 'application/json'}
    })
    responseAsJson = await response.json() as ExecutionResult
    assert(responseAsJson.errors)
    assert.equal(responseAsJson.errors[0].message, 'Something went wrong!')

    // Get logout mutation response
    response = await fetch('http://localhost:7070/graphql', {
        method: 'POST',
        body: JSON.stringify({query: logoutMutation}),
        headers: {'Content-Type': 'application/json'}
    })
    responseAsJson = await response.json() as ExecutionResult
    assert.deepStrictEqual(responseAsJson.data?.logout, {result: 'Goodbye!'})
})
