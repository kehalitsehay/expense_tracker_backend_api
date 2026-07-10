import pool from '../config/db.js'
export const allowedCategories = [
    "Groceries",
    "Leisure",
    "Electronics",
    "Utilities",
    "Clothing",
    "Health",
    "Others"
];

export const createExpense = async (req, res) => {
    const { amount, category, descriptions, expense_date } = req.body;
    const userId = req.user.userId; 

    if (!amount || !category) {
        return res.status(400).json({ error: "Amount and category are required fields." });
    }

    try {
        const userQuery = await pool.query('SELECT monthly_budget FROM users WHERE id = $1', [userId]);
        const budget = Number(userQuery.rows[0].monthly_budget);

        const currentMonthSum = await pool.query(
            `SELECT SUM(amount) as total FROM expenses 
             WHERE user_id = $1 
             AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
            [userId]
        );
        
        const accumulatedSpending = Number(currentMonthSum.rows[0].total || 0);
        const projectedTotal = accumulatedSpending + Number(amount);

        if (projectedTotal >= budget) {
            return res.status(400).json({error: `🚨 Budget Exceeded! You have run out of your monthly budget limit.`});
        }
        const values = [userId, amount, category, descriptions, expense_date || null];
        const newExpense = await pool.query(
            `INSERT INTO expenses (user_id, amount, category, descriptions, expense_date)
             VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
             RETURNING *`, 
            values
        );

        // Construct response dynamically with proactive warnings
        let warningMessage = null;
        const usagePercentage = (projectedTotal / budget) * 100;

        if (usagePercentage >= 80) {
            warningMessage = `⚠️ Budget Warning! You have consumed ${usagePercentage.toFixed(0)}% of your monthly budget allowance.`;
        }

        res.status(201).json({
            status: "Expense added successfully",
            warning: warningMessage, 
            expense: newExpense.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllExpenses = async (req, res) => {
    const userId = req.user.userId;
    const { category, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Convert query string numbers into real JavaScript Integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Date validations
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ error: "Invalid date range. The endDate cannot be earlier than the startDate." });
    }
    if (endDate && new Date(endDate) > new Date()) {
        return res.status(400).json({ error: "Invalid date. The endDate cannot be greater than the current day." });
    }

    try {
        let queryText = 'SELECT * FROM expenses WHERE user_id = $1';
        const queryParams = [userId];
        let paramCounter = 2;

        if (category) {
            queryText += ` AND category = $${paramCounter}`;
            queryParams.push(category);
            paramCounter++;
        }
        if (startDate) {
            queryText += ` AND expense_date >= $${paramCounter}`;
            queryParams.push(startDate);
            paramCounter++;
        }
        if (endDate) {
            queryText += ` AND expense_date <= $${paramCounter}`;
            queryParams.push(endDate);
            paramCounter++;
        }

        // --- pagination  ---
        queryText += ` ORDER BY expense_date DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        queryParams.push(limitNum, offset);

        const expenses = await pool.query(queryText, queryParams);
        
        // Count total matching rows for accurate meta-insights in client layout architectures
        let countQueryText = 'SELECT COUNT(*) FROM expenses WHERE user_id = $1';
        const countParams = [userId];
        let cCounter = 2;
        if (category) { countQueryText += ` AND category = $${cCounter}`; countParams.push(category); cCounter++; }
        if (startDate) { countQueryText += ` AND expense_date >= $${cCounter}`; countParams.push(startDate); cCounter++; }
        if (endDate) { countQueryText += ` AND expense_date <= $${cCounter}`; countParams.push(endDate); cCounter++; }
        
        const countResult = await pool.query(countQueryText, countParams);
        const totalItems = parseInt(countResult.rows[0].count);

        res.status(200).json({
            meta: {
                total_records: totalItems,
                current_page: pageNum,
                limit: limitNum,
                total_pages: Math.ceil(totalItems / limitNum)
            },
            data: expenses.rows
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getExpenseById = async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId

    try{
        const expence = await pool.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
        if(expence.rows.length === 0){
            return res.status(404).json({error: "Expense not found or unauthorized access."})
        }
        res.status(200).json(expence.rows[0])
    } catch(error){
        res.status(500).json({error: error.message})
    }

}

export const deleteExpense = async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId
    try{
        const result = await pool.query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId])
        if(result.rows.length === 0) {
            return res.status(404).json({error: "No expense found with this id"})
        }
        res.status(200).json({
            status: "Expense deleted succesfully",
            expence: result.rows[0]
        })
    }catch(error){
        res.status(500).json({error:error.message})
    }
} 

export const updateExpense = async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId
    const { amount, category, descriptions, expense_date } = req.body

    try{
        const checkExpense = await pool.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2', [id, userId])
        if(checkExpense.rows.length === 0) {
            return res.status(404).json({error: "No expense found with this id."})
        }
        const update = await pool.query(
            `UPDATE expenses 
             SET amount = COALESCE($1, amount), 
                 category = COALESCE($2, category), 
                 descriptions = COALESCE($3, descriptions), 
                 expense_date = COALESCE($4, expense_date)
             WHERE id = $5 AND user_id = $6
             RETURNING *`,
            [amount, category, descriptions, expense_date, id, userId]
        );
        res.status(200).json({
            status: "Expense updated succeffully",
            expense: update.rows[0]

        })      
    }catch(error){
        res.status(500).json({error: error.message})
    }
}


export const getExpenseTotal = async (req, res) => {
    const userId = req.user.userId;
    const { category, startDate, endDate } = req.query;


    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ error: "Invalid date range. The endDate cannot be earlier than the startDate." });
    }
    if (endDate && new Date(endDate) > new Date()) {
        return res.status(400).json({ error: "Invalid date. The endDate cannot be greater than the current day." });
    }

    try {
        let queryText = 'SELECT SUM(amount) as total FROM expenses WHERE user_id = $1';
        const queryParams = [userId];
        let paramCounter = 2;

        if (category) {
            queryText += ` AND category = $${paramCounter}`;
            queryParams.push(category);
            paramCounter++;
        }
        if (startDate) {
            queryText += ` AND expense_date >= $${paramCounter}`;
            queryParams.push(startDate);
            paramCounter++;
        }
        if (endDate) {
            queryText += ` AND expense_date <= $${paramCounter}`;
            queryParams.push(endDate);
            paramCounter++;
        }

        const result = await pool.query(queryText, queryParams);
        
        const totalSum = result.rows[0].total || 0;

        res.status(200).json({
            status: "Total calculated successfully",
            total: Number(totalSum)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};