require("dotenv").config();
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
// const token = process.env.USER_OAUTH_TOKEN;

initializeApp();

const db = getFirestore();

const app = express();

app.use("/slack/events", slackEvents.requestListener());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let authed_access_id
let authed_access_token
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
    authed_access_token = result.authed_user.access_token;
    authed_access_id = result.authed_user.id;
    res.send(`access_token: ${authed_access_token}`);

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
    const docRef = db.collection("users").doc(authed_access_id);
    await docRef.set({
      id: authed_access_id,
      access_token: authed_access_token,
      created_at: created_at,
    });
  } else if (error) {
    res.send("認証がキャンセルされました。");
    console.log("認証がキャンセルされました。");
  }
});
app.post("/slack/command/", async (req, res) => {
  let token;
  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => {
    if (req.body.user_id === doc.id) {
      console.log("ok");
      token = doc.data().access_token;
    }
  });
  const web = new WebClient(token);
  if (req.body.command === "/hiru") {
    console.log("slash command hiru");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 3600;
    res.send("");
    await web.users.profile.set({
      user: req.body.user_id,
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
    //   token: req.body.user_id,
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
      token: req.body.user_id,
      channel: "#breaktime",
      text: ":half2:",
    });
  } else {
    console.log("error");
  }
});

exports.app = functions.https.onRequest(app);
