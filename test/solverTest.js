// require('../index.js');
// var fs = require('fs');
// var path = require('path');
var log = require('../util.js').log;
var Solver = require('../solver.js');
var should = require("should");

var solver;
describe('Solver', function() {

	beforeEach(function() {
		solver = new Solver();
	});

	describe('reduceRack', function() {

		it('should allow reducing the rack', function() {
			var rack = 'E?AVCDN'.split('');
			var word = 'ADVaNCE';
			var hook = ''.split('');
			var replacements = 'a'.split('');
			var debug = true;
			var newRack = solver.reduceRack(rack, word, hook, debug, replacements);
			log("Rack after: " + newRack);
			newRack.should.have.length(0);
		});

		it('should allow lowcase hook', function() {
			var rack = 'E?AVCDN'.split('');
			var word = 'ADVaNCE';
			var hook = '???A???'.split('');
			var replacements = 'a'.split('');
			var debug = true;
			var newRack = solver.reduceRack(rack, word, hook, debug, replacements);
			log("Rack after: " + newRack);
			newRack.should.have.length(1);
		});

		it('should ganja', function() {
			var rack = 'GTIEANJ'.split('');
			var word = 'GANJA';
			var hook = '?A???????'.split('');
			var replacements = ''.split('');
			var debug = true;
			var newRack = solver.reduceRack(rack, word, hook, debug, replacements);
			log("Rack after: " + newRack);
			(newRack === null).should.be.false;
			newRack.should
				.containDeep(['T', 'I', 'E'])
				.and.have.length(3);
		});

	});

});