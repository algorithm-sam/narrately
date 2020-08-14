const User = require("../models").User;
const Conversion = require("../models").Conversion;
const MailSubscription = require("../models").MailSubscription;
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize')

exports.index = (req, res) => {
	let limit = 10;
	return User.findAndCountAll({
    	limit,
		offset: (parseInt(req.query.page) - 1 || 0)* limit,
      	order: [
            ['name', 'ASC'],
            [ Conversion, 'createdAt', 'DESC' ]
        ],
        distinct: true,
        include: [Conversion]
	}).then((data) => {
	  	pages = Math.ceil(data.count / limit);
	  	let users = data.rows;
	    return res.status(200).json({ success: true, users, count: data.count, pages, current_page: parseInt(req.query.page)});
	}).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
}

exports.show = (req, res) => {
	User.findOne({ 
            where: { id: req.params.id },
            include: [Conversion, MailSubscription]
        })
		.then(user => res.json({ success: true, message: 'user found successfully!', user }))
		.catch(errors => res.status(404).json({ success: false, message: 'user not found!', errors }))
}

exports.update = (req, res) => {
	const { username, name } = req.body
	User.update(
		{ username, name },
		{ where: {id: req.decoded.id} }
	)
	.then(user => {
		User.findOne({ 
            where: { id: req.decoded.id },
            include: [Conversion, MailSubscription]
        }).then(user => res.json({ success: true, message: 'update successful!', user: user.toJson() }))
        .catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
		
	})
	.catch(errors => res.status(500).json({ success: false, message: 'update failed!', errors }))
}

exports.delete = (req, res) => {
	User.findOne({ 
            where: { id: req.params.id },
            include: [Conversion, MailSubscription],
        })
		.then(user => {
			// user.destroy({ paranoid: true });
			if ((user.isAdmin || user.isSuperAdmin) && !req.decoded.isSuperAdmin) {
				return res.status(403).json({ success: false, message: 'Super admin privilleges needed to delete this user!', errors })
			}
			user.destroy()
				.then(() => res.json({ success: true, message: 'user deleted successfully!' }))
				.catch(errors => res.status(500).json({ success: false, message: 'delete failed!', errors }))
		})
		.catch(errors => res.status(404).json({ success: false, message: 'user not found!', errors }))
}

exports.toggleBan = (req, res) => {
	User.findOne({ 
            where: { id: req.params.id },
            include: [Conversion, MailSubscription],
        })
		.then(user => {
			user.isBanned = !user.isBanned;
			user.save()
				.then((user) => res.json({ success: true, message: 'user deleted successfully!', user }))
				.catch(errors => res.status(500).json({ success: false, message: 'delete failed!', errors }))
		})
		.catch(errors => res.status(404).json({ success: false, message: 'user not found!', errors }))
}

exports.password = (req, res) => {
	let user = req.decoded;
	bcrypt.compare(req.body.old_password, user.password, function(errors, response) {
		if(errors || !response) return res.status(404).json({ success: false, message: 'incorrect old password.', errors});
		user.password = bcrypt.hashSync(req.body.password, 8);
		user.save()
			.then(user => res.json({ success: true, message: 'password changed successful!' }))
			.catch(errors => res.status(500).json({ success: false, message: 'An error occured while updating!', error }))
	});
}

exports.avatar = (req, res) => {
	let user = req.decoded;
	let avatar = `images/uploads/${req.file.filename}`;
	user.avatar = avatar;
	user.save()
		.then(user => res.json({ success: true, message: 'avatar changed successful!', avatar }))
		.catch(errors => res.status(500).json({ success: false, message: 'An error occured while uploading!', error }))
}

exports.subcribe = (req, res) => {
	
}

exports.usersOfYear = (req, res) => {
	return User.findAll({
    	where: {
    		createdAt: {
	            $gte: req.params.year + '-01-01 00:00:00',
	            $lt: parseInt(req.params.year) + 1 + '-01-01 00:00:00'
	        }
    	}
	}).then(users => {
	  	return res.status(200).json({ success: true, users});
	}).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
}
