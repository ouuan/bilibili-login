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
const qs = require('qs');

const { getGeetestResult } = require('./geetest');
const { encryptPassword } = require('./encrypt');

async function login(username, password) {
  const {
    key,
    challenge,
    geetest_validate: validate,
    geetest_seccode: seccode,
  } = await getGeetestResult();
  const encryptedPassword = await encryptPassword(password);
  const postData = qs.stringify({
    captchaType: 6,
    username,
    password: encryptedPassword,
    keep: true,
    key,
    challenge,
    validate,
    seccode,
  });
  const response = await axios.post('https://passport.bilibili.com/web/login/v2', postData);
  if (response.data.code === 0) {
    const redirectUrl = new URL(response.data.data.redirectUrl);
    return Object.fromEntries(redirectUrl.searchParams.entries());
  }
  throw Error(`Error occurred while logging: ${JSON.stringify(response.data)}

Please check your username and password.

POST data: ${JSON.stringify(postData)}

See also https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/login/login_action/password.md#%E4%BD%BF%E7%94%A8%E8%B4%A6%E5%8F%B7%E5%AF%86%E7%A0%81%E7%99%BB%E5%BD%95web%E7%AB%AF`);
}

module.exports = { login };
