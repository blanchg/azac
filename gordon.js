var JSONR = require('./jsonr.js');

// module.exports.State = State;
// module.exports.Arc = Arc;

var Gordon = function() {
	this.initial = new Arc(null, new State());
}

var State = function() {
	this.children = [];
}

var Arc = function(letter, state) {
	this.letter = letter;
	this.state = state;
}

Gordon.prototype.add = function(word) {
	
};

Gordon.prototype.toString = function() {
	return JSONR.revealReferences(JSONR.stringify(this.initial, null, 2));
};

module.exports = Gordon;