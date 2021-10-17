import express from 'express';
import pg from 'pg';


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
        console.log(result.rows);
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

app.listen(4000, () => {
  console.log('Server listening on port 4000.');
})