require("dotenv").config();
const functions = require("firebase-functions");
const express = require("express");
// const request = require("request");
const bodyParser = require("body-parser");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const token = process.env.USER_OAUTH_TOKEN;
// const web = new WebClient(token);

const app = express();

app.use("/slack/events", slackEvents.requestListener());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async function (req, res) {
  // // 認可コードの取得
  // // const code = req.query["code"];
  const code = req.query.code
  // const error = req.query.error
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  // // res.send(code)
  if (code) {
    const slack = new WebClient();
    const result = await slack.oauth.v2.access({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    });
    // res.send("change-status");
    res.send(result)
  //   // return `access_token: ${result.authed_user.access_token}`;
  //   // console.log(result.authed_user.access_token);
  // // } else if (error) {
  // //   return '認証がキャンセルされました。';
  // //   // console.log("エラー");
  }
  // // // const code = req.query.code;
  // // console.log("aaaaaaaaaaaaaaaaaa")
  // // console.log(req);
  // // console.log(code);
  // // res.send(clientSecret)
  // // res.send("change-status");
  // // res.send("aaaaaaaaa");
  // // res.send(`access_token: ${result.authed_user.access_token}`)

  // // 認可コードを使って、アクセストークンをリクエストする
  // request(
  //   {
  //     url: "https://slack.com/api/oauth.v2.access",
  //     method: "POST",
  //     form: {
  //       client_id: clientId,
  //       client_secret: clientSecret,
  //       code: code,
  //       redirect_uri:
  //         "https://us-central1-tutorial-4688d.cloudfunctions.net/app",
  //     },
  //   },
  //   (error, response, body) => {
  //     // レスポンスからアクセストークンを取得する
  //     console.log(body);
  //     const param = JSON.parse(body);
  //     console.log(param);
  //     res.send(param)
  //     // const access_token = param["access_token"]; // アクセストークン

  //     // ユーザIDを取得するためのリクエスト
  //     // request(
  //     //   "https://slack.com/api/auth.test",
  //     //   {
  //     //     method: "POST",
  //     //     form: {
  //     //       token: access_token,
  //     //     },
  //     //   },
  //     //   (error, response, body) => {
  //     //     const user = JSON.parse(body);
  //     //     console.log(user);
  //     //     // アクセストークンを使ってユーザ情報をリクエスト
  //     //     request(
  //     //       "https://slack.com/api/users.info ",
  //     //       {
  //     //         method: "POST",
  //     //         form: {
  //     //           token: access_token,
  //     //           user: param["user_id"],
  //     //         },
  //     //       },
  //     //       (error, response, body) => {
  //     //         res.send(user);
  //     //       }
  //     //     );
  //     //   }
  //     // );
  //   }
  // );
});

app.post("/slack/command", async (req, res) => {
  const web = new WebClient(token);
  if (req.body.command === "/hiru") {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 3600;
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":ohiru:",
        status_expiration: expiration,
      },
    });
    // await web.chat.postMessage({
    //   token: process.env.USER_OAUTH_TOKEN,
    //   channel: "#breaktime",
    //   text: ":ohiru:",
    // });
  } else if (req.body.command === "/zenhan") {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 1800;
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":half1:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":half1:",
    });
  } else if (req.body.command === "/kouhan") {
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 1800;
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":half2:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":half2:",
    });
  } else {
    console.log("error");
  }
});

exports.app = functions.https.onRequest(app);
