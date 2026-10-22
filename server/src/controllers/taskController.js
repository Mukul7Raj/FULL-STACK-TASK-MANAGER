const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// @route   GET /api/tasks
// @desc    Get all tasks for current authenticated user with optional filter & search
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, search } = req.query;

    let queryText = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    if (status === 'completed') {
      queryText += ` AND is_completed = TRUE`;
    } else if (status === 'pending') {
      queryText += ` AND is_completed = FALSE`;
    }

    if (priority && ['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      queryText += ` AND priority = $${paramIndex}`;
      queryParams.push(priority.toLowerCase());
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await db.query(queryText, queryParams);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        tasks: result.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/tasks/stats
// @desc    Get summary statistics for dashboard
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_completed = TRUE) as completed,
        COUNT(*) FILTER (WHERE is_completed = FALSE) as pending,
        COUNT(*) FILTER (WHERE priority = 'high' AND is_completed = FALSE) as high_priority
      FROM tasks
      WHERE user_id = $1
    `;

    const result = await db.query(statsQuery, [userId]);
    const row = result.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        total: parseInt(row.total || 0, 10),
        completed: parseInt(row.completed || 0, 10),
        pending: parseInt(row.pending || 0, 10),
        highPriority: parseInt(row.high_priority || 0, 10)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/tasks
// @desc    Create a new task
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, priority = 'medium', due_date = null } = req.body;

    const result = await db.query(
      `INSERT INTO tasks (user_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title.trim(), description ? description.trim() : null, priority, due_date || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: {
        task: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update a task (title, description, priority, is_completed, due_date)
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { title, description, priority, is_completed, due_date } = req.body;

    // Check ownership first
    const existing = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (existing.rows.length === 0) {
      return next(new AppError('Task not found or unauthorized to edit', 404));
    }

    const current = existing.rows[0];

    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedDescription = description !== undefined ? description : current.description;
    const updatedPriority = priority !== undefined ? priority : current.priority;
    const updatedStatus = is_completed !== undefined ? is_completed : current.is_completed;
    const updatedDueDate = due_date !== undefined ? due_date : current.due_date;

    const result = await db.query(
      `UPDATE tasks
       SET title = $1, description = $2, priority = $3, is_completed = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [updatedTitle, updatedDescription, updatedPriority, updatedStatus, updatedDueDate, taskId, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: {
        task: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [taskId, userId]);

    if (result.rows.length === 0) {
      return next(new AppError('Task not found or unauthorized to delete', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: {
        id: parseInt(taskId, 10)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask
};
