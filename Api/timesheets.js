const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '/.database.sqlite');

const timesheetsRouter = express.Router({mergeParams: true});

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${id}`, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (!timesheet) {
            res.sendStatus(404)
        } else {
            next();
        };
    });
});

timesheetsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`;

    db.all(sql, (err, timesheets) => {
        res.status(200).json({
            timesheets: timesheets
        });
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const {hours, rate, date} = req.body.timesheet;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
    const value = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    };

    db.run(sql, value, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err, timesheet) => {
                res.status(201).json({
                    timesheet: timesheet
                });
            });
        };
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const {hours, rate, date} = req.body.timesheet;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    };
    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.employee_id = $employeeId';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err, timesheet) => {
                res.status(200).json({
                    timesheet: timesheet
                });
            });
        };
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, function(err) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        };
    });
});




module.exports = timesheetsRouter;