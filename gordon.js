var JSONR = require('./jsonr.js');
var log = require('./util.js').log;

// module.exports.State = State;
// module.exports.Arc = Arc;

LETTERSETS = [];
var stateCounter = 0;

var Gordon = function() {
	this.separator = '>';
	this.initial = new State();
	this.letterSets = LETTERSETS;
	// log('initial state: ' + JSON.stringify(this.initial));
}

var State = function() {
	this.id = 'S' + stateCounter++;
	Object.defineProperty(this, 'id', {enumerable:false});
}
State.prototype.toDot = function(dict) {
	var result = '';
	var i = 0;
	for (var key in this) {
		log('key ' + key);
		i++;
		var arc = this[key];
		if (dict[this.id +':' + arc.state.id] === undefined) {
			result += this.id + ' -> ' + arc.state.id + '[label = " ' + key + (arc.letterSet?'|' + LETTERSETS[arc.letterSet]:'') + '"];\n';
			result += arc.state.toDot(dict);
			dict[this.id +':' + arc.state.id] = true;
		}
	}
	result = this.id + '[label=""];\n' + result;
	return result;
}
Object.defineProperty(State.prototype, 'toDot', {enumerable:false});

var Arc = function(state) {
	this.letterSet = null;
	this.state = state;
}

Arc.prototype.addLetter = function(ch) {
	var letters = '';
	if (this.letterSet !== null)
	{
		letters = LETTERSETS[this.letterSet];
	}
	if (letters.indexOf(ch) !== -1)
		return;

	letters = (letters + ch).split('').sort().join('');
	var index = LETTERSETS.indexOf(letters);
	if (index === -1) {
		index = LETTERSETS.length;
		LETTERSETS.push(letters);
	}
	this.letterSet = index;

	// if (this.letterSet == null)
	// 	this.letterSet = ch;
	// else
	// 	if (this.letterSet.indexOf(ch) === -1)
	// 		this.letterSet += ch;
};

Arc.prototype.getWords = function(prefix, forward) {
	if (this.letterSet === null)
		return null;
	return this.letterSet.split('').map(function(letter) { return forward?prefix+letter:letter+prefix});
};

Gordon.prototype.addArc = function(state, ch) {
	if (state[ch] === undefined)
		state[ch] = new Arc(new State());
	return state[ch].state;
};

Gordon.prototype.addFinalArc = function(state, c1, c2) {
	this.addArc(state, c1);
	var arc = state[c1];
	arc.addLetter(c2);
};

Gordon.prototype.forceArc = function(state, ch, forceState) {

	if (state[ch] === undefined)
		state[ch] = new Arc(forceState);

	if (state[ch].state !== forceState) {
		// log("Can't force this state, a state already exists");
		return;
		// log('Force Arc: ' + ch);
		// log('  state[ch].state ' + JSON.stringify(state[ch].state));
		// log('  forceState ' + JSON.stringify(forceState));
		// throw new Error("Can't force this state, a state already exists");
	}

};

Gordon.prototype.addWord = function(word) {

	if (word.length < 2) return;

	var st = this.initial;
	var n = word.length - 1;
	// log('initial state: ' + JSON.stringify(st));
	for (var i = n; i >= 2; i--) {
		if (st === this.initial)
			log('root: ' + word[i]);
		st = this.addArc(st, word[i]);
	};
	this.addFinalArc(st, word[1], word[0]);

	st = this.initial;
	for (var i = n-1; i >= 0; i--) {
		if (st === this.initial)
			log('root: ' + word[i]);
		st = this.addArc(st, word[i]);
	};
	this.addFinalArc(st, '>', word[n]);

	for (var m = word.length - 2; m >= 0; m--) {
		var forceSt = st;
		var st = this.initial;
		for (var i = m - 1; i >= 0; i--) {
			if (st === this.initial)
				log('root: ' + word[i]);
			st = this.addArc(st, word[i]);
		};
		st = this.addArc(st, '>');
		this.forceArc(st, word[m], forceSt);
	};
};

Gordon.prototype.addAll = function(list) {
	list.forEach(this.addWord, this);
}

Gordon.prototype.toString = function() {
	return JSONR.revealReferences(JSONR.stringify(this, null, 2));
};

Gordon.prototype.toDot = function() {
	var result = 'digraph graphname {\n';
	result += '{\n' +
		'node[shape="circle",fixedsize=true,height=0.15,width=0.15,color=grey];\n' + 
		'edge[color=grey,arrowsize=0.5,fontsize=8];\n';
	result += this.initial.toDot({});
	result +='}}';
	return result;
}

module.exports = Gordon;