# Ask James - The Serverless Web Crawler

There is an article explaining the usage of this code here: TBD.

This is naive crawler that's a Proof of Concept and not appropriate for production usage. Do not use against production websites. Do not use against websites where you do not have permission to crawl. Do not violate AWS Terms & Conditions.

This code is provided for educational purposes only with no warranty implied.

Misuse may result in considerable AWS expenses and may negatively impact target websites.

Do not run this code unless you understand the implications of web crawling. You are entirely responsible for the consequences of running this code.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)

## Running it locally

Starting the local environment:

```
$ git clone https://github.com/bixelsnl/askJames-serverlessCrawler.git
$ cd askJames-serverlessCrawler
$ npm ci
$ sls dynamodb install
$ sls offline start
```

The local DynamoDB stores data in memory, so every restart clears all information. It also stores some
configuration in the `.dynamodb` folder, which can usually simply just be ignored. But I have had to remove
that directory once when the daemon wouldn't start anymore after upgrading some npm packages.

Once the local environment is started, add an URL to the DynamoDB table to trigger the crawler. Since
serverless-offline also mimics API Gateway, we can trigger it as follows:

```
curl -XPOST http://localhost:3000/startCrawl --data '{ "url": "https://some-url" }'
```

You should see some output in the terminal where the local environment is running. To list the URLs within
the DynamoDB table, run the following script in the DynamoDB javascript shell by navigating to
http://localhost:8000/shell in your browser:

```
var params = {
    TableName: 'crawler',
    Select: 'ALL_ATTRIBUTES',
    ReturnConsumedCapacity: 'NONE',
};

dynamodb.scan(params, function(err, data) {
    if (err) ppJson(err);
    else ppJson(data);
});
```

The crawled data is stored in the folder ./s3/crawled-site.local and can be reached in your browser at
http://127.0.0.1:8001/crawled-site.local . You need to manually delete this folder every time you re-crawl
a (different) site.

## Support

If you have any questions or comments, feel free to contact me (James Beswick) at @jbesw. I hope you enjoy!
