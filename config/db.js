import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

pool.query('SELECT NOW()', (err, res) => {
    if(err){
        console.log("Database connection has failed.")
        console.log(err.message)
    } else {
        console.log("Database connection is succefully done.")
    }
})

export default pool 