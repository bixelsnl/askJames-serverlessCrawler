'use strict'

const { processURL } = require('./processURL')
const { writeUrlToDynamoDB } = require('./dynamodb')

// Entry point for the Lambda function

exports.streamUpdated = async (event) => {
  console.log('Received event: ', JSON.stringify(event, null, 2))

  await Promise.all(event.Records.map(async (record) => {
    // Only run for inserts
    if (record.eventName !== 'INSERT') return

    console.log('DynamoDB Record: ', record.dynamodb)
    const URL = record.dynamodb.NewImage.url.S
    console.log('Processing: ', URL)
    await processURL(URL)
  }))

  console.log(`Processed ${event.Records.length} records.`)
  return { statusCode: 200 }
}

exports.startCrawl = async (event) => {
  const data = JSON.parse(event.body);

  console.log('Starting crawl for URL: ', data.url)

  writeUrlToDynamoDB(data.url)

  return { statusCode: 200 }
}
