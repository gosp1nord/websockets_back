const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const WS = require('ws');

const app = new Koa();

app.use(cors());
app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

const server = http.createServer(app.callback());
const port = 7070;
const wsServer = new WS.Server({
  server
});

const chat = ['welcome to our chat'];
const arrImgs = [
  'cat.png',
  'frog.png',
  'panda.png',
  'pig.png',
  'sheep.png',
  'tiger.png',
];
let arrNicknames = [];
const arrMessages = [];
let answer = {};
const arrClients = [];

wsServer.on('connection', (ws) => {
  ws.on('message', (message) => {
    message = message.toString()
    const data = JSON.parse(message)
    if (data.sendler === 'setNickname') {
      answer = {sendler: 'setNickname', text: setNickname(data.text, ws)};
      sendAll(answer)
      ws.send(JSON.stringify({sendler: 'setAllMessage', text: {status: 'ok', messages: arrMessages}}));
      return
    }

    if (data.sendler === 'setMessage') {
      const dateMessage = getDateTime();
	    const arrCurrentClient = arrClients.filter(client => client.client === ws)
      arrMessages.push({ time: dateMessage, text: data.text, user: arrCurrentClient[0].username})
	    sendAll({sendler: 'setMessage', text: {status: 'ok', message: { time: dateMessage, text: data.text, user: arrCurrentClient[0].username}}})
      return
    }
    
    if (data.sendler === 'setAllMessage') {
        sendAll({sendler: 'setAllMessage', text: {status: 'ok', messages: arrMessages}})
        return
    }
  });

  ws.on('close', function() {
    let index;
    for (let i = 0; i < arrClients.length; i += 1) {
      if (arrClients[i].client === ws) {
        index = i;
        break
      }
    }
    console.log(`Пользователь "${arrClients[index].username}" отключился`);
    arrNicknames = arrNicknames.filter(client => client.username !== arrClients[index].username)
    arrClients.splice(index, 1);
    sendAll({sendler: 'setNickname', text: {status: 'ok', users: arrNicknames}})
    return
  })
});

function setNickname(user, ws) {
  if (arrNicknames.some(sub => sub.username === user)) {
    return {status: 'error', errorNick: user}
  }
  const img = arrayRandElement();
  arrNicknames.push({username: user, ava: img})
  arrClients.push({ client: ws, username: user})
  return {status: 'ok', users: arrNicknames}
}

function getDateTime() {
  elementDate = new Date();
  const numDate = `0${elementDate.getDate()}`.slice(-2);
  const numMonth = `0${elementDate.getMonth() + 1}`.slice(-2);
  const numYear = `0${elementDate.getFullYear()}`;
  const numHour = `0${elementDate.getHours()}`.slice(-2);
  const numMinutes = `0${elementDate.getMinutes()}`.slice(-2);
  dateString = `${numDate}.${numMonth}.${numYear} ${numHour}:${numMinutes}`;
  return dateString
}

function arrayRandElement() {
  const rand = Math.floor(Math.random() * arrImgs.length);
  return arrImgs[rand];
}

function sendAll(answer) {
  arrClients.forEach(item => {
    item.client.send(JSON.stringify(answer))
  })
}

server.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
});
