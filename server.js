import express from 'express';
//import dotenv from 'dotenv';
import authRouter from './routes/authRouter.js'
import expenceRouter from './routes/expenseRouter.js'

//dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({status: 'The app is runing smoothly'});
})
app.use('/api/users', authRouter)
app.use('/api/expenses', expenceRouter)


app.listen(PORT, () => {
    console.log(`Server is runnig on port`);
})