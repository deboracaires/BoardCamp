import express from 'express';
import pg from 'pg';

import { gameSchema } from './gameSchema.js';


const { Pool } = pg;

const connection = new Pool({
  user: 'bootcamp_role',
  host: 'localhost',
  port: 5432, 
  database: 'boardcamp',
  password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp'
});

const app = express();
app.use(express.json());

app.get("/categories", async (req,res) => {
    try {
        const result = await connection.query(`SELECT * FROM categories`);
        res.send(result.rows);
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/categories", async  (req,res) => {
    try {
        const newCategorie = req.body;
        
        if(!newCategorie.name){
            return res.sendStatus(400);
        }

        const verifyCategory = await connection.query('select * from categories where name = $1', [newCategorie.name]);
        
        if(verifyCategory.rows.length > 0){
            return res.sendStatus(409);
        }
        
        await connection.query('INSERT INTO categories (name) VALUES ($1)', [newCategorie.name]);

        res.sendStatus(201);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/games", async (req,res) => {
    try {
        const result = await connection.query(`SELECT * FROM games`);
        res.send(result.rows);
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/games", async (req,res) => {
    try {
        const {
            name,
            image, 
            stockTotal,
            categoryId,
            pricePerDay
        } = req.body;
        
       const error = gameSchema.validate(req.body).error;
       if(error){
           return res.sendStatus(400);
       }

       const verifyCategoryId =  await connection.query('select * from categories where id = $1', [categoryId]);

       if(verifyCategoryId.rows.length === 0){
           return res.sendStatus(400);
       }

       const verifyGame = await connection.query('select * from games where name = $1', [name]);
        
        if(verifyGame.rows.length > 0){
            return res.sendStatus(409);
        }

        await connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)`, [name, image, stockTotal, categoryId, pricePerDay]);

        res.sendStatus(201);


    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});




app.listen(4000, () => {
  console.log('Server listening on port 4000.');
})