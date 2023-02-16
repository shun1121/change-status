require("dotenv").config();
const express = require("express");
const functions = require("firebase-functions");
const bodyParser = require("body-parser");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);

initializeApp();
const db = getFirestore();
const app = express();

app.use("/slack/events", slackEvents.requestListener());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  if (code) {
    const slack = new WebClient();
    const result = await slack.oauth.v2.access({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    });
    res.send("THANK YOU");

    const time = new Date();
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const date = time.getDate();
    const hour = time.getHours() + 9;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const created_at =
      year +
      "-" +
      month +
      "-" +
      date +
      "-" +
      hour +
      ":" +
      minutes +
      ":" +
      seconds;
    const docRef = db.collection("users").doc(result.authed_user.id);
    await docRef.set({
      id: result.authed_user.id,
      access_token: result.authed_user.access_token,
      created_at: created_at,
    });
  } else if (error) {
    res.send("認証がキャンセルされました。");
  }
});

app.post("/slack/command/", async (req, res) => {
  let token;
  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => {
    if (req.body.user_id === doc.id) {
      token = doc.data().access_token;
    }
  });
  const web = new WebClient(token);
  if (req.body.command === "/hiru") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 3600;
    await web.users.profile.set({
      profile: {
        status_emoji: ":ohiru:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#breaktime",
      text: ":ohiru:",
    });
  } else if (req.body.command === "/zenhan") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 1800;
    await web.users.profile.set({
      profile: {
        status_emoji: ":half1:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#breaktime",
      text: ":half1:",
    });
  } else if (req.body.command === "/kouhan") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 1800;
    await web.users.profile.set({
      profile: {
        status_emoji: ":half2:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#breaktime",
      text: ":half2:",
    });
  } else if (req.body.command === "/bg_in") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime - (currentTime % 86400) + 86400 - 32400; //明日の0時まで
    await web.users.profile.set({
      profile: {
        status_emoji: ":office:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#backend_dayrepo",
      text: "おはようございます。稼働開始します。",
    });
  } else if (req.body.command === "/bg_out") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime - (currentTime % 86400) + 86400 - 32400; //明日の0時まで
    await web.users.profile.set({
      profile: {
        status_emoji: ":taikin:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#backend_dayrepo",
      text: "お疲れ様です。お先に失礼します。",
    });
  } else if (req.body.command === "/bg_riseki") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime - (currentTime % 86400) + 86400- 32400; //明日の0時まで
    await web.users.profile.set({
      profile: {
        status_emoji: ":riseki:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#backend_dayrepo",
      text: "休憩・離席します。",
    });
  } else if (req.body.command === "/bg_hukki") {
    res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime - (currentTime % 86400) + 86400 - 32400; //明日の0時まで
    await web.users.profile.set({
      profile: {
        status_emoji: ":office:",
        status_expiration: expiration,
      },
    });
    await web.chat.postMessage({
      token: token,
      channel: "#backend_dayrepo",
      text: "復帰します。",
    });
  } else {
    console.log("error");
  }
  res.end()
});

exports.slackApp = functions.runWith({ memory: '512MB' }).region("asia-northeast1").https.onRequest(app);
