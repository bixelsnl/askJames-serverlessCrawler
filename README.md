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

## Usage

```
$ cp testEvent.sample.json testEvent.json
```

Don't forget to:

- Update your testEvent.json
- Create the DynamoDB table 'crawler'
- Add the stream ARN in serverless.yaml (when you are ready)
- Spend time to test and understand what the code is doing

## Running it locally

```
$ sls dynamodb install
$ sls invoke local -f streamUpdated --path testEvent.json
```

## Support

If you have any questions or comments, feel free to contact me (James Beswick) at @jbesw. I hope you enjoy!
