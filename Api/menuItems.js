const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const value = {$menuItemId: menuItemId};

    db.get(sql, value, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (!menuItem) {
            res.sendStatus(404);
        } else {
            next();
        };
    });
});

menuItemRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const value = {$menuId: req.params.menuId};

    db.all(sql, value, (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({
                menuItems: menuItems
            });
        };
    });
});

menuItemRouter.post('/', (req, res, next) => {
    const {name, description, inventory, price} = req.body.menuItem;
    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    };
    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: this.lastID}, (err, menuItem) => {
                res.status(201).json({
                    menuItem: menuItem
                });
            });
        };
    });
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
    const {name, description, inventory, price} = req.body.menuItem;
    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    };
    const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: req.params.menuItemId}, (err, menuItem) => {
                res.status(200).json({
                    menuItem: menuItem
                });
            });
        };
    });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';

    db.run(sql, {$menuItemId: req.params.menuItemId}, (err) => {
        res.sendStatus(204);
    });
});


module.exports = menuItemRouter;