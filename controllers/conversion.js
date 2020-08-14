const User = require("../models").User;
const Conversion = require("../models").Conversion;
const Sequelize = require('sequelize');

exports.index = (req, res) => {
	let limit = 10;
	return Conversion.findAndCountAll({
    	limit,
		offset: (parseInt(req.query.page) - 1 || 0)* limit,
      	order: [
            ['createdAt', 'DESC' ]
        ],
        distinct: true,
        include: [User]
	}).then((data) => {
	  	pages = Math.ceil(data.count / limit);
	  	let conversions = data.rows;
	    return res.status(200).json({ success: true, conversions, count: data.count, pages, current_page: parseInt(req.query.page)});
	}).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
}

exports.show = (req, res) => {
	Conversion.findOne({ 
            where: { id: req.params.id },
            include: [User]
        })
		.then(conversion => res.json({ success: true, message: 'conversion found successfully!', conversion }))
		.catch(errors => res.status(404).json({ success: false, message: 'conversion not found!', errors }))
}

exports.delete = (req, res) => {
	Conversion.findOne({ 
            where: { id: req.params.id }
        })
		.then(conversion => {
			// conversion.destroy({ paranoid: true });
			conversion.destroy()
				.then(() => res.json({ success: true, message: 'conversion deleted successfully!' }))
				.catch(errors => res.status(500).json({ success: false, message: 'delete failed!', errors }))
		})
		.catch(errors => res.status(404).json({ success: false, message: 'conversion not found!', errors }))
}

exports.conversionsOfYear = (req, res) => {
	return Conversion.findAll({
    	where: {
    		createdAt: {
	            $gte: req.params.year + '-01-01 00:00:00',
	            $lt: parseInt(req.params.year) + 1 + '-01-01 00:00:00'
	        }
    	}
	}).then(conversions => {
	  	return res.status(200).json({ success: true, conversions});
	}).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
}
