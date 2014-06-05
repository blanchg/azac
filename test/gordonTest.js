
var log = require('../util.js').log;
var Gordon = require('../gordon.js');
var should = require("should");

describe.only('Gordon', function() {

	describe('Paper', function() {

		it('CARE', function() {
			var g = new Gordon();
			g.add('CARE');
			log('Gordon: ' + g);
		});
	});

});