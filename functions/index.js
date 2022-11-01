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

exports.scheduledFunction = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
  console.log('This will be run every 5 minutes!');
  return null;
});

app.post("/slack/command/", async (req, res) => {
  console.log("before send method")
  res.status(200).send("")
  console.log("after send method & before snapshot");
  let token;
  const snapshot = await db.collection("users").get();
  console.log("after snapshot & before snapshot forEach"); // 3、4秒
  snapshot.forEach((doc) => {
    console.log("inside snapshot forEach start");
    if (req.body.user_id === doc.id) {
      token = doc.data().access_token;
      console.log("token");
    }
    console.log("inside snapshot forEach end");
  });
  console.log("after snapshot section");
  const web = new WebClient(token);
  if (req.body.command === "/hiru") {
    console.log("inside hiru command"); //0.何秒
    // res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 3600;
    // const setStamp2Prof = async () => {
    //   const profileStamp = await web.users.profile.set({
    //     profile: {
    //       status_emoji: ":ohiru:",
    //       status_expiration: expiration,
    //     },
    //   });
    //   return profileStamp
    // }
    await web.users.profile.set({
      profile: {
        status_emoji: ":ohiru:",
        status_expiration: expiration,
      },
    });
    console.log("before postmessage1"); //3秒
    // const postStamp2Channel = async () => {
    //   const postStamp = await web.chat.postMessage({
    //     token: token,
    //     // channel: "#breaktime",
    //     channel: "#test-shunsuke",
    //     text: ":ohiru:",
    //   });
    //   return postStamp
    // }
    web.chat.postMessage({
      token: token,
      // channel: "#breaktime",
      channel: "#test-shunsuke",
      text: ":ohiru:",
    });
    // const results = await Promise.all([setStamp2Prof(), postStamp2Channel()])
    // console.log(results)
    // res.end()
  } else if (req.body.command === "/zenhan") {
    console.log("inside zenhan command");
    // res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 1800;
    await web.users.profile.set({
      profile: {
        status_emoji: ":half1:",
        status_expiration: expiration,
      },
    });
    console.log("before postmessage2");
    await web.chat.postMessage({
      token: token,
      channel: "#test-shunsuke",
      // channel: "#breaktime",
      text: ":half1:",
    });
    // res.end()
  } else if (req.body.command === "/kouhan") {
    console.log("inside kouhan command");
    // res.send("");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiration = currentTime + 1800;
    await web.users.profile.set({
      profile: {
        status_emoji: ":half2:",
        status_expiration: expiration,
      },
    });
    console.log("before postmessage3");
    await web.chat.postMessage({
      token: token,
      channel: "#test-shunsuke",
      // channel: "#breaktime",
      text: ":half2:",
    });
    // res.end()
  } else {
    console.log("error");
    // res.end()
  }
  res.end()
});

exports.slackApp = functions.region("asia-northeast1").https.onRequest(app);
