const User = require("../models").User;
const Conversion = require("../models").Conversion;
const MailSubscription = require("../models").MailSubscription;

exports.add = (req, res) => {
	User.findOne({ 
		where: { id: req.params.id}
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User not found!' });
		    } else if (user) {
		    	user.isAdmin = true;
		    	user.save()
		    		.then(() => res.status(200).json({ success: true, message: 'Admin created successful!', user}))
		    		.catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }))
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}

exports.remove = (req, res) => {
	User.findOne({ 
		where: { id: req.params.id}
    })
		.then((user) => {
		    if (!user) {
		      res.status(404).json({ success: false, message: 'User with token not found!' });
		    } else if (user) {
		    	user.isAdmin = false;
		    	user.save()
		    		.then(() => res.status(200).json({ success: true, message: 'Admin removed successful!', user}))
		    		.catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }))
		  	}
		}).catch(errors => res.status(500).json({ success: false, message: 'An error occured!', errors }));
}