require('dotenv').config();
const functions = require("firebase-functions");
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET
const slackEvents = createEventAdapter(slackSigningSecret);
const token = process.env.USER_OAUTH_TOKEN
const web = new WebClient(token)

const app = express();

app.use('/slack/events', slackEvents.requestListener());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send("change-status");
});

app.post('/slack/command', async (req, res) => {
  if (req.body.command === '/hiru') {
    const currentTime = Math.floor(Date.now() / 1000)
    const expiration = currentTime + 3600
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":ohiru:",
        status_expiration: expiration
      }
    });
    await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":ohiru:"
    });
  } else if (req.body.command === '/zenhan') {
    const currentTime = Math.floor(Date.now() / 1000)
    const expiration = currentTime + 1800
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":half1:",
        status_expiration: expiration
      }
    });
    await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":half1:"
    });
  } else if (req.body.command === '/kouhan') {
    const currentTime = Math.floor(Date.now() / 1000)
    const expiration = currentTime + 1800
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":half2:",
        status_expiration: expiration
      }
    });
    await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":half2:"
    });
  } else {
    console.log("error")
  }
});

exports.app = functions.https.onRequest(app)
