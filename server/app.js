const express = require('express');

var app = express();

app.use(express.json());

// 路由对象
app.use('/api', require('./routes/music'));

module.exports = app;
