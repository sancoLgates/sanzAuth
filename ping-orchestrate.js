var oio = require('orchestrate')
var client = oio('d95a89d7-abef-4332-9ad1-c5d6d1025f6d', "api.ctl-sg1-a.orchestrate.io")

client.ping()
	.fail(function (err) {
	console.log('Invalid API Key or API unreachable')
	});