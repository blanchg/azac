
var log = require('../util.js').log;
var Gordon = require('../gordon.js');
var should = require("should");
var JSONR = require('../jsonr.js');

describe('Gordon', function() {

	describe('Paper', function() {

		it('CARE', function() {
			var g = new Gordon();
			g.addWord('CARE');
			g.addWord('CARD');
			g.addWord('CARED');
			// log('Gordon: ' + g);
		});

		it('walk', function() {

			var g = new Gordon();
			g.addWord('CARE');
			g.addWord('RACE');
			g.addWord('DARE');
			g.addWord('CARD');
			g.addWord('CARED');
			// log(g);
			// log('Result: ' + JSONR.stringify(g.initial['A'].state['C'].state['>'].state['R'].state['>'].getWords('CAR', true), null, 2));
			// getWords('CAR', true)
			log(g.toDot());
		});

		it.only('addAll', function() {

			var g = new Gordon();
			g.addAll('CARE,RACE'.split(','));
			log(g.toDot());
		});
	});

});