require("dotenv").config();
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const token = process.env.USER_OAUTH_TOKEN;

const app = express();

app.use("/slack/events", slackEvents.requestListener());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async function (req, res) {
  // 認可コードの取得
  const code = req.query.code
  const error = req.query.error
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  if (code) {
    const slack = new WebClient();
    const result = await slack.oauth.v2.access({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    });
    res.send(`access_token: ${result.authed_user.access_token}`)
    app.post("/slack/command", async (req, res) => {
      const web = new WebClient(result.authed_user.access_token);
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
        //   token: result.authed_user.access_token,
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
        // await web.chat.postMessage({
        //   token: result.authed_user.access_token,
        //   channel: "#breaktime",
        //   text: ":half1:",
        // });
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
          token: result.authed_user.access_token,
          channel: "#breaktime",
          text: ":half2:",
        });
      } else {
        console.log("error");
      }
    });
  } else if (error) {
    res.send("error")
    console.log("エラー");
  }
});

exports.app = functions.https.onRequest(app);
