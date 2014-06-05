var assert = require("assert");
var should = require("should");
var JSONR = require('../jsonr.js');
var log = require('../util.js').log;

describe('JSONR', function() {


	describe('stringify', function() {

		it('simple input', function() {

			var usa = { name: "USA", language: "English", currency: "Dollar" };
			var cities = [
				{ name: "Washington DC", country: usa },
				{ name: "New York", country: usa },
				{ name: "San Francisco", country: usa },
			];
			usa.capital = cities[0];
			var str = JSONR.stringify(cities, null, 2);
			var cities2 = JSONR.parse(str);
			log('Cities2: ' + JSONR.revealReferences(JSONR.stringify(cities2, null, 2)));
			// cities2.should.be.exactly(cities);
			// cities2.capital.should.be.exactly(cities[0]);
			cities2[0].name.should.be.exactly(cities[0].name);
			// cities2[0].country.should.be.equal(usa);
			// log();

		})
	})
})