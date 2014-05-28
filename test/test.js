var assert = require("assert");
var should = require("should");
var log = require("../util.js").log;

var Gaddag = require('../gaddag.js').Gaddag;

var gaddag = null;

// console.log(JSON.stringify(gaddag.getTrie(), null, 2));

describe('Gaddag', function() {
	beforeEach(function() {
		gaddag = new Gaddag();

		gaddag.add('bat');
		gaddag.add('bla');
		gaddag.add('batin');
		gaddag.add('bating');
	});

	it('should allow multiple instances', function() {
		var gd2 = new Gaddag();
		// log('gaddag ' + gaddag.getTrie());
		// log('gd2    ' + gd2.getTrie());
		// gaddag.getTrie().should.not.be.exactly(gd2.getTrie());
		gd2.findWord('bat').should.be.false;
	})

	it('find word', function() {
		gaddag.findWord('bating').should.be.ok;
		gaddag.findWord('batin').should.be.ok;
		gaddag.findWord('bati').should.not.be.ok;
		gaddag.findWord('bat').should.be.ok;
		gaddag.findWord('blah').should.not.be.ok;
		gaddag.findWord('b').should.not.be.ok;
		gaddag.findWord('bla').should.be.ok;
	});

	it('find hook sequence', function() {
		gaddag.findWordsWithRackAndHook('bagt'.split(''), 'tin')
			.should.containDeep(['batin', 'bating'])
			.and.have.lengthOf(2);
// log('Find part of word: ' + gaddag.findWordsWithRackAndHook('bagt'.split(''), 'tin').join(', '));
	});

	describe('find hook pattern', function() {
		it('should find word missing first character', function() {
			gaddag.findWordsWithRackAndHook(['b'], '?at')
				.should.containDeep(['bat'])
				.and.have.lengthOf(1);
		});
		it ('should not find missing word with missing first character', function() {
			gaddag.findWordsWithRackAndHook(['b'], '?a')
				.should.not.containDeep(['ba'])
				.and.have.lengthOf(0);
		});
		it ('should find word missing last character', function() {
			gaddag.findWordsWithRackAndHook(['t'], 'ba?')
				.should.containDeep(['bat'])
				.and.have.lengthOf(1);
		});
		it ('should find word with middle character', function() {
			gaddag.findWordsWithRackAndHook(['b','t'], '?a?')
				.should.containDeep(['bat'])
				.and.have.lengthOf(1);
		});
		it ('should not find word with not enough characters', function() {
			gaddag.findWordsWithRackAndHook('bat'.split(''), '??')
				.should.not.containDeep(['bat'])
				.and.have.lengthOf(0);
		});
		it ('should find word missing middle character', function() {
			gaddag.findWordsWithRackAndHook(['a'], 'b?t')
				.should.containDeep(['bat'])
				.and.have.lengthOf(1);
		});
		it ('should find word missing all character', function() {
			gaddag.findWordsWithRackAndHook('batin'.split(''), '?????')
				.should.containDeep(['batin', 'bat'])
				.and.have.lengthOf(2);
		});
		it ('should find word with no trie children', function() {
			gaddag.findWordsWithRackAndHook('bla'.split(''), '???')
				.should.containDeep(['bla'])
				.and.have.lengthOf(1);
		});
		it ('should find word missing some character and no trie children', function() {
			gaddag.findWordsWithRackAndHook('atng'.split(''), 'b??i??')
				.should.containDeep(['batin', 'bating'])
				.and.have.lengthOf(2);
		});
		it ('should find word with blank character at the start', function() {
			gaddag.findWordsWithRackAndHook('bl'.split(''), '?????a')
				.should.containDeep(['bla'])
				.and.have.lengthOf(1);
		});
		it.skip ('should find word must cross hook', function() {
			gaddag.findWordsWithRackAndHook('bat'.split(''), '????r????')
				.should
					// .containDeep(['bla'])
					.and.have.lengthOf(0);
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