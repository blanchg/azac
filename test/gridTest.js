var assert = require("assert");
var should = require("should");
var Grid = require('../grid.js').Grid;
var Gaddag = require('../gaddag.js').Gaddag;

describe("Grid", function() {
	var grid = null;
	beforeEach(function () {
 		grid = new Grid(15);
	});

	it("should have size of 15", function() {
		grid.size.should.be.exactly(15);
	});

	it("should allow adding a word", function() {
		grid.addWord('OPIATE', 7, 2, false);
		grid.cell(7, 2).should.be.exactly('O');
		grid.cell(7, 3).should.be.exactly('P');
	});

	it("should be able to tell me if a cell is empty", function() {
		grid.addWord('OPIATE', 7, 2, false);
		// Triple word empty
		grid.cellEmpty(7,0).should.be.true;
		// empty
		grid.cellEmpty(7,1).should.be.true;
		// letter
		grid.cellEmpty(7,2).should.be.false;
		// letter
		grid.cellEmpty(7,3).should.be.false;
	});

	it("should be able to get cell prefix", function() {
		grid.addWord('OPIATE', 7, 2, false);
		grid.prefix(8,2,true).should.be.exactly('O');
		grid.prefix(7,8,false).should.be.exactly('OPIATE');
		grid.prefix(7,4,false).should.not.be.exactly('OP');
		grid.prefix(7,9,false).should.not.be.exactly('OPIATE');
	});

	it("should be able to get cell suffix", function() {
		grid.addWord('OPIATE', 7, 2, false);
		grid.suffix(6,2,true).should.be.exactly('O');
		grid.suffix(7,1,false).should.be.exactly('OPIATE');
		grid.suffix(7,4,false).should.not.be.exactly('OP');
		grid.suffix(7,0,false).should.not.be.exactly('OPIATE');
	});

	describe("validate move", function () {

		beforeEach(function() {
			grid.lexicon = new Gaddag();
			grid.lexicon.addAll(['OPIATE', 'DIRTY','DIRT','ED','EDA','IT','RE']);
			// log("Gaddag " + gaddag === grid.lexicon);
			// log("Gaddag trie " + gaddag.trie === grid.lexicon.trie)
		});

		it("should score a valid first move", function() {
			grid.validateMove('OPIATE', 7, 2, false, true).should.be.exactly(22);
		});

		it("should not score an invalid first move", function() {
			grid.validateMove('OPIATE', 6, 2, false, true).should.be.exactly(-1);
		});

		it("should score a valid second hook move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			grid.validateMove('DIRT', 6, 4, true, false).should.be.exactly(5);
			// grid.addWord('dirt', 6, 4, true);
			// grid.print();

		});

		it("should score a valid second parallel move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			var word = 'DIRT';
			var col = 8;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(9);
			grid.addWord(word, col, row, horizontal);
			// grid.print();
		});

		it("should not score an invalid second parallel move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			var word = 'DIRT';
			var col = 8;
			var row = 6;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
		});

		it("should score a middle parallel move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			grid.addWord('OPIATE', 9, 4, false);
			// grid.print();
			var word = 'DIRT';
			var col = 8;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(15);
			grid.addWord(word, col, row, horizontal);
			// grid.print();
		});

		it("should not score an invalid second parallel move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			var word = 'DIRT';
			var col = 9;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
		});

		it("should score using lowercase as wildcard letters", function() {
			grid.addWord('OPIATE', 7, 2, false);
			var word = 'DiRT';
			var col = 8;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(7);
			grid.addWord(word, col, row, horizontal);
		});

		it("should score using lowercase as wildcard letters in an alt word", function() {
			grid.addWord('OPIATE', 7, 2, false);
			var word = 'dIRT';
			var col = 8;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(5);
			grid.addWord(word, col, row, horizontal);
		});
// |T  d   T   d  T|
// | D   t   t   D |
// |  D   dOG   D  |
// |d  D   PO  D  d|
// |    D  IRID    |
// | t   t AEt   t |
// |  d   dTD   d  |
// |T  d   E   d  T|
// |  d   d d   d  |
// | t   t   t   t |
// |    D     D    |
// |d  D   d   D  d|
// |  D   d d   D  |
// | D   t   t   D |
// |T  d   T   d  T|

		it("should not score an invalid third parallel move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			grid.addWord('IRID', 7, 4, true);
			var word = 'GORED';
			var col = 8;
			var row = 2;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
			grid.addWord(word, col, row, horizontal);
			// grid.print();
		});

		it("should not score no letters used", function() {
			grid.addWord('OPIATE', 7, 2, false);
			var word = 'OPIATE';
			var col = 7;
			var row = 2;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
			grid.addWord(word, col, row, horizontal);
			grid.print();
		});


	});
});