if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// mysql://bf9056c3653dfd:f647489f@us-cdbr-east-05.cleardb.net/heroku_49053729671cf50?reconnect=true

module.exports = {
    host: process.env.host || 'us-cdbr-east-05.cleardb.net',
    database: process.env.database || 'heroku_49053729671cf50',
    user: process.env.user || 'bf9056c3653dfd',
    password: process.env.password || 'f647489f'
}