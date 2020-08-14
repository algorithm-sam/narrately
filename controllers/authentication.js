const User = require("../models").User;
const Conversion = require("../models").Conversion;
const MailSubscription = require("../models").MailSubscription;
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const mails = require('../helpers/mails');
const slugify = require("../helpers").slugify;


function generateToken(user, remember_me = false) {
	user = (({id, email, isActive, isAdmin}) => ({id, email, isActive, isAdmin}))(user);
	let token_payload = {
		user, expiresIn: remember_me ? '168h':'12h' 
	}
	return { 
		token: jwt.sign(token_payload, process.env.APP_KEY ), 
		expiration: Date.now() + (remember_me ? 168 : 4 ) * 60 * 60 * 1000
	};
}

exports.register = (req, res) => {
	const { body } =  req;
	user = User.build({ 
		email: body.email.toLowerCase(),
		password: bcrypt.hashSync(body.password, 8),
		name: body.name,
		username: body.username,
		isActive: false,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		activationToken: slugify(body.username + Date.now() + bcrypt.hashSync(body.username, 8).substring(10, 20))
	});

	mails.welcome(user)
		.then(data => console.log(data))
		.catch(err => console.log(err))

	user.save()
		.then(user => {
			user = user.toJson();
			user.Conversions = [];
			let token = generateToken(user); 
			return res.status(200).json({ success: true, message: 'Registration successful!', user, token });
		})
		.catch(errors => res.status(500).json({ success: false, message: 'Registration failed!', user, errors }))
}

exports.login = (req, res) => {
	User.scope('withPassword').findOne({ 
		where: { email: req.body.email.toLowerCase()},  
		include: [Conversion, MailSubscription],
		order: [
            [Conversion, 'createdAt', 'DESC' ]
        ]
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'Invalid login credentials.' });
		    } else if (user) {
		    	bcrypt.compare(req.body.password, user.password, function(errors, response) {

		    		if(errors || !response) return res.status(403).json({ success: false, message: 'Invalid login credentials.', errors });

		    		if(user.isBanned) return res.status(403).json({ success: false, message: 'This user is currently banned.' });
		    		
		    		user = user.toJson();
				    // if user is found and password is right create a token
				    let token = generateToken(user, req.body.remember_me);

				    // return the information including token as JSON
				    res.status(200).json({ success: true, message: 'Login successful!', token, user });
				});
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

const providers = {
    facebook: 'https://graph.facebook.com/me?fields=first_name,last_name,name,picture,email&access_token=',
    google: 'https://www.googleapis.com/oauth2/v3/userinfo?access_token='
};

exports.oauth = (req, res) => {
	axios.get(providers[req.body.provider] + req.body.token)
		.then(({data}) => {
			if(!data.email) return res.status(403).json({ success: false, message: 'Authentication failed.' });
			User.findOne({
				where: { email: data.email }, 
				include: [Conversion, MailSubscription],
				order: [
                    [Conversion, 'createdAt', 'DESC' ]
                ]
			})
				.then( user => {
					if (user) {
						if(user.isBanned) return res.status(403).json({ success: false, message: 'This user is currently banned.' });
						user = user.toJson();
						let token = generateToken(user);
						return res.json({ token, user, message: "Authentication successful.", created: false})
					}
					user = User.create({ 
						name: data.name,
						email: data.email.toLowerCase(), 
						username: data.email.split("@")[0] + Date.now(), 
						password: bcrypt.hashSync(Date.now().toString(), 8),
						isActive: false,
						createdAt: Date.now(),
						updatedAt: Date.now(),
						activationToken: data.email.split("@")[0] + Date.now() + Date.now() + bcrypt.hashSync(username, 8).substring(10, 20)
					}).then(user => {
							mails.welcome(user)
								.then(data => console.log(data))
								.catch(err => console.log(err))
							user = user.toJson();
							user.Conversions = [];
							let token = generateToken(user); 
							return res.json({ success: true, message: 'Authentication successful!', user, token });
						})
						.catch(err => res.status(404).json({ success: false, message: 'Authentication failed.', user, errors: err.errors }))
				}).catch(error => res.status(500).json({ success: false, message: 'Authentication failed.', error, data }))
						
		})
		.catch(error => res.status(500).json({ success: false, message: 'Authentication failed.' }))
}

exports.user = (req, res) => {
	return res.status(200).json({ success: true, user: req.decoded.toJson()})
}

exports.activate = (req, res) => {
	User.findOne({ 
		where: { activationToken: req.params.activationToken}
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User with token not found!' });
		    } else if (user) {
		    	user.isActive = true;
		    	user.activationToken = '';
		    	user.save()
		    		.then(() => res.status(200).json({ success: true, message: 'User activated successful!', user}))
		    		.catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }))
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

exports.activate = (req, res) => {
	User.findOne({ 
		where: { activationToken: req.params.activationToken}
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User with token not found!' });
		    } else if (user) {
		    	user.isActive = true;
		    	user.activationToken = '';
		    	user.save()
		    		.then(() => res.status(200).json({ success: true, message: 'User activated successful!', user}))
		    		.catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }))
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

exports.resendActivationToken = (req, res) => {
	User.findOne({ 
		where: { email: req.body.email}
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User not found!' });
		    } else if (user.isActive) {
		    	return res.status(200).json({ success: true, message: 'User has been activated already!', user});
		  	} else {
		  		mails.welcome(user)
					.then(data => res.status(200).json({ success: true, message: 'Activation mail has been resent successfully!', user}))
					.catch(errors => res.status(500).json({ success: false, message: 'An error occured while sending mail!', errors }));
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

exports.passwordReset = (req, res) => {
	User.findOne({ 
		where: { email: req.body.email}
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User not found!' });
		    } else {
				let token_payload = {
					date: Date.now(),
					expiresIn: '1h' 
				}
				console.log(jwt.sign( token_payload, process.env.APP_KEY ))
		    	user.passwordResetToken = jwt.sign( token_payload, process.env.APP_KEY );

		    	user.save().then(() => {
		    		mails.resetPassword(user)
						.then(data => res.status(200).json({ success: true, message: 'Activation mail has been resent successfully!'}))
						.catch(errors => res.status(500).json({ success: false, message: 'An error occured while sending mail!', errors }))
		    	}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

exports.passwordResetHandle = (req, res) => {
	User.findOne({ 
		where: { passwordResetToken: req.params.passwordResetToken }
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User not found!' });
		    } else {
				jwt.verify(req.params.passwordResetToken, process.env.APP_KEY, function(err, token_payload) {
		            if (err) {
		                return res.status(401).send({ 
		                    success: false, 
		                    message: 'Token has expired!',
		                    err
		                });
		            } else {
		                user.password = bcrypt.hashSync(req.body.password, 8);
		                user.passwordResetToken = '';
		                user.save()
		                	.then(() => res.status(200).json({ success: true, message: 'User password changed successful!', user}))
		    				.catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }))
		            }
		        });
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

