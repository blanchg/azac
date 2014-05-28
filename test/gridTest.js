var assert = require("assert");
var should = require("should");
var Grid = require('../grid.js').Grid;

describe("Grid", function() {
	var grid = null;
	beforeEach(function () {
 		grid = new Grid(15)
	});

	it("should have size of 15", function() {
		grid.size.should.be.exactly(15);
	});
	it("should allow adding a word", function() {
		grid.addWord('opiate', 7, 2, false);
		grid.cell(7, 2).should.be.exactly('o');
		grid.cell(7, 3).should.be.exactly('p');
	});
	describe("validate move", function () {
		it("should score a valid first move", function() {
			grid.validateMove('opiate', 7, 2, false, true).should.be.exactly(22);
		});
	});
});