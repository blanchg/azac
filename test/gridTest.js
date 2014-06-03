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

		it("should score a bonus first move", function() {
			grid.validateMove('OPIATE', 7, 2, false, true, 7).should.be.exactly(72);
		});

		it("should not score an invalid first move", function() {
			grid.validateMove('OPIATE', 6, 2, false, true).should.be.exactly(-1);
		});

		it("should score a valid second hook move", function() {
			grid.addWord('OPIATE', 7, 2, false);
			grid.validateMove('DIRT', 6, 4, true, false).should.be.exactly(5);
			// grid.addWord('DIRT', 6, 4, true);
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
			// grid.print();
		});

		it("should score 32 for the last word here", function () {
// H3 OPIATE 22,
// I3 DID 19,
// 4H PIEING 18,
// 7F RETORTED 63,
// 8K ARECA 32,

			grid.lexicon = new Gaddag();
			grid.lexicon.addAll(['OPIATE', 'DID','PIEING','ARECA','RETORTED','TA','ER','DE']);
			grid.addWord('OPIATE', 7, 2, false);
			grid.addWord('DID', 8, 2, false);
			grid.addWord('PIEING', 7, 3, true);
			grid.addWord('RETORTED', 5, 6, true);
			var word = 'ARECA';
			var col = 10;
			var row = 7;
			var horizontal = true;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(32);
			grid.addWord(word, col, row, horizontal);
			// grid.print();
		});

		it("should not score words that have board letters before them", function() {
// H3 OPIATE 22,
// I3 DID 19,
// 4H PIEING 18,
// 7F RETORTED 63,
// 8K ARECA 32,
// 9K ERE 15,
// 3J OHIA 29
			grid.lexicon = new Gaddag();
			grid.lexicon.addAll(['OPIATE', 'DID','PIEING','ARECA','RETORTED','TA','ER','DE','ERE','OHIA','OE','HI','IN','AG']);
			grid.addWord('OPIATE', 7, 2, false);
			grid.addWord('DID', 8, 2, false);
			grid.addWord('PIEING', 7, 3, true);
			grid.addWord('RETORTED', 5, 6, true);
			grid.addWord('ARECA', 10, 7, true);
			grid.addWord('ERE', 10, 8, true);
			var word = 'OHIA';
			var col = 9;
			var row = 2;
			var horizontal = true;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
			grid.addWord(word, col, row, horizontal);
			// grid.print();
		});

		it("should only play letters that are avaliable", function() {
// H3 OPIATE 22,
// I3 DID 19,
// 4H PIEING 18,
// 7F RETORTED 63,
// 8K ARECA 32,
// 9K ERE 15,
// G1 FOH 24,
// 1G FIZ 45,
// 8A UNEASE 23
			grid.lexicon = new Gaddag();
			grid.lexicon.addAll(['OPIATE', 'DID','PIEING','ARECA','RETORTED','TA','ER','DE','ERE','OHIA','OE','HI','IN','AG','FOH','FIZ','UNEASE']);
			grid.addWord('OPIATE', 7, 2, false);
			grid.addWord('DID', 8, 2, false);
			grid.addWord('PIEING', 7, 3, true);
			grid.addWord('RETORTED', 5, 6, true);
			grid.addWord('ARECA', 10, 7, true);
			grid.addWord('ERE', 10, 8, true);
			grid.addWord('FOH', 6, 0, false);
			grid.addWord('FIZ', 6, 0, true);
			var word = 'UNEASE';
			var col = 0;
			var row = 7;
			var horizontal = true;
			// grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
			grid.addWord(word, col, row, horizontal);
			grid.print();

		});

		it("should not play words not in lex", function() {
//    012345678901234
//    ABCDEFGHIJKLMNO
//0  1|T··d···T··MERIT|
//1  2|·D···tGANJA·AY·|
//2  3|··D···dDUOTONE·|
//3  4|d··D·S·V·GEM··d|
//4  5|····PI·a··R····|
//5  6|OUTFOX·N·HI·Vt·|
//6  7|··dID·dCdAE·O·e|
//7  8|T··NE··E··LAW·Q|
//8  9|··COSIEST··BE·U|
//9 10|·t··Tt···t·ELtA|
//0 11|···HARL···DL··T|
//1 12|d·KA···d·R·I··E|
//2 13|··ER··d·WIZARDS|
//3 14|·INDIGO·EF·N·D·|
//4 15|T·OY··PUB··d··T|
// E:
// H2 ADVaNCE 82,
// 2G GANJA 29,
// 9C COSIEST 77,
// K1 MATERIEL 70,
// E5 PODESTA 40,
// L8 ABELIAN 73,
// F4 SIX 55,
// 13I WIZARD 46,
// 3H DUOTONE 30,
// 14I EF 31,
// 15G PUB 29,
// 4J GEM 31,
// 1K MERIT 24,
// M6 VOWEL 26,
// 2M AY 22,		

			grid.lexicon = new Gaddag();
			grid.lexicon.addAll(['ADVANCE', 'GANJA','COSIEST','MATERIEL','PODESTA','ABELIAN','SIX','WIZARD','DUOTONE','EF','PUB','GEM','MERIT','VOWEL','AY','RAN']);
			grid.addWord('ADVaNCE', 7, 2, false);
			grid.addWord('GANJA', 6, 1, true);
			grid.addWord('COSIEST', 2, 8, true);
			grid.addWord('MATERIEL', 10, 0, false);
			grid.addWord('PODESTA', 4, 4, false);
			grid.addWord('ABELIAN', 11, 7, false);
			grid.addWord('SIX', 5, 3, false);
			grid.addWord('WIZARD', 8, 12, true);
			grid.addWord('DUOTONE', 7, 2, true);
			grid.addWord('EF', 8, 13, true);
			grid.addWord('PUB', 6, 14, true);
			grid.addWord('GEM', 9, 3, true);
			grid.addWord('MERIT', 10, 0, true);
			grid.addWord('VOWEL', 2, 5, false);
			var word = 'AY';
			var col = 12;
			var row = 1;
			var horizontal = true;
			grid.validateMove(word, col, row, horizontal).should.be.exactly(-1);
			grid.addWord(word, col, row, horizontal);
			grid.print();

		});
	});
});