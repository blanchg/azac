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

	describe.only('rackMinus', function() {
		it('Should remove letter at start', function() {
			solver.rackMinus('abc'.split(''), 'a').should.eql('bc'.split(''));
		});
		it('Should remove letter at end', function() {
			solver.rackMinus('abc'.split(''), 'c').should.eql('ab'.split(''));
		});
		it('Should remove letter in middle', function() {
			solver.rackMinus('abc'.split(''), 'b').should.eql('ac'.split(''));
		});
		it('Should remove single duplicate letter at start', function() {
			solver.rackMinus('aac'.split(''), 'a').should.eql('ac'.split(''));
		});
	});

	describe('permutations', function() {
		it('Should return all permutations of ab', function () {
			var ab = solver.permutations('ab');
			// ab.next().should.eql([]);
			ab.next().should.eql(['a']);
			ab.next().should.eql(['b']);
			ab.next().should.eql(['a','b']);
			ab.next().should.eql(['b','a']);
			(ab.next() === undefined).should.be.true;
			// while((result = ab.next()) !== undefined) {
			// 	log(result);
			// }
		});
		it('Should return all permutations of abcd', function () {
			var ab = solver.permutations('abcd');
			// ab.next().should.eql([]);
			// ab.next().should.eql(['a']);
			// ab.next().should.eql(['b']);
			// ab.next().should.eql(['a','b']);
			// ab.next().should.eql(['b','a']);
			// (ab.next() === undefined).should.be.true;
			while((result = ab.next()) !== undefined) {
				log('\t\t[' + result.map(function(x){return '"'+x+'"'}).join(',') + '];');
			}
		});
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