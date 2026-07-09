const express = require('express');
const router = express.Router();
const { createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, admin, createEmployee);
  
router.route('/:id')
  .put(protect, admin, updateEmployee)
  .delete(protect, admin, deleteEmployee);

module.exports = router;
