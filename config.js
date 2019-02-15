const commentJson = require('comment-json')

const path = require('path')
const rootDir = path.dirname(process.execPath)

const fs = require('fs')

const configFile = 'config.json'

const defaultConfig = {

	"// username": [["// add Vader Streams IPTV username (between quotes)"]],
	"username": "",

	"// password": [["// add Vader Streams IPTV password (between quotes)"]],
	"password": "",

	"// addonPort": [["// port to use for stremio add-on, default is 7010"]],
	"addonPort": 7025,

	"// autoLaunch": [["// if this is set to true, the add-on will run on system start-up"]],
	"autoLaunch": false,

	"// remote": [["// make add-on available remotely too, through LAN and the Internet"]],
	"remote": false,

	"// subdomain": [["// set the preferred subdomain (if available), only applicable if remote is set to true"]],
	"subdomain": false

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
