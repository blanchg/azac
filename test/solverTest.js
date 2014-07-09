// require('../index.js');
// var fs = require('fs');
// var path = require('path');
var log = require('../util.js').log;
var Solver = require('../solver.js');
var Gordon = require('../gordon.js');
var should = require("should");

var solver;

var bestResult = function(results) {
	var best = {score:0};
	results.forEach(function(result) {
		if (best.score < result.score)  {
			best = result;
		}
	}, this);
	return best;
}
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
			var anchor = new A(7,7,true,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'OPIATE'.split(''), solver.lexicon.initialArc(), true);
			solver.results.should.have.length(6);
			r = bestResult(solver.results);
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);

			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(2,7,true,true);
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
			var anchor = new A(7,7,true,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'OPIATE'.split(''), solver.lexicon.initialArc(), true);
			solver.results.should.have.length(6);
			r = bestResult(solver.results);
			r.score.should.be.equal(22);
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(1,7,true,true);
		    solver.gen(anchor, 0, "", 'CROP'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(1);
		});

		it('should not find ringer', function() {
// 8C OPIATE 22,
// I6 DID 16,
// 9C RINGER 26
			solver.lexicon = new Gordon();
			solver.lexicon.addWord('DID');
			solver.lexicon.addWord('OPIATE');
			solver.lexicon.addWord('OPIATED');
			solver.lexicon.addWord('RINGER');
			solver.lexicon.addWord('OR');
			solver.lexicon.addWord('PI');
			solver.lexicon.addWord('IN');
			solver.lexicon.addWord('AG');
			// solver.lexicon.addWord('TE');
			solver.lexicon.addWord('ER');
			solver.lexicon.addWord('BET');
			solver.lexicon.addWord('ETHER');
			solver.lexicon.addWord('TERM');


			solver.grid.lexicon = solver.lexicon;
			// log(solver.lexicon.cs.join(','));
			// log(solver.lexicon.toDot());
			// return;
			var A = Solver.prototype.Anchor;
			log('first');
			// FIRST WORD
			var anchor = new A(2,7,true,true);
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
			var anchor = new A(8, 7,false,true);
		    solver.gen(anchor, 0, "", 'DID'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(2);
			r = bestResult(solver.results)
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

			log('third');
			// THIRD WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(2,8,true,true);
		    solver.gen(anchor, 0, "", 'RINGER'.split(''), solver.lexicon.initialArc(), false);
			log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(1);
			solver.results[0].word.should.be.equal('ER');
			// if (solver.results.length > 0) {
			// 	r = solver.results[0]
			// 	solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			// 	solver.grid.print();
			// }
			// solver.grid.addWord('RINGER', 5, 8, false);
		});

		it('should find relents', function() {
			solver.lexicon = new Gordon();
			// solver.lexicon.addWord('AB');
			// solver.lexicon.addWord('ABS');
			solver.lexicon.addWord('NUMB');
			solver.lexicon.addWord('NUMBS');
			solver.lexicon.addWord('RELENTS');
			log(solver.lexicon.allWords());
			log(solver.lexicon.toDot());

			solver.grid.lexicon = solver.lexicon;
			var A = Solver.prototype.Anchor;
			var anchor = new A(7,7,true,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'BMLUNNR'.split(''), solver.lexicon.initialArc(), true);
			solver.results.should.have.length(4);
			var r = bestResult(solver.results);
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

			log('second');
			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(8, 7,false,true);
		    solver.gen(anchor, 0, "", 'LNRESET'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(1);
			r = solver.results[0]
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

		});

		it('should not find aona', function() {
			solver.lexicon = new Gordon();
			solver.lexicon.addWord('TOPI');
			solver.lexicon.addWord('AIRT');
			solver.lexicon.addWord('AIRT');
			solver.lexicon.addWord('ATRIA');
			solver.lexicon.addWord('IT');
			log(solver.lexicon.allWords());
			log(solver.lexicon.toDot());

			solver.grid.lexicon = solver.lexicon;
			var A = Solver.prototype.Anchor;
			var anchor = new A(7,7,true,true);
			solver.results = [];
			solver.wordDict = {};
		    solver.gen(anchor, 0, "", 'AIOIETP'.split(''), solver.lexicon.initialArc(), true);
			log('Results: ' + JSON.stringify(solver.results, null, 2));
			// solver.results.should.have.length(4);
			var r = solver.results[3]; //bestResult(solver.results);
			solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			solver.grid.print();

			log('second');
			// SECOND WORD
			solver.results = [];
			solver.wordDict = {};
			var anchor = new A(8, 8,true,false);
		    solver.gen(anchor, 0, "", 'AEIIRRT'.split(''), solver.lexicon.initialArc(), false);
			// log('Results: ' + JSON.stringify(solver.results, null, 2));
			solver.results.should.have.length(0);
			// r = bestResult(solver.results);
			// solver.grid.addWord(r.word, r.col, r.row, r.horizontal);
			// solver.grid.print();
			// solver.lexicon.findWord(r.word).should.be.ok();


		});
	});
	
	describe.only("target words", function() {

		it("find first target", function(done) {

			solver.lexicon = new Gordon();
			solver.lexicon.addWord('OXYPHENBUTAZONE');
			solver.lexicon.addWord('ET');
			solver.lexicon.addWord('ETA');
			solver.lexicon.addWord('TA');
			solver.lexicon.addWord('TAT');
			solver.lexicon.addWord('AT');
			solver.lexicon.addWord('NE');
			solver.lexicon.addWord('HE');
			solver.lexicon.addWord('NA');
			solver.lexicon.addWord('UT');
			solver.lexicon.addWord('ON');
			solver.lexicon.addWord('UTA');
			solver.lexicon.addWord('NAE');
			solver.lexicon.addWord('ETE');
			solver.lexicon.addWord('ONE');
			solver.lexicon.addWord('ATE');
			solver.lexicon.addWord('HEN');
			solver.lexicon.addWord('ON');
			solver.lexicon.addWord('UTA');
			solver.lexicon.addWord('TAILED');

			solver.setBag('TAILEDATTATEETAETEONEEHENNUTAOXYPBZE'.split('')); // 

	    	solver.addPreferredMove("OXYPHENBUTAZONE", 0, 0, true);
	        solver.addPreferredMove('ET',4,1,true);
	        solver.addPreferredMove('ETA',4,1,true);
	        solver.addPreferredMove('TA',5,1,true);
	        solver.addPreferredMove('TA',8,1,true);
	        solver.addPreferredMove('TAT',8,1,true);
	        solver.addPreferredMove('AT',9,1,true);
	        solver.addPreferredMove('NE',12,1,true);

	        solver.addPreferredMove('HE',4,0,false);
	        solver.addPreferredMove('ET',5,0,false);
	        solver.addPreferredMove('NA',6,0,false);
	        solver.addPreferredMove('UT',8,0,false);
	        solver.addPreferredMove('TA',9,0,false);
	        solver.addPreferredMove('AT',10,0,false);
	        solver.addPreferredMove('ON',12,0,false);
	        solver.addPreferredMove('NE',13,0,false);

			solver.grid.lexicon = solver.lexicon;

			// solver.haveAvailableLetters().should.be.ok;

		    log('Aiming for:');
		    solver.template.print();
		    solver.problem = '1';

		    var rack = [];
		    // solver.fillRack(rack, solver.bag);
		    log('Rack: ' + rack);

		 //    var A = Solver.prototype.Anchor;
			// solver.results = [];
			// solver.wordDict = {};
		 //    var anchor = new A(7,7,false,true);
		 //    solver.gen(anchor, 0, "", rack.slice(0), solver.grid.lexicon.initialArc(), true, '', solver.clone(solver.availableLetters));
		 //    log('Results: ' + solver.results.join('\n'));
			// solver.grid.addWord('TAILED', 7, 2, false);

			// solver.grid.print();

			solver.processAll(done);

		});

	});

});