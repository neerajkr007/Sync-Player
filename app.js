const express = require('express');
const app = express();
const serv = require('http').createServer(app);
 

app.get('/', (req, res) =>
{
    res.sendFile(__dirname + '/home.html');
}); 

app.use(express.static(__dirname + '/public'));

serv.listen(process.env.PORT || 3000);