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

const neodoc = require('neodoc');
const { login } = require('./login');

const { version } = require('../package.json');

const args = neodoc.run(`Log in to Bilibili and get the Cookies.

Usage:
  bilibili-login --username=<username> --password=<password> [options]

Options:
  -u, --username=<username>  Email or phone number. [env: BILIBILI_USERNAME]
  -p, --password=<password>  Password.              [env: BILIBILI_PASSWORD]
`, { version: `v${version}` });

const {
  '--username': username,
  '--password': password,
} = args;

login(username, password).then((cookies) => {
  process.stdout.write(JSON.stringify(cookies));
  process.exit();
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
