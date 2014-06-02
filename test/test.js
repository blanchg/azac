var assert = require("assert");
var should = require("should");
var log = require("../util.js").log;

var Gaddag = require('../gaddag.js').Gaddag;
var Trie = require('../trie.js').Trie;


// console.log(JSON.stringify(gaddag.getTrie(), null, 2));

describe('Gaddag', function() {
	var gaddag = null;

	beforeEach(function() {
		gaddag = new Gaddag();

		gaddag.add('BAT');
		gaddag.add('BLA');
		gaddag.add('BATIN');
		gaddag.add('BATING');
	});

	it('should allow multiple instances', function() {
		// var t = new Trie();
		var gd2 = new Gaddag();
		// log('gaddag ' + gaddag.getTrie());
		// log('gd2    ' + gd2.getTrie());
		gaddag.getTrie().should.not.be.exactly(gd2.getTrie());
		gd2.findWord('BAT').should.be.false;
		gaddag.findWord('BAT').should.be.true;
	});

	it('find word', function() {
		gaddag.findWord('BATING').should.be.ok;
		gaddag.findWord('BATIN').should.be.ok;
		gaddag.findWord('BATI').should.not.be.ok;
		gaddag.findWord('BAT').should.be.ok;
		gaddag.findWord('BLAH').should.not.be.ok;
		gaddag.findWord('B').should.not.be.ok;
		gaddag.findWord('BLA').should.be.ok;
	});

	it('find hook sequence', function() {
		gaddag.findWordsWithRackAndHook('BAGT'.split(''), 'TIN')
			.should.containDeep(['BATIN', 'BATING'])
			.and.have.lengthOf(2);
	});

	describe('find hook pattern', function() {
		it('should find word missing first character', function() {
			gaddag.findWordsWithRackAndHook(['B'], '?AT')
				.should.containDeep(['BAT'])
				.and.have.lengthOf(1);
		});
		it ('should not find missing word with missing first character', function() {
			gaddag.findWordsWithRackAndHook(['B'], '?A')
				.should.not.containDeep(['BA'])
				.and.have.lengthOf(0);
		});
		it ('should find word missing last character', function() {
			gaddag.findWordsWithRackAndHook(['T'], 'BA?')
				.should.containDeep(['BAT'])
				.and.have.lengthOf(1);
		});
		it ('should find word with middle character', function() {
			gaddag.findWordsWithRackAndHook(['B','T'], '?A?')
				.should.containDeep(['BAT'])
				.and.have.lengthOf(1);
		});
		it ('should not find word with not enough characters', function() {
			gaddag.findWordsWithRackAndHook('BAT'.split(''), '??')
				.should.not.containDeep(['BAT'])
				.and.have.lengthOf(0);
		});
		it ('should find word missing middle character', function() {
			gaddag.findWordsWithRackAndHook(['A'], 'B?T')
				.should.containDeep(['BAT'])
				.and.have.lengthOf(1);
		});
		it ('should find word missing all character', function() {
			gaddag.findWordsWithRackAndHook('BATIN'.split(''), '?????')
				.should.containDeep(['BAT', 'BATIN'])
				.and.have.lengthOf(2);
		});
		it ('should find word with no trie children', function() {
			gaddag.findWordsWithRackAndHook('BLA'.split(''), '???')
				.should.containDeep(['BLA'])
				.and.have.lengthOf(1);
		});
		it ('should find word missing some character and no trie children', function() {
			gaddag.findWordsWithRackAndHook('ATNG'.split(''), 'B??I??')
				.should.containDeep(['BATIN', 'BATING'])
				.and.have.lengthOf(2);
		});
		it('should find word with blank character at the start', function() {
			gaddag.findWordsWithRackAndHook('BL'.split(''), '?????A').should
				// .containDeep(['BLA'])
				.and.have.lengthOf(0);
		});
		// it.skip ('should find word must cross hook', function() {
		// 	gaddag.findWordsWithRackAndHook('BAT'.split(''), '????r????')
		// 		.should
		// 			// .containDeep(['BLA'])
		// 			.and.have.lengthOf(0);
		// });
		it('should not find word in hook only', function() {
			gaddag.findWordsWithRackAndHook('R'.split(''), 'BAT???')
				.should
					// .containDeep(['BLA'])
					.and.have.lengthOf(0);
		});

		it('should find word at start of hook only', function() {
			gaddag = new Gaddag();

			gaddag.add('UNEASE');
			gaddag.findWordsWithRackAndHook('UNEAS'.split(''), '??????E')
				.should
					// .containDeep(['BLA'])
					.and.have.lengthOf(0);
		});

		it('should find with uppercase but preserve lowercase', function() {
			gaddag = new Gaddag();

			gaddag.add('UNEASE');
			gaddag.findWordsWithRackAndHook('UNEASe'.split(''), '??????')
				.should
					.containDeep(['UNEASe', 'UNeASE'])
					.and.have.lengthOf(2);
		});
	});
});
// describe('Array', function(){
//   describe('#indexOf()', function(){
//     it('should return -1 when the value is not present', function(){
//     	[1,2,3].indexOf(5).should.be.exactly(-1).and.a.Number;
//     	[1,2,3].indexOf(0).should.be.exactly(-1).and.a.Number;
//     })
//   })
// });	