// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const SUMMARISE_ACTION = 'summarise.article';
const ARTICLE_ARGUMENT = 'article';
let answers = {};

app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  function summariseArticle (assistant) {
    let articleName = assistant.getArgument(ARTICLE_ARGUMENT);
    if (answers[articleName]) {
      assistant.tell(answers[articleName]);
    } else {
      getSummary(articleName, function(summary) {
        answers[articleName] = summary;
        assistant.tell(summary);
      });
    }
  }

  let actionMap = new Map();
  actionMap.set(SUMMARISE_ACTION, summariseArticle);

  assistant.handleRequest(actionMap);
});

function getSummary(articleName, callback) {
  let apiKey = process.env.SMMRY_API_KEY;
  let sentences = 2;
  let url = `http://api.smmry.com/&SM_API_KEY=${apiKey}&SM_LENGTH=${sentences}&SM_URL=https://en.wikipedia.org/wiki/${articleName}`;
  
  return request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log(`Error querying ${url}`, err);
      return callback(`I encountered an error looking up ${articleName}, sorry.`);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
      return callback(`I encountered an error ${res.statusCode} looking up ${articleName}, sorry.`);
    } else {
      // data is already parsed as JSON:
      return callback(data.sm_api_content);
    }
  });
}

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
