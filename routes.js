var routes = require('./routes/index');
var users = require('./routes/users');
var cards = require('./routes/cards');

module.exports = function(app){
    app.use('/', routes);
    app.use('/users', users);
    app.use('/cards', cards);

};
