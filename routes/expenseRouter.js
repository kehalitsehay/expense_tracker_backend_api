import { Router } from 'express'
import { authenticatedToken } from '../src/database/middleware/authMiddleware.js'
import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseTotal } from '../controlles/expenseController.js'

const router = Router()
router.use(authenticatedToken)

router.post('/', createExpense)
router.get('/', getAllExpenses)
router.get('/:id', getExpenseById)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)
router.get('/total/sum', getExpenseTotal)


export default router