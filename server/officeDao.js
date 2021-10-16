" use strict ";

const dayjs = require('dayjs');
const db = require('./db');

/* Deprecated
//get services
exports.getServicesAll = async () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT services FROM management';
        db.all(sql, [], function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            if (rows !== undefined) {
                resolve(rows);
            }
            else {
                resolve(null);
            }
        });
    });
};
*/

//get next ticket number
exports.getNextNumber = async () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT max (number) as newTicket FROM tickets WHERE date = ?';
        db.all(sql, [dayjs().format('YYYY-MM-DD')], function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            if (rows !== undefined) {
                const number = rows[0].newTicket + 1;
                resolve(number);
            }
            else {
                resolve(1);
            }
        });
    });
};

//get all tickets in queue for each service type
exports.getTickets = async () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT number, service FROM tickets WHERE date = ? AND counter IS NULL';
        db.all(sql, [dayjs().format('YYYY-MM-DD')], function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            if (rows !== undefined) {
                const tickets = {};
                rows.map(x => {
                    if(!tickets[x.service]) tickets[x.service] = [];
                    tickets[x.service].push(x.number);
                });
                resolve(tickets);
            }
            else {
                resolve(1);
            }
        });
    });
};

//get the current served tickets for each service type
exports.getLastTickets = async () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT service, counter, MAX(number) AS servingTicket FROM tickets WHERE date = ? AND counter IS NOT NULL GROUP BY service';
        db.all(sql, [dayjs().format('YYYY-MM-DD')], function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            if (rows !== undefined) {
                const tickets = {};
                rows.map((x, i) => tickets[x.service] = {counter: x.counter, ticket: x.servingTicket});
                resolve(tickets);
            }
            else {
                resolve(1);
            }
        });
    });
};

// insert a new ticket
exports.addTicket = async (ticket) => {
    try {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO tickets(number, date, service, counter) VALUES (?, ?, ?, ?)';
            db.run(sql, [ticket.number, dayjs().format('YYYY-MM-DD'), ticket.service, null], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(ticket.number);
            });
        });
    } catch (err) {
        return;
    }
};

// get all counters
exports.getCounterInfo = () => {
    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM management WHERE services!=?';
        db.all(sql, ["null"], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const tasks = rows.map((t) => ({ id: t.id, username: t.username, services: t.services }));
            resolve(tasks);
        });
    });
};



// get all counters for a counter
exports.getServices = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM services';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const tasks = rows.map((t) => ({ service: t.serviceName, extimatedTime: t.extimatedTime }));
            resolve(tasks);
        });
    });
};

exports.updateCounter = (c) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE management SET services = ? WHERE username = ?"
        db.run(sql, [c.services ,c.username], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    })
  }