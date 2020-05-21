const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');

const apiRouter = require('./Api/api');


app.use(bodyParser.json());
app.use('/api', apiRouter);
app.use(errorHandler());


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log('Server Running On Port ' + PORT );
});

module.exports = app;