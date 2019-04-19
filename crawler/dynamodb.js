const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION || 'eu-west-1' })

var dynamodb = require('serverless-dynamodb-client')
const rawClient = dynamodb.raw
const docClient = dynamodb.doc

/* This implementation takes advantage of the fact that items already in the table
   do not cause errors or cause the stream event to be fired.
*/

module.exports.flushToDynamoDB = async (params) => {
  const batchParams = {
    RequestItems: {
      'crawler': params
    }
  }

  console.log('flushToDynamoDB: ', batchParams)

  return new Promise((resolve, reject) => {
    rawClient.batchWriteItem(batchParams, function (err, data) {
      if (err) {
        console.error('flushToDynamoDB', err)
        reject(err)
      } else {
        console.log('flushToDynamoDB: ', data)
        resolve(data)
      }
    })
  })
}

module.exports.writeUrlToDynamoDB = async (url) => {
  const params = {
    TableName: 'crawler',
    Item: {
      url: url
    }
  }

  console.log('writeUrlToDynamoDB: ', params)

  return new Promise((resolve, reject) => {
    docClient.put(params, function (err, data) {
      if (err) {
        console.error('writeUrlToDynamoDB', err)
        reject(err)
      } else {
        console.log('writeUrlToDynamoDB: ', data)
        resolve(data)
      }
    })
  })
}
