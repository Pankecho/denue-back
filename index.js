const express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    morgan = require('morgan'),
    port = 3000,
    app = express();

const db = mysql.createConnection({
    host: '157.230.5.181',
    user: 'pankecho',
    password: 'juanpa',
    database: 'denue'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.listen(port, () => {
   console.log('App escuchando en el puerto 3000');
});
