require("dotenv").config();
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const token = process.env.USER_OAUTH_TOKEN;

initializeApp();

const db = getFirestore();

const app = express();

app.use("/slack/events", slackEvents.requestListener());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async function (req, res) {
  // 認可コードの取得
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
    res.send(`access_token: ${result.authed_user.access_token}`);

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
    console.log(created_at);
    const docRef = db.collection("users").doc(result.authed_user.id);
    await docRef.set({
      id: result.authed_user.id,
      access_token: result.authed_user.access_token,
      created_at: created_at,
    });

    console.log("before post request");
    console.log(
      "result.authed_user.access_token = " + result.authed_user.access_token
    );
    app.post("/slack/command/", async (req, res) => {
      console.log("after post request");
      // let token;
      const cityRef = db.collection("users").doc(result.authed_user.access_token);
      console.log(cityRef)
      const doc = await cityRef.get();
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
      }
      // const snapshot = await db.collection("users").get();
      // snapshot.forEach((doc) => {
      //   console.log(
      //     "result.authed_user.access_token in forEach = " +
      //       result.authed_user.access_token
      //   );
      //   console.log(doc.id, "=>", doc.data());
      //   if (result.authed_user.access_token === doc.data().access_token) {
      //     console.log("ok");
      //     token = doc.data().access_token;
      //   }
      // });
      console.log("after forEach loop");
      console.log(
        "result.authed_user.access_token = " + result.authed_user.access_token
      );
      // console.log("access_token = " + token)
      const web = new WebClient(token); // /hiru /zenhan /hiruでプロフを変えると最後にdispatch_failedが出る
      // const web = new WebClient(result.authed_user.access_token);
      if (req.body.command === "/hiru") {
        console.log("slash command hiru");
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
    res.send("error");
    console.log("エラー");
  }
});

exports.app = functions.https.onRequest(app);
