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

## Installation

```
$ git clone https://github.com/bixelsnl/askJames-serverlessCrawler.git
$ npm ci
```

## Running it locally

Starting the local environment:

```
$ sls dynamodb install
$ sls offline start
```

The local DynamoDB stores data in memory, so every restart clears all information. It also stores some
configuration in the `.dynamodb` folder, which can usually simply just be ignored. But I have had to remove
that directory once when the daemon wouldn't start anymore after upgrading some npm packages.

Once the local environment is started, add an URL to the DynamoDB table to trigger the crawler. You can do
this from the local javascript shell by firing up a browser and going to http://localhost:8000/shell .

Run the following script to put an item:

```
var params = {
    TableName: 'crawler',
    Item: {
        url: 'https://some-url'
    },
};

docClient.put(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});
```

You should see some output in the terminal where the local environment is running. To list the URLs within
the DynamoDB table, run the following script in the DynamoDB javascript shell:

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

## Support

If you have any questions or comments, feel free to contact me (James Beswick) at @jbesw. I hope you enjoy!
