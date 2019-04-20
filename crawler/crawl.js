const cheerio = require('cheerio')
const axios = require('axios')
const https = require('https')
const cssUrlParser = require('css-url-parser')
const path = require('path')
const replaceall = require('replaceall')
const isBinaryFile = require("isbinaryfile").isBinaryFileSync
const { saveToS3 } = require('./s3')

// Returns set of distinct URLs found in a given URL.

/* This function:
   1. Fetches the contents from the crawl URL
   2. Finds a list of URLs in the HTML document.
   3. Filters the list for valid URLs.
   4. Return distinct set of URLs
*/

module.exports.crawl = async (crawlUrl) => {
  const agent = new https.Agent({
    rejectUnauthorized: false
  })
  const response = await axios.get(crawlUrl, {
    httpsAgent: agent, // disable cert checking
    validateStatus: false, // dont care about response http status code
    responseType: 'arraybuffer'
  })
  const foundURLs = [] // Discovered URLs from the page

  console.log('crawl started: ', crawlUrl)

  const parsedCrawlUrl = new URL(crawlUrl)

  if (!isBinaryFile(response.data)) {
    console.log('Non-binary file detected. Parsing ' + crawlUrl + ' to find more URLs')

    response.data = response.data.toString()

    const $ = cheerio.load(response.data, {
      withDomLvl1: true,
      normalizeWhitespace: false,
      xmlMode: false,
      decodeEntities: false
    })

    // ugly hack to convert JSON parsed content (eg /wp-json) back to a string
    // it would be better to disable this in axios
    var util = require('util')
    if (response.data.replace == undefined) {
      response.data = util.inspect(response.data)
    }

    // Iterate through all hrefs on the crawled page
    if (response.headers['content-type'].includes('text/html') || response.headers['content-type'].includes('text/css')) {
      // for HTML documents
      $('a, img, link, script, use').each((i, link) => {
        const linkUrl = $(link).attr('href') || $(link).attr('src') || $(link).attr('xlink:href')

        // Some tags may not refer to resources, eg script tag might not have a src
        if (undefined === linkUrl) {
          return true;
        }
        console.log(i, linkUrl)

        // Validate URL
        const validatedURL = validateURL(crawlUrl, linkUrl)
        if (validatedURL) {
          console.log('Valid foundURL: ', validatedURL)
          foundURLs.push(validatedURL)
        }

        response.data = response.data.replace(new RegExp(parsedCrawlUrl.host, 'gi'), '127.0.0.1:8001/crawled-site.local').replace(new RegExp('https://127.0.0.1:8001', 'gi'), 'http://127.0.0.1:8001')
      })

      // for CSS documents
      cssUrlParser(response.data).forEach(function(linkUrl, i) {
        console.log(i, linkUrl)

        const validatedURL = validateURL(crawlUrl, linkUrl)
        if (validatedURL) {
          console.log('Valid foundURL: ', validatedURL)
          foundURLs.push(validatedURL)
        }

        const r = new RegExp('^(?:[a-z]+:)?//', 'i')
        if (r.test(linkUrl)) {
          response.data = response.data.replace(new RegExp(parsedCrawlUrl.host, 'gi'), '127.0.0.1:8001/crawled-site.local').replace(new RegExp('https://127.0.0.1:8001', 'gi'), 'http://127.0.0.1:8001')
        } else {
          response.data = replaceall(linkUrl, '//127.0.0.1:8001/crawled-site.local' + linkUrl, response.data)
        }
      })

    } else {
      // @todo for other kinds of documents
      response.data = response.data.replace(new RegExp(parsedCrawlUrl.host, 'gi'), '127.0.0.1:8001/crawled-site.local').replace(new RegExp('https://127.0.0.1:8001', 'gi'), 'http://127.0.0.1:8001')
    }

    response.data = new Buffer(response.data)
  } else {
    console.log('Binary file detected: ' + crawlUrl)
  }

  var s3key = parsedCrawlUrl.pathname.substr(1);
  if (!path.basename(s3key)) {
    s3key += 'index.html'
  }
  saveToS3(
    s3key,
    response.data,
    response.headers['content-type']
  )

  // Remove the duplicates
  return new Set(foundURLs)
}

// Takes original crawled URL and link URL.
// Returns validated URL or undefined if not valid.

const validateURL = (crawlUrl, linkUrl) => {
  let foundUrl = ''
  if (!linkUrl) return // Remove nulls/empty hrefs
  if (linkUrl.charAt(0) === '#') return // Remove anchor hrefs

  const parsedCrawlUrl = new URL(crawlUrl)
  const parsedUrl = new URL(linkUrl, crawlUrl)

  // Relative URLs/hashed URLs, etc.
  if (!parsedUrl.protocol) {
    // Remove hashed URLs (#chat, etc)
    if (!parsedUrl.path) return

    // Build absolute URL - some relative URLs don't start with a slash, so add one
    const paddedSlash = parsedUrl.path.charAt(0) === '/' ? '' : '/'
    foundUrl = `${parsedCrawlUrl.protocol}//${parsedCrawlUrl.host}${paddedSlash}${parsedUrl.pathname}`
  } else {
    // Ensure http/https
    if (!parsedUrl.protocol.includes('http')) return

    // Check same domain
    if (parsedUrl.host !== parsedCrawlUrl.host) return
    foundUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`
  }

  // Remove self references
  if (foundUrl === crawlUrl) return
  return foundUrl
}
