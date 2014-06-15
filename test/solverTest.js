// require('../index.js');
// var fs = require('fs');
// var path = require('path');
var log = require('../util.js').log;
var Solver = require('../solver.js');
var Gordon = require('../gordon.js');
var should = require("should");

var solver;
describe('Solver', function() {

	beforeEach(function() {
		solver = new Solver();
	});

	describe('rackMinus', function() {
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

	describe('gaddag algorithm', function() {
		it('should not find crop', function() {
			solver.lexicon = new Gordon();
			solver.lexicon.addWord('CROP');
			// solver.lexicon.addWord('ROPE');
			solver.lexicon.addWord('OPIATE');
			// solver.lexicon.addWord('COPIATE');
			// solver.lexicon.addWord('CROPS');
			// solver.lexicon.addAll(["CROP", "CROPLAND", "CROPLANDS", "CROPLESS", "CROPPED", "CROPPER", "CROPPERS", "CROPPIE", "CROPPIES", "CROPPING", "CROPS"]);
			solver.grid.lexicon = solver.lexicon;
			// solver.grid.addWord('OPIATE', 2, 7, true);
			// solver.grid.print();
			// log(solver.lexicon.cs.join(','));
			// log(solver.lexicon.toDot());
			// return;
			var A = Solver.prototype.Anchor;

			// FIRST WORD
			var anchor = new A(2,7,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'OPIATE'.split(''), solver.lexicon.initialArc(), true);
			solver.results.should.have.length(1);
			solver.grid.addWord('OPIATE', 2, 7, true);

			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(2,7,true);
		    solver.gen(anchor, 0, "", 'CROP'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(0);
			// solver.grid.print();
		});		

		it('should find copiate', function() {
			solver.lexicon = new Gordon();
			solver.lexicon.addWord('CROP');
			// solver.lexicon.addWord('ROPE');
			solver.lexicon.addWord('OPIATE');
			solver.lexicon.addWord('COPIATE');
			// solver.lexicon.addWord('CROPS');
			// solver.lexicon.addAll(["CROP", "CROPLAND", "CROPLANDS", "CROPLESS", "CROPPED", "CROPPER", "CROPPERS", "CROPPIE", "CROPPIES", "CROPPING", "CROPS"]);
			solver.grid.lexicon = solver.lexicon;
			// solver.grid.addWord('OPIATE', 2, 7, true);
			// solver.grid.print();
			// log(solver.lexicon.cs.join(','));
			// log(solver.lexicon.toDot());
			// return;
			var A = Solver.prototype.Anchor;

			// FIRST WORD
			var anchor = new A(2,7,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'OPIATE'.split(''), solver.lexicon.initialArc(), true);
			solver.results.should.have.length(1);
			solver.grid.addWord('OPIATE', 2, 7, true);

			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(2,7,true);
		    solver.gen(anchor, 0, "", 'CROP'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(1);
			// solver.grid.print();
		});

		it.only('should not find ringer', function() {
// 8C OPIATE 22,
// I6 DID 16,
// 9C RINGER 26
			solver.lexicon = new Gordon();
			solver.lexicon.addWord('DID');
			solver.lexicon.addWord('OPIATE');
			solver.lexicon.addWord('OPIATED');
			solver.lexicon.addWord('RINGER');
			solver.grid.lexicon = solver.lexicon;
			// log(solver.lexicon.cs.join(','));
			// log(solver.lexicon.toDot());
			// return;
			var A = Solver.prototype.Anchor;
			log('first');
			// FIRST WORD
			var anchor = new A(2,7,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'OPIATE'.split(''), solver.lexicon.initialArc(), true);
			solver.results.should.have.length(1);
			var r = solver.results[0]
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

			log('second');
			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(8, 7,false);
		    solver.gen(anchor, 0, "", 'DID'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(1);
			r = solver.results[0]
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

			log('third');
			// THIRD WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(2,8,true);
		    solver.gen(anchor, 0, "", 'RINGER'.split(''), solver.lexicon.initialArc(), false);
			log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(0);
			// solver.grid.addWord('RINGER', 5, 8, false);
		});
	});

});