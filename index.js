const m3u = require('m3u8-reader')
const needle = require('needle')
const async = require('async')
const base64 = require('base-64')

const m3uArray = [
	'./playlists/playlist.m3u',
]

let idx = 0

const groupItems = {

}

const defaults = require('./config.js')

if (defaults.connLimit)
	defaults.description += ' Limited to ' + defaults.connLimit + ' connections.'


m3uArray.forEach(el => {
	let data = require('fs').readFileSync(require('path').resolve(el))
	data = Buffer.isBuffer(data) ? data.toString() : data
	let lastName = false
	let lastGroup = false
	data.split('\r\n').forEach(line => {
		if (lastName) {
			if (lastGroup && line.startsWith('http')) {
				if (!groupItems[lastGroup]) {
					groupItems[lastGroup] = { id: defaults.prefix + idx, name: lastGroup, items: [] }
					idx++
				}
				groupItems[lastGroup].items.push({ title: lastName, url: line })
			}
			lastName = false
		}
		if (line.includes('group-title="')) {
			let matches = line.match(/group-title=\"[^\"]+\"/gm)
			if ((matches || []).length) {
				const groupName = matches[0].replace('group-title="', '').replace('"', '')
				const nameParts = line.split(',')
				lastName = nameParts[nameParts.length -1]
				lastGroup = groupName
			}
		}
	})
})

const catalogs = []

const { addonBuilder } = require('stremio-addon-sdk')

if (!catalogs.length)
	catalogs.push({
		id: defaults.prefix + 'cat',
		name: defaults.name,
		type: 'tv',
//		extra: [{ name: 'search' }]
	})

const types = ['tv']

types.push('channel')

const builder = new addonBuilder({
	id: 'org.' + defaults.name.toLowerCase().replace(/[^a-z]+/g,''),
	version: '1.0.1',
	name: defaults.name,
	description: defaults.description,
	resources: ['stream', 'meta', 'catalog'],
	types,
	idPrefixes: [defaults.prefix],
	icon: defaults.icon,
	catalogs
})

builder.defineCatalogHandler(args => {
	const metas = []
	for (let key in groupItems) {
		metas.push({
			name: groupItems[key].name,
			id: groupItems[key].id,
			type: 'channel',
			posterShape: 'landscape'
		})
	}
	return Promise.resolve({ metas })
})

builder.defineMetaHandler(args => {
	return new Promise((resolve, reject) => {
		let thisGroup
		for (let key in groupItems) {
			if (groupItems[key].id == args.id) {
				thisGroup = groupItems[key]
			}
		}
		const meta = {
			name: thisGroup.name,
			id: thisGroup.id,
			type: 'channel',
			posterShape: 'landscape',
		}
		if (defaults.connLimit)
			meta.description = 'Limited to ' + defaults.connLimit + ' connections.'
		const i = args.id.replace(defaults.prefix, '')
		meta.videos = thisGroup.items.map((el, ij) => {
			return {
				id: defaults.prefix + 'stream_' + i + '_' + ij,
				title: el.title
			}
		})
		resolve({ meta })
	})
})

builder.defineStreamHandler(args => {
	return new Promise(async (resolve, reject) => {
		const parts = args.id.split(defaults.prefix + 'stream_')[1]
		const groupId = parts.split('_')[0]
		const urlId = parts.split('_')[1]
		let thisGroup
		for (let key in groupItems) {
			if (groupItems[key].id == defaults.prefix + groupId) {
				thisGroup = groupItems[key]
			}
		}
		resolve({ streams: [thisGroup.items[urlId]] })
	})
})

module.exports = builder.getInterface()
