
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

		it('addAll', function() {
			var g = new Gordon();
			g.addAll('CARE,RACE'.split(','));
			log(g.toDot());
		});

		it('all', function() {
			var g = new Gordon();
			g.addAll('ALL,BALL,CALL'.split(','));
			log(g.toDot());
		});

		it('findWord', function() {
			var g = new Gordon();
			g.addWord('CARE');
			g.addWord('CARD');
			g.addWord('CARED');
			// log(g.toDot());
			g.findWord('CARE').should.be.ok;
			g.findWord('CARD').should.be.ok;
			g.findWord('CARED').should.be.ok;
			g.findWord('CARES').should.not.be.ok;
			g.findWord('CAR').should.not.be.ok;
			g.findWord('CA').should.not.be.ok;
			g.findWord('C').should.not.be.ok;
			g.findWord('CE').should.not.be.ok;


		});

		it('find reversed word', function() {
			var g = new Gordon();
			g.addWord('CARE');
			g.addWord('CARD');
			g.addWord('CARED');
			log(g.toDot());
			g.findWord('ERAC').should.not.be.ok;
			// g.findWord('CARD').should.be.ok;
			// g.findWord('CARED').should.be.ok;
			// g.findWord('CARES').should.not.be.ok;
			// g.findWord('CAR').should.not.be.ok;
			// g.findWord('CA').should.not.be.ok;
			// g.findWord('C').should.not.be.ok;
			// g.findWord('CE').should.not.be.ok;


		});

		it('find only added words', function() {
			var g = new Gordon();
			g.addWord('CARE');
			g.addWord('CARD');
			g.addWord('CARED');
			g.addWord('RACE');
			g.addWord('DARE');
			g.addWord('DID');
			g.addWord('OPIATE');
			g.addWord('OPIATED');
			g.addWord('RINGER');
			g.addWord('OR');
			g.addWord('PI');
			g.addWord('IN');
			g.addWord('AG');
			// g.addWord('TE');
			g.addWord('ER');
			g.addWord('BET');
			g.addWord('ETHER');
			g.addWord('TERM');
			log(g.toDot());
			var allWords = g.allWords();
			log(allWords);
			allWords.should.have.length(17);

			//g.findWord('ERAC').should.not.be.ok;
			// g.findWord('CARD').should.be.ok;
			// g.findWord('CARED').should.be.ok;
			// g.findWord('CARES').should.not.be.ok;
			// g.findWord('CAR').should.not.be.ok;
			// g.findWord('CA').should.not.be.ok;
			// g.findWord('C').should.not.be.ok;
			// g.findWord('CE').should.not.be.ok;


		});

		it.only('test branching', function() {
			var g = new Gordon();
			g.addAll('ALL,BALL'.split(','));
			log(g.toDot());
			log(g.allWords());
			g.findWord('ALBL').should.not.be.ok;
		});

		it('test careen', function() {
			var g = new Gordon();
			g.addAll('CAREEN'.split(','));
			log(g.toDot());
			log(g.allWords());
			g.findWord('CAREEN').should.not.be.ok;
		});
	});

});