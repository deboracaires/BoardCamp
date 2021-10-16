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
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});
// app.get('/api/products', (req, res) => {
//   console.log(connection)
//   connection.query('SELECT * FROM produtos').then(produtos => {
//     res.send(produtos.rows);
//   });
// });

// app.get('/api/products/:id', (req, res) => {
//   const id = parseInt(req.params.id);

//   if (isNaN(id)) {
//     return res.sendStatus(400);
//   }

//   connection.query('SELECT * FROM produtos WHERE id = $1;', [id]).then(result => {
//     res.send(result.rows[0]);

//   })
// });

// app.post('/api/products', (req, res) => {
//   const { nome, preco, condicao } = req.body;
  
//   connection.query('INSERT INTO produtos (nome, preco, condicao) VALUES ($1, $2, $3);', [nome, preco, condicao ])
//     .then(result => {
//       res.sendStatus(201);
//     });
// });

app.listen(4000, () => {
  console.log('Server listening on port 4000.');
})