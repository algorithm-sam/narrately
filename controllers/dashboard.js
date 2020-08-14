const axios = require('axios');
const mkdirp = require('mkdirp-promise')
// const textToSpeech = require('@google-cloud/text-to-speech');

const User = require("../models").User;
const Conversion = require("../models").Conversion;
const Sequelize = require('sequelize')

const slugify = require("../helpers").slugify;

const convert_limit = 2;
const char_limit = 1000;

var fs = require('fs');


function createAudio( userId, title, content, language, voiceType, speed, folder, filePath ) {

	let data = {
	  "audioConfig": {
	    "audioEncoding": "LINEAR16",
	    "pitch": "0.00",
	    "speakingRate": speed
	  },
	  "input": {
	    "text": content
	  },
	  "voice": {
	    "languageCode": language,
	    "name": voiceType
	  }
	}
	return axios.post("https://texttospeech.googleapis.com/v1/text:synthesize?fields=audioContent&key=" + process.env.TTS_API_KEY, data)
		.then(response =>
		  	// write dat baoss (an encoded string) response into an mp3 file
		  	mkdirp(folder).then(() => {
				new Promise(function(resolve, reject) {
			  		fs.writeFileSync(filePath, response.data.audioContent, 'base64', function(err) { 
			  			if (err) reject(err);
		        		else resolve(filePath);
		        	})
			  	})
			}).catch(err => Promise.reject(err))
		)
		.catch(err => Promise.reject(err))
}

function getQuota(UserId) {
	let date = new Date();
	date.setDate(date.getDate() - (date.getDay()));
	date.setHours(0,0,0,0);
	return Conversion.findAll({ 
		where: { 
			UserId,
			createdAt: {
			    $gte: date
			}
		} 
	})
		.then(conversions => {
			let converts = conversions.length;
			let conversions_left = (convert_limit - converts) > 0 ? (convert_limit - converts) : 0;
			let date = new Date();
			date.setDate(date.getDate() - (date.getDate() - 1));
			date.setHours(0,0,0,0);
			return Conversion.findAll({ 
					where: { 
						UserId,
						createdAt: {
						    $gte: date
						}
					} 
				}).then(conversions => {
					let characters = 0;
					conversions.map(conversion => characters += conversion.content.length);
					let characters_left = (char_limit - characters) > 0 ? (char_limit - characters) : 0;
					let quota = { conversions: conversions_left, characters: characters_left }
					return { conversions, date, characters, converts, quota };
				}).catch(err => Promise.reject(err));
		})
		.catch(err => Promise.reject(err))
}

exports.index = (req, res) => {
	return axios.get("https://texttospeech.googleapis.com/v1/voices?key=" + process.env.TTS_API_KEY)
		.then(response => res.status(200).json({ success: true, voices: response.data.voices}))
		.catch(err => res.status(404).json({ success: false, err, message: "An error occured while loading voices list!"}))
}

exports.generate = (req, res) => {
	let { title, content, language, voiceType, speed, gender } = req.body;
	if(!req.decoded.isActive){
		return res.status(403).json({ success: false, error, message: "Please activate your account to countinue!"});
	}
	return getQuota(req.decoded.id)
		.then(({ characters, converts, quota }) => {
			if ((characters >= char_limit) ||( converts >= convert_limit)) {
				return res.status(403).json({ success: false, message: "quota limit exceeded!"})
			}
			content = content.substring(0, quota.characters)

			let folder = `./public/audio/user-${req.decoded.id}/`;
			let now = Date.now();
			let new_title = slugify(title);
			let filePath = `./public/audio/user-${req.decoded.id}/${now}-${new_title}.mp3`;
			let url = `/audio/user-${req.decoded.id}/${now}-${new_title}.mp3`;

			createAudio(req.decoded.id, title, content, language, voiceType, speed, folder, filePath).then(data =>
				Conversion.create({title, content, UserId: req.decoded.id, languageCode: language, voiceType, speed, ssmlGender: gender, downloadUrl: url })
					.then(conversion => {
						let conversions_left = (convert_limit - 1 - converts) > 0 ? (convert_limit - 1 - converts) : 0;
						let characters_left = (char_limit - content.length - characters) > 0 ? (char_limit - content.length -characters) : 0;
						let quota = { conversions: conversions_left, characters: characters_left }
						return res.status(200).json({ success: true, conversion, quota })
					})
					.catch(error => res.status(404).json({ success: true, error}))
			).catch(error => res.status(500).json({ success: false, error, message: "An error occured with file coversion!"}))
		})
		.catch(error => res.status(500).json({ success: false, error, message: "An error occured with database query!"}))
}

exports.quota = (req, res) => {
	return getQuota(req.decoded.id)
		.then(result => {
			return res.status(200).json({ success: true, ...result})
		})
		.catch(error => res.status(500).json({ success: false, error, message: "An error occured with database query!"}))
}

exports.stats = (req, res) => {

	return User.findAll({
    	where: {
    		createdAt: {
	            $gte: (new Date).getFullYear() + '-01-01 00:00:00',
	            $lt: (new Date).getFullYear() + 1 + '-01-01 00:00:00'
	        }
    	}
	}).then(users => {
	  	return Conversion.findAll({
	    	where: {
	    		createdAt: {
		            $gte: (new Date).getFullYear() + '-01-01 00:00:00',
		            $lt: (new Date).getFullYear() + 1 + '-01-01 00:00:00'
		        }
	    	}
		}).then(conversions => {
		  	return res.status(200).json({ success: true, conversions, users});
		}).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
	}).catch(errors => res.status(500).json({ success: false, message: 'Internal server error!', errors }))
}
