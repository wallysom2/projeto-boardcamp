import express from 'express';
import cors from 'cors';
import db from './database';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';

dayjs.locale('pt-br');
const server = express();
server.use(express.json());
server.use(cors());

server.get('/categories', async (req, res) => {
    const categories = await db.query('SELECT * FROM categories');
    res.send(categories.rows).sendStatus(200);
})

server.post('/categories', async (req, res) => {
    const name = req.body.name;
    try {
        if (name.length === 0) {
            return res.sendStatus(400);
        }

        const duplicateCheck = await db.query('SELECT * FROM categories WHERE name = $1', [name]);
        if(duplicateCheck.rows.length !== 0) {
            return res.sendStatus(409);
        }

        await db.query('INSERT INTO categories (name) values ($1)', [name]);
        res.sendStatus(201);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

server.get('/games', async (req, res) => {
    let queryString ='%';
    if (req.query.name !== undefined) {
        queryString = req.query.name;
    }

    try {   
            const games = await db.query(`
                SELECT 
                    games.*, 
                    categories.name AS "categoryName" 
                FROM games 
                JOIN categories 
                    ON categories.id = games."categoryId" 
                WHERE LOWER(games.name) LIKE LOWER( $1 || '%')
            `,[queryString]);
            
            res.send(games.rows).status(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})