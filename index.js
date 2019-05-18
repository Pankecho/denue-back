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

app.get('/empresa', (req, res) => {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const query = `SELECT * FROM empresa LIMIT ${limit} OFFSET ${offset}`;
    db.query(query, (err, result) => {
        if (err) {
            res.json({ Data: err, Message: 'Error' });
        }else{
            res.json({ Data: result, Message: 'Success' });
        }
    });
});

app.post('/empresa', (req, res) => {
    const objeto = req.body;
    const nombre = objeto.nombre_establecimiento;
    const razon = objeto.razon_social;
    const query = `INSERT INTO empresa (nom_estab, razon_social) VALUES (${nombre}, ${razon})`;
    db.query(query, (err, result) => {
        if (err) {
            res.json({ Data: err, Message: 'Error' });
        }else{
            res.json({ Data: result, Message: 'Success' });
        }
    });
});

app.get('/empresa/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM empresa as e WHERE e.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.json({ Data: err, Message: 'Error' });
        }else{
            if (result.length == 0){
                res.json({ Data: null, Message: 'Not found' });
            }else{
                let elemento = result[0];
                const queryDos = `SELECT * FROM ubicacion as u WHERE u.ID_empresa = ${id}`;
                db.query(queryDos, (err, result) => {
                    if (err) {
                        res.json({ Data: err, Message: 'Error' });
                    }else{
                        elemento.ubicaciones = result;
                        res.json({ Data: elemento, Message: 'Success' });
                    }
                });
            }
        }
    });
});

app.put('/empresa/:id', (req, res) => {
    const id = req.params.id;
    const objeto = req.body;
    const nombre = objeto.nombre_establecimiento;
    const razon = objeto.razon_social;
    const query = `UPDATE empresa AS e SET nom_estab = '${nombre}', razon_social = '${razon}' WHERE e.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.json({ Data: err, Message: 'Error'});
        }else{
            res.json({ Data: result, Message: 'Success'});
        }
    });
});

app.delete('/empresa/:id', (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM empresa as e WHERE e.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.json({ Data: err, Message: 'Error' });
        }else{
            res.json({ Data: result, Message: 'Success' });
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.Rol;
    const password = req.body.Password;
    const query = `SELECT * FROM usuarios AS u WHERE u.rol = '${username}' AND u.contrasena = '${password}'`;
    db.query(query, (err, result) => {
        if (err) {
            res.json({Data: err, Message: 'Error'});
        }else{
            if (result.length == 0){
                res.json({ Data: null, Message: 'Wrong Credentials' });
            }else {
                res.json({ Data: result, Message: 'Success' });
            }
        }
    });
});


app.listen(port, () => {
   console.log('App escuchando en el puerto 3000');
});
