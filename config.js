const commentJson = require('comment-json')

const path = require('path')
const rootDir = path.dirname(process.execPath)

const fs = require('fs')

const configFile = 'config.json'

const defaultConfig = {

	"// username": [["// add Vader Streams IPTV username (between quotes)"]],
	"username": "",

	"// password": [["// add Vader Streams IPTV password (between quotes)"]],
	"password": ""

}

const readConfig = () => {

	const configFilePath = path.join(rootDir, configFile)

	if (fs.existsSync(configFilePath)) {

		var config

		try {
			config = fs.readFileSync(configFilePath)
		} catch(e) {
			// ignore read file issues
			return defaultConfig
		}

		return commentJson.parse(config.toString())
	} else {

		const configString = commentJson.stringify(defaultConfig, null, 4)

		try {
			fs.writeFileSync(configFilePath, configString)
		} catch(e) {
			// ignore write file issues
			return defaultConfig
		}

		console.log('Created "config.json" in the same folder. Please edit this file and add Vader Streams IPTV user and password then run this application again.')

		process.exit()

		return readConfig()
	}

}

module.exports = readConfig()
