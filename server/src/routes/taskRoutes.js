const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Protect all task endpoints with JWT auth
router.use(authenticateToken);

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .isString(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  validate
];

const updateTaskValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid task ID is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('is_completed')
    .optional()
    .isBoolean()
    .withMessage('is_completed must be a boolean value'),
  validate
];

const taskIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid task ID is required'),
  validate
];

router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.post('/', createTaskValidation, taskController.createTask);
router.put('/:id', updateTaskValidation, taskController.updateTask);
router.delete('/:id', taskIdValidation, taskController.deleteTask);

module.exports = router;
