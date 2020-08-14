const jwt = require('jsonwebtoken');
const User = require("../models").User;
const Conversion = require("../models").Conversion;
const MailSubscription = require("../models").MailSubscription;

module.exports = (req, res, next) => {

    // check header or url parameters or post parameters for token
    var token = req.body['x-access-token'] || req.query['x-access-token'] || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, process.env.APP_KEY, function(err, decoded) {
            if (err) {
                return res.status(401).send({ 
                    success: false, 
                    message: 'Failed to authenticate token.',
                    status: 'failed',
                    err
                });
            } else {
                User.findOne({ 
                    where: { id: decoded.user.id },
                    include: [ Conversion, MailSubscription ],
                    order: [
                        [ Conversion, 'createdAt', 'DESC' ]
                    ]
                }).then(user => {
                    req.decoded = user;
                    next();
                }).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
            }
        });
    } else {
        // if there is no token, return an error
        return res.status(401).send({
            success: false,
            message: 'No token provided.',
            status: 'failed'
        });
    }
};
