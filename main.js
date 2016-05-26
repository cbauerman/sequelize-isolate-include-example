var Sequelize = require('sequelize');
var Promise = require('bluebird');

var sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    logging: function() {},

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    // SQLite only
    storage: 'test_ database.sqlite'
});

var User = sequelize.define('user', {
    name: { type: Sequelize.STRING, allowNull: false },
});

var Group = sequelize.define('group', {
    groupName: { type: Sequelize.STRING, allowNull: false },
});

var Budget = sequelize.define('budget', {
    balance: { type: Sequelize.FLOAT, allowNull: false },
});

User.belongsTo(Group, { as: 'group' });
Budget.belongsTo(Group, { as: 'group' });
Group.hasMany(User, { as: 'users' });
Group.hasOne(Budget, { as: 'budget' });

sequelize.sync({ force: true }).then(function () {

    return Promise.join(
        Group.create({
            groupName: 'Group A',
            users: [
                { name: 'Alice' },
                { name: 'Bob' }
            ],
            budget: {
                balance: 34.58
            }
        }, {
            include: [
                {
                    model: User,
                    as: 'users'
                },
                {
                    model: Budget,
                    as: 'budget'
                }
            ]
            }),
        Group.create({
            groupName: 'Group B',
            users: [
                { name: 'Hannah' },
                { name: 'Ed' }
            ],
        }, {
            include: [
                {
                    model: User,
                    as: 'users',
                }
            ]
        })
    );

}).then(function () {

    return User.findAll({
        include: [
            {
                model: Group,
                as: 'group',
                required: false,
                include: [
                    {
                        model: Budget,
                        as: 'budget',
                        required: true,
                    }
                ]
            }
        ]
    }).then(function (users) {

        users.forEach(function (user) {

            console.log("User: " + user.name);
            if (user.group !== undefined) {
                console.log("   Group: " + user.group.groupName);
                console.log("   Budget: " + user.group.budget.balance);
                
            }

        });

    });

});