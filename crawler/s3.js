const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION || 'eu-west-1' })

const options = {
  s3ForcePathStyle: true,
  region: 'localhost',
  endpoint: 'http://localhost:8001',
  accessKeyId: 'S3RVER',
  secretAccessKey: 'S3RVER'
}

const isOffline = function () {
  // Depends on serverless-offline plugin which adds IS_OFFLINE to process.env when running offline
  return process.env.IS_OFFLINE
}

const s3 = isOffline() ? new AWS.S3(options) : new AWS.S3()


module.exports.saveToS3 = async (key, body, contentType) => {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: 'crawled-site.local',
      Key: key,
      Body: body,
      ContentType: contentType
    }, function (err, data) {
      if (err) {
        console.error('saveToS3', err)
        reject(err)
      } else {
        console.log('saveToS3: ', data)
        resolve(data)
      }
    })
  })
}
