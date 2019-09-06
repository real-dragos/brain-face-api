const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'sqlsucks',
        database: 'smart_brain'
    }
})

const connect = () => db;

const getUserById = (id) => {
    const user = db.select('*')
        .from('users')
        .where({ id: id })
        .then(users => {
            const user = users[0];
            return user;
        })
        .catch(() => {
            return null;
        })
    return user;
}

const incrementEntries = (user) => {
    return db('users')
        .where({ id: user.id })
        .increment('entries', 1)
        .returning('entries');
}

module.exports = {
    getUserById: getUserById,
    connect: connect,
    incrementEntries: incrementEntries
}