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
		grid.addWord('opiate', 7, 2, false);
		grid.cell(7, 2).should.be.exactly('o');
		grid.cell(7, 3).should.be.exactly('p');
	});

	it("should be able to tell me if a cell is empty", function() {
		grid.addWord('opiate', 7, 2, false);
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
		grid.addWord('opiate', 7, 2, false);
		grid.prefix(8,2,true).should.be.exactly('o');
		grid.prefix(7,8,false).should.be.exactly('opiate');
		grid.prefix(7,4,false).should.not.be.exactly('op');
		grid.prefix(7,9,false).should.not.be.exactly('opiate');
	});

	it("should be able to get cell suffix", function() {
		grid.addWord('opiate', 7, 2, false);
		grid.suffix(6,2,true).should.be.exactly('o');
		grid.suffix(7,1,false).should.be.exactly('opiate');
		grid.suffix(7,4,false).should.not.be.exactly('op');
		grid.suffix(7,0,false).should.not.be.exactly('opiate');
	});

	describe("validate move", function () {

		beforeEach(function() {
			grid.lexicon = new Gaddag();
			grid.lexicon.addAll(['opiate', 'dirty','dirt','ed','eda','it','re']);
			// log("Gaddag " + gaddag === grid.lexicon);
			// log("Gaddag trie " + gaddag.trie === grid.lexicon.trie)
		});

		it.skip("should score a valid first move", function() {
			grid.validateMove('opiate', 7, 2, false, true).should.be.exactly(22);
		});
		it.skip("should not score an invalid first move", function() {
			grid.validateMove('opiate', 6, 2, false, true).should.be.exactly(-1);
		});
		it.skip("should score a valid second hook move", function() {
			grid.addWord('opiate', 7, 2, false);
			grid.validateMove('dirt', 6, 4, true, false).should.be.exactly(5);
			// grid.addWord('dirt', 6, 4, true);
			// grid.print();

		});
		it("should score a valid second parallel move", function() {
			grid.addWord('opiate', 7, 2, false);
			var word = 'dirt';
			var col = 8;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(9);
			grid.addWord(word, col, row, horizontal);
			grid.print();
		});
		it("should score a middle parallel move", function() {
			grid.addWord('opiate', 7, 2, false);
			grid.addWord('opiate', 9, 4, false);
			// grid.print();
			var word = 'dirt';
			var col = 8;
			var row = 7;
			var horizontal = false;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(15);
			grid.addWord(word, col, row, horizontal);
			grid.print();
		});
	});
});