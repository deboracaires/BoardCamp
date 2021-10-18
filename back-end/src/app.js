import express from 'express';
import pg from 'pg';
import dayjs from 'dayjs';

import { gameSchema } from './gameSchema.js';
import { clientSchema } from './clientSchema.js';


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

app.get("/customers", async (req,res) => {
    try {
        const result = await connection.query(`SELECT * FROM customers`);
        res.send(result.rows);
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/customers/:id", async (req,res) => {
    try {
        const result = await connection.query(`SELECT * FROM customers WHERE  id = $1`, [req.params.id]);
        
        if(result.rows.length > 0){
            res.send(result.rows);
        }else{
            res.sendStatus(404);
        }
        
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/customers", async (req,res) => {
    try {
        const {
            name,
            phone,
            cpf, 
            birthday
        } = req.body;
        
       const error = clientSchema.validate(req.body).error;
       if(error){
           return res.sendStatus(400);
       }


       const verifyCpf = await connection.query('select * from customers where cpf = $1', [cpf]);
        
        if(verifyCpf.rows.length > 0){
            return res.sendStatus(409);
        }

        await connection.query(`INSERT INTO customers(name, phone, "cpf", "birthday") VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday]);

        res.sendStatus(201);


    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.put("/customers/:id", async (req,res) => {
    try {

        const {
            name,
            phone,
            cpf, 
            birthday
        } = req.body;

        const result = await connection.query(`SELECT * FROM customers WHERE  id = $1`, [req.params.id]);
        
        if(result.rows.length > 0){
            
            const error = clientSchema.validate(req.body).error;
            if(error){
                return res.sendStatus(400);
            }

            const verifyCpf = await connection.query('select * from customers where cpf = $1', [cpf]);
        
            if(verifyCpf.rows.id !== req.params.id && verifyCpf.rows.length > 0){
                return res.sendStatus(409);
            }

            await connection.query(`UPDATE customers SET name = $2, phone = $3, cpf = $4, birthday = $5 WHERE id = $1`, [req.params.id, name, phone, cpf, birthday]);

            res.sendStatus(200);



        }else{
            res.sendStatus(404);
        }
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/rentals", async (req,res) => {
    try {
        const result = await connection.query(`SELECT * FROM rentals`);
        res.send(result.rows);
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/rentals", async (req,res) => {
    try {
        const {
            customerId,
            gameId,
            daysRented
        } = req.body;
        
        const verifyCostumer= await connection.query('select * from customers where id = $1', [customerId]);
        
        
        if(verifyCostumer.rows.length === 0){
            return res.sendStatus(400);
        }

        const verifyGame = await connection.query('select * from games where id = $1', [gameId]);

        
        if(verifyGame.rows.length === 0 || verifyGame.rows === null){
            return res.sendStatus(400);
        }
        

        if(daysRented <= 0){
            return res.sendStatus(400);
        }

        // verificação se ainda há unidades para serem locadas

        // fim disso aqui

        const rentDate = dayjs().format('DD/MM/YYYY');
        const originalPrice = Number(daysRented) * Number(verifyGame.rows[0].pricePerDay);
        
        await connection.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)`, [customerId, gameId, rentDate, daysRented, null, originalPrice, null]);

        res.sendStatus(201);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});


app.post("/rentals/:id/return", async (req,res) => {
    try {
         
        const verifyRental= await connection.query('select * from rentals where id = $1', [req.params.id]);
        
        
        if(verifyRental.rows.length === 0){
            return res.sendStatus(404);
        }

        if(verifyRental.rows[0].returnDate !== null){
            return res.sendStatus(400);
        }

        const returnDate = dayjs().format('YYYY-MM-DD');
        const daysRented = verifyRental.rows[0].daysRented;
        const rentDate = verifyRental.rows[0].rentDate;
        
        const verifyDate = dayjs(rentDate).add(daysRented, 'day').format('YYYY-MM-DD');
        
        const final = new Date(returnDate);
        const verify = new Date(verifyDate);

        const diferenceInDays = (Math.abs(final - verify)/(1000*60*60*24));
        
        let delayFee = 0;

        if(verifyDate < Math.abs(final - verify)){
            
            delayFee = diferenceInDays * (verifyRental.rows[0].originalPrice / daysRented);

        }else{
            delayFee = null;
        }
        
        await connection.query(`UPDATE rentals SET "returnDate" = $2, "delayFee" = $3 WHERE id = $1`, [req.params.id, returnDate, delayFee]);

        res.sendStatus(200);

        
        

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.delete("/rentals/:id", async (req,res) => {
    try {
        const result = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [req.params.id]);
        
        if(result.rows.length === 0){
            return res.sendStatus(404);
        }
        if(result.rows.length > 0 && result.rows[0].returnDate !== null){
            return res.sendStatus(400);
        }
        
        await connection.query(`DELETE FROM rentals WHERE id = $1`, [req.params.id]);

        res.sendStatus(200);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(4000, () => {
  console.log('Server listening on port 4000.');
})