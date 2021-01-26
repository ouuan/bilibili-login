/**
* @license
* Copyright 2021 Yufan You
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

const axios = require('axios');
const fs = require('fs').promises;
const open = require('open');
const path = require('path');
const qs = require('qs');
const server = require('server');
const { status, type } = require('server/reply');

const { port } = require('./constants');

const { get, post } = server.router;

async function validatorFile(...args) {
  const data = await fs.readFile(path.resolve(__dirname, '..', 'geetest-validator', ...args));
  return data.toString();
}

async function getGeetestResult() {
  const index = await validatorFile('index.html');
  const cssStyle = await validatorFile('css', 'style.css');
  const jsGt = await validatorFile('js', 'gt.js');
  const jsJquery = await validatorFile('js', 'jquery.min.js');

  const response = await axios.get('https://passport.bilibili.com/web/captcha/combine?plat=6');
  if (response.data.code !== 0) throw response;
  const geetestParams = response.data.data.result;

  let validateFinished = () => {};

  const geetestPromise = new Promise((resolve) => { validateFinished = resolve; });

  server({ port, security: { csrf: false } }, [
    get('/', () => index),
    get('/css/style.css', () => type('css').send(cssStyle)),
    get('/js/gt.js', () => type('js').send(jsGt)),
    get('/js/jquery.min.js', () => type('js').send(jsJquery)),
    post('/post', (ctx) => {
      validateFinished({ ...geetestParams, ...ctx.data });
      return { status: 200 };
    }),
    get(() => status(404).send('Not Found')),
  ]);

  const url = new URL(`http://localhost:${port}?${qs.stringify(geetestParams)}`);

  await open(url.toString());

  return geetestPromise;
}

module.exports = { getGeetestResult };
