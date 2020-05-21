const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const values = { $employeeId: employeeId};
    db.get(sql, values, (err, employee) => {
        if (err) {
            next(err);
        } else if (!employee) {
            return res.sendStatus(404);
        } else {
            next();
        };
    });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        res.status(200).json({
            employees: employees
        });
    });
});

employeesRouter.post('/', function(req, res, next) {
    const {name, position, wage} = req.body.employee;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage || !isCurrentEmployee) {
        return res.sendStatus(400);
    };
    const postSql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const postValues = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };
    db.run(postSql, postValues, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, function(err, employee) {
                res.status(201).json({
                    employee: employee
                });
            });
        };
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    const getEmployeeById = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const getEmployeeByIdValues = { $employeeId: req.params.employeeId};

    db.get(getEmployeeById, getEmployeeByIdValues, (err, employee) => {
        res.status(200).json({
            employee: employee
        });
    });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const {name, position, wage} = req.body.employee;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage || !isCurrentEmployee) {
        return res.sendStatus(400);
    };
    const updateSql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $Id';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $Id: req.params.employeeId
    };
    
    db.run(updateSql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, function(err, employeeUpdated) {
                res.status(200).json({
                    employee: employeeUpdated
                });
            });
        };
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sql = 'UPDATE Employee SET is_current_employee = "0" WHERE Employee.id = $id';
    const value = {
        $id: req.params.employeeId
    };
    db.run(sql,value, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({
                    employee: employee
                });
            });
        };
    });
});


module.exports = employeesRouter;