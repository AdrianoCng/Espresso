const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menuItems');

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: menuId}, (err, menu) => {
        if (err) {
            next(err);
        } else if (!menu) {
            res.sendStatus(404);
        } else {
            next();
        };
    });
});


menusRouter.use('/:menuId/menu-items', menuItemRouter);


menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        res.status(200).json({
            menus: menus
        });
    });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    };
    
    db.run(`INSERT INTO Menu (title) VALUES ($title)`, {$title: title}, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
                res.status(201).json({
                    menu: menu
                });
            });
        };
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.Id = $menuId';
    const value = {
        $menuId: req.params.menuId
    };

    db.get(sql, value, (err, menu) => {
        res.status(200).json({
            menu: menu
        });
    });
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    };
    const sql = 'UPDATE Menu SET title = $title';
    const value = {$title: title};

    db.run(sql, value, function(err) {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: req.params.menuId}, (err, menu) => {
                res.status(200).json({
                    menu: menu
                });
            });
        };
    });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const value = {$menuId: req.params.menuId};

    db.get(sql, value, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            res.sendStatus(400);
        } else {
            const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
            const deleteValue = {$menuId: req.params.menuId};

            db.run(deleteSql, deleteValue, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                };
            });
        };
    });
});



module.exports = menusRouter;