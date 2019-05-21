const express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    morgan = require('morgan'),
    csv = require('csv-stringify'),
    port = 3000,
    app = express();

// Configuracion de la base de datos
const db = mysql.createPool({
    connectionLimit: 10,
    host: '157.230.5.181',
    user: 'pankecho',
    password: 'juanpa',
    database: 'denue'
});


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('combined'));

// Get a las empresas con busqueda por query
app.get('/empresa', (req, res) => {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const busqueda = req.query.query;
    const total = `SELECT COUNT(*) AS total FROM empresa as e INNER JOIN ubicacion AS u on e.ID_empresa = u.ID_empresa  WHERE e.nom_estab LIKE '%${busqueda}%' OR e.razon_social LIKE '%${busqueda}%'`;
    db.query(total, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            const total = result[0].total;
            const query = `SELECT * FROM empresa as e INNER JOIN ubicacion AS u on e.ID_empresa = u.ID_empresa  WHERE e.nom_estab LIKE '%${busqueda}%' OR e.razon_social LIKE '%${busqueda}%' or u.municipio LIKE '%${busqueda}%' ORDER BY e.ID_empresa DESC LIMIT ${limit} OFFSET ${offset}`;
            db.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ Data: err, Message: 'Error' });
                }else{
                    res.json({ Data: { Empresas: result, Total: total }, Message: 'Success' });
                }
            });
        }
    });
});

// Creacion de una empresa
app.post('/empresa', (req, res) => {
    console.log(req.body);
    const objeto = req.body;
    const nombre = objeto.nom_estab;
    const razon = objeto.razon_social;
    const query = `INSERT INTO empresa (nom_estab, razon_social) VALUES ('${nombre}', '${razon}')`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            res.json({ Data: result, Message: 'Success' });
        }
    });
});

app.get('/empresa/csv', (req, res) => {
    const id = `(${req.query.ids})`;
    const query = `select  e.nom_estab as Empresa,
                           u.nom_vial as Calle,
                           u.numero_ext as No_Ext,
                           u.letra_ext as No_Int,
                           u.localidad as Colonia,
                           u.municipio as Municipio,
                           u.entidad as Estado,
                           u.latitud as Latitud,
                           u.longitud as Longitud
                           from empresa as e inner join ubicacion as u
                           on e.ID_empresa = u.ID_empresa
                           WHERE u.ID_empresa in ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=\"' + id + '.csv\"');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Pragma', 'no-cache');
            csv(result, { header: true }).pipe(res);
        }
    });
});

// Borrar una empresa
app.post('/empresa/delete', (req, res) => {
    const id = req.body.ids;
    const cadena = `(${id.join(',')})`;
    const query = `DELETE FROM ubicacion as e WHERE e.ID_empresa in ${cadena}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            const query = `DELETE FROM empresa as e WHERE e.ID_empresa in ${cadena}`;
            db.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ Data: err, Message: 'Error' });
                }else{

                    res.json({ Data: result, Message: 'Success' });
                }
            });
        }
    });
});

// Generar CSV con las direcciones de una empresa
app.get('/empresa/:id/csv', (req, res) => {
    const id = req.params.id;
    const query = `select u.nom_vial as Calle,
                           u.numero_ext as No_Ext,
                           u.letra_ext as No_Int,
                           u.localidad as Colonia,
                           u.municipio as Municipio,
                           u.entidad as Estado,
                           u.latitud as Latitud,
                           u.longitud as Longitud
                           from ubicacion as u WHERE u.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=\"' + id + '.csv\"');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Pragma', 'no-cache');
            csv(result, { header: true }).pipe(res);
        }
    });
});

// Detalle de una empresa con sus direcciones
app.get('/empresa/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM empresa as e WHERE e.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            if (result.length === 0){
                res.status(500).json({ Data: null, Message: 'Not found' });
            }else{
                let elemento = result[0];
                const queryDos = `SELECT * FROM ubicacion as u WHERE u.ID_empresa = ${id}`;
                db.query(queryDos, (err, result) => {
                    if (err) {
                        res.status(500).json({ Data: err, Message: 'Error' });
                    }else{
                        elemento.ubicaciones = result;
                        res.json({ Data: elemento, Message: 'Success' });
                    }
                });
            }
        }
    });
});

// Actualizacion de detalels de una empresa
app.put('/empresa/:id', (req, res) => {
    const id = req.params.id;
    const objeto = req.body;
    const nombre = objeto.nom_estab;
    const razon = objeto.razon_social;
    const query = `UPDATE empresa AS e SET nom_estab = '${nombre}', razon_social = '${razon}' WHERE e.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error'});
        }else{
            res.json({ Data: result, Message: 'Success'});
        }
    });
});

// Borrar una empresa
app.delete('/empresa/:id', (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM ubicacion as e WHERE e.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error' });
        }else{
            const query = `DELETE FROM empresa as e WHERE e.ID_empresa = ${id}`;
            db.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ Data: err, Message: 'Error' });
                }else{

                    res.json({ Data: result, Message: 'Success' });
                }
            });
        }
    });
});

// Actualizar una ubicacion
app.put('/ubicacion/:id', (req, res) => {
    const id = req.params.id;
    const objeto = req.body;
    const tipo_vial = objeto.tipo_vial;
    const nom_vial = objeto.nom_vial;
    const num_ext = objeto.numero_ext;
    const letra_ext = objeto.letra_ext;
    const nom_CenCom = objeto.nom_CenCom;
    const num_local = objeto.num_local;
    const cod_postal = objeto.cod_postal;
    const entidad = objeto.entidad;
    const municipio = objeto.municipio;
    const localidad = objeto.localidad;
    const latitud = objeto.latitud;
    const longitud = objeto.longitud;
    const query = `UPDATE ubicacion AS u SET tipo_vial = '${tipo_vial}',
                                             nom_vial = '${nom_vial}',
                                             numero_ext = '${num_ext}',
                                             letra_ext = '${letra_ext}',
                                             nom_CenCom = '${nom_CenCom}',
                                             num_local = '${num_local}',
                                             cod_postal = '${cod_postal}',
                                             entidad = '${entidad}',
                                             municipio = '${municipio}',
                                             localidad = '${localidad}',
                                             latitud = ${latitud},
                                             longitud = ${longitud}
                    WHERE u.ID_empresa = ${id}`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ Data: err, Message: 'Error'});
        }else{
            res.json({ Data: result, Message: 'Success'});
        }
    });
});

// Endpoint para login
app.post('/login', (req, res) => {
    const username = req.body.rol;
    const password = req.body.contrasena;
    const query = `SELECT * FROM usuarios AS u WHERE u.rol = '${username}' AND u.contrasena = '${password}'`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({Data: err, Message: 'Error'});
        }else{
            if (result.length === 0){
                res.status(403).json({ Data: null, Message: 'Wrong Credentials' });
            }else {
                res.json({ Data: result, Message: 'Success' });
            }
        }
    });
});


app.listen(port, () => {
   console.log('App escuchando en el puerto 3000');
});
