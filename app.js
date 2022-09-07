require('dotenv').config();
const { createServer } = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET
const port = process.env.PORT || 3000;
const slackEvents = createEventAdapter(slackSigningSecret);
const token = process.env.USER_OAUTH_TOKEN
const web = new WebClient(token)

const app = express();

app.use('/slack/events', slackEvents.requestListener());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

// app.get('/', (req, res) => res.send('Hello World!'));
app.get('/', function(req, res) {
  res.send('Ngrok is working! Path Hit: ' + req.url);
});

const server = createServer(app);

server.listen(port, () => console.log(`listening on por ${port}!`));

app.post('/command', async (req, res) => {
  // console.log(req)
  // console.log(res.body.command)
  if (res.req.body.command === '/hiru') {
    console.log(res.req.body.command)
    const currentTime = Math.floor(Date.now() / 1000)
    const expiration = currentTime + 3600
    res.send("");
    const result = await web.users.profile.set({
      profile: {
        status_emoji: ":ohiru:",
        // status_expiration: currentTime+10,
        status_expiration: expiration
      }
    });
    const post = await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":ohiru:"
    });
    console.log(result)
  } else if (res.req.body.command === '/zenhan') {
    const currentTime = Math.floor(Date.now() / 1000)
    const expiration = currentTime + 1800
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":half1:",
        // status_expiration: currentTime+30,
        status_expiration: expiration
      }
    });
    const post = await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":half1:"
    });
  } else if (res.req.body.command === '/kouhan') {
    const currentTime = Math.floor(Date.now() / 1000)
    const expiration = currentTime + 1800
    res.send("");
    await web.users.profile.set({
      profile: {
        status_emoji: ":half2:",
        // status_expiration: currentTime+30,
        status_expiration: expiration
      }
    });
    const post = await web.chat.postMessage({
      token: process.env.USER_OAUTH_TOKEN,
      channel: "#breaktime",
      text: ":half2:"
    });
  } else {
    console.log("error")
  }
});
