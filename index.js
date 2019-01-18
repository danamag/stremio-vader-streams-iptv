
const needle = require('needle')
const async = require('async')
const addonSDK = require('stremio-addon-sdk')

let loginExpire = 0

const config = require('./config')

const username = config.username
const password = config.password

if (!username || !password) {
	console.log('Username or password unavailable. Please edit "config.json" (in the same folder) and add Vader Streams IPTV user and password then run this application again.')
	process.exit()
}

let categories = []
const catalogs = []
const channels = {}
const channelMap = {}
const metas = {}
let token = btoa(JSON.stringify({ username, password }))

function btoa(str) {
	var buffer;

	if (str instanceof Buffer) {
		buffer = str
	} else {
		buffer = Buffer.from(str.toString(), 'binary')
	}

	return buffer.toString('base64');
}

function getTimestamp() { return Math.floor(Date.now() / 1000) }

function expired(cb) { cb(!(loginExpire > getTimestamp())) }

function isLogedIn(cb) {
	expired(isExpired => {
		if (isExpired) {
			needle.get('http://vapi.vaders.tv/users/me?token=' + token, (err, resp, body) => {
				if (body && body.message) {
					console.log(body.message)
					process.exit()
				} else if (err) {
					console.log(err && err.message ? err.message : 'Unknown error occurred.')
					process.exit()
				} else {
					// login success
					cb(body.categories)
				}
			})
		} else
			cb()
	})
}

function request(url, cb) {
	isLogedIn(() => { needle.get(url, cb) })
}

function toMeta(chan) {
	if (chan.programs) {

		if (chan.programs[0])
			chan.description = 'Currently playing: ' + chan.programs[0].title + '<br/>' + chan.programs[0].desc

		delete chan.programs
	}

	if (chan.resolution)
		delete chan.resolution

	chan.id = 'vaders_' + chan.channel_id + '_' + chan.id
	chan.name = chan.stream_display_name
	delete chan.stream_display_name
	chan.poster = chan.stream_icon
	chan.logo = chan.poster
	delete chan.stream_icon
	chan.posterShape = 'landscape'
	chan.type = 'tv'

	return chan
}

function runAddon() {

	const addon = new addonSDK({
		id: 'org.vaderstv',
		version: '1.0.0',
		name: 'Vader Streams IPTV',
		description: 'IPTV Service - Requires Subscription',
		resources: ['stream', 'meta', 'catalog'],
		types: ['tv'],
		idPrefixes: ['vaders_'],
		icon: 'https://vaderstreams.ca/wp-content/uploads/2018/08/download.png',
		catalogs
	})

	addon.defineCatalogHandler((args, cb) => {
		if (args.type == 'tv' && args.id) {
			if (args.extra && args.extra.search) {
				const results = []
				channels[args.id].forEach(chan => {
					if (chan.name.toLowerCase().includes(args.extra.search.toLowerCase()))
						results.push(chan)
				})

				cb(null, results.length ? { metas: results } : null)
			} else
				cb(null, channels[args.id] ? { metas: channels[args.id] } : null)
		} else
			cb(null, null)
	})

	addon.defineMetaHandler((args, cb) => {
		if (args.id) {
			const startTS = new Date(Date.now()).toISOString().split('.')[0].replace(/[^0-9.]/g, "")
			const stopTS = new Date(Date.now() + 10800000).toISOString().split('.')[0].replace(/[^0-9.]/g, "")
			const channelId = args.id.split('_')[1]
			if (channelId)
				request('http://vapi.vaders.tv/epg/channels/'+channelId+'?token='+token+'&start='+startTS+'&stop='+stopTS, (err, resp, body) => {
					if (body) {
						if (body[0] && body[0].id)
							cb(null, { meta: toMeta(body[0]) })
						else if (body.id)
							cb(null, { meta: toMeta(body) })
						else
							cb(null, null)
					} else
						cb(null, null)
				})
			else {

				let meta

				for (let key in channels) {
					if (!meta)
						channels[key].some(chan => {
							if (chan.id == args.id) {
								meta = chan
								return true
							}
						})
				}

				cb(null, meta ? { meta } : null)

			}
		} else
			cb(null, null)
	})

	addon.defineStreamHandler((args, cb) => {
		if (args.id) {
			let streamId = args.id.split('_')
			streamId = streamId[streamId.length-1]
			cb(null, { streams: [{ title: 'Play Now', url: 'http://vapi.vaders.tv/play/' + streamId + '.m3u8?token=' + token }] })
		} else
			cb(null, null)
	})

	addon.runHTTPWithOptions({ port: 7025 })

}

console.log('Loading Add-on. Please Wait.')

isLogedIn(cats => {
	if (cats && cats.length) {
		categories = cats
		const qu = async.queue((cat, cb) => {
			if (cat && cat.id && cat.id > 1) {
				request('http://vapi.vaders.tv/epg/channels?token=' + token + '&category_id=' + cat.id, (err, resp, body) => {
					if (body && Array.isArray(body) && body.length) {
						channels[cat.name] = body.map(toMeta)
						catalogs.push({
							type: 'tv',
							id: cat.name,
							name: cat.name,
							extraSupported: ['search']
						})
						cb()
					} else {
						// ignore channel errors for now
						cb()
					}
				})
			} else
				cb()
		}, 1)
		qu.drain = runAddon
		categories.forEach(cat => { qu.push(cat) })
	} else {
		console.log('No stream categories available')
		process.exit()
	}
})
