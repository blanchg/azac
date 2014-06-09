var JSONR = require('./jsonr.js');
var log = require('./util.js').log;

// module.exports.State = State;
// module.exports.Arc = Arc;

CS = [];
STATESETS = [];
var stateCounter = 0;

var Gordon = function() {
	this.separator = '>';
	this.initial = this.createState();
	this.stateSets = STATESETS;
	this.cs = CS;
	// log('initial s: ' + JSON.stringify(this.initial));
}

Gordon.prototype.createState = function() {
	var state = new State();
	state.id = STATESETS.length;
	STATESETS.push(state);
	return state.id;
};

Gordon.prototype.getData = function() {
	return {
		initial: this.initial,
		cs: this.cs,
		stateSets: this.stateSets
	};
};

Gordon.prototype.setData = function(data) {
	this.initial = data.initial;
	this.cs = data.cs;
	this.stateSets = data.stateSets;
	CS = this.cs;
	STATESETS = this.stateSets;
};

var State = function() {
	this.id = 0;
	Object.defineProperty(this, 'id', {enumerable:false});
}
State.prototype.toDot = function(dict) {
	var result = '';
	var i = 0;
	for (var key in this) {
		log('key ' + key);
		i++;
		var arc = this[key];
		log('arc ' + JSON.stringify(arc, null, 2))	;
		var s = STATESETS[arc.s];
		log('astate ' + arc.s + ' s ' + s);
		if (dict[this.id +':' + s.id] === undefined) {
			result += this.id + ' -> ' + s.id + '[label = " ' + key + (arc.cs?'|' + CS[arc.cs]:'') + '"];\n';
			result += s.toDot(dict);
			dict[this.id +':' + s.id] = true;
		}
	}
	result = this.id + '[label=""];\n' + result;
	return result;
}
Object.defineProperty(State.prototype, 'toDot', {enumerable:false});

var Arc = function(s) {
	this.s = s;
}

Arc.prototype.addLetter = function(ch) {
	var letters = '';
	if (this.cs !== undefined)
	{
		letters = CS[this.cs];
	}
	if (letters.indexOf(ch) !== -1)
		return;

	letters = (letters + ch).split('').sort().join('');
	var index = CS.indexOf(letters);
	if (index === -1) {
		index = CS.length;
		CS.push(letters);
	}
	this.cs = index;

	// if (this.cs == null)
	// 	this.cs = ch;
	// else
	// 	if (this.cs.indexOf(ch) === -1)
	// 		this.cs += ch;
};

Arc.prototype.getWords = function(prefix, forward) {
	if (this.cs === undefined)
		return null;
	return this.cs.split('').map(function(letter) { return forward?prefix+letter:letter+prefix});
};

Gordon.prototype.addArc = function(s, ch) {
	if (s[ch] === undefined)
		s[ch] = new Arc(this.createState());
	return STATESETS[s[ch].s];
};

Gordon.prototype.addFinalArc = function(s, c1, c2) {
	this.addArc(s, c1);
	var arc = s[c1];
	arc.addLetter(c2);
};

Gordon.prototype.forceArc = function(s, ch, forceState) {

	if (s[ch] === undefined)
		s[ch] = new Arc(forceState.id);

	if (s[ch].s !== forceState) {
		// log("Can't force this s, a s already exists");
		return;
		// log('Force Arc: ' + ch);
		// log('  s[ch].s ' + JSON.stringify(s[ch].s));
		// log('  forceState ' + JSON.stringify(forceState));
		// throw new Error("Can't force this s, a s already exists");
	}

};

Gordon.prototype.addWord = function(word) {

	if (word.length < 2) return;

	var initial = STATESETS[this.initial];
	var st = initial;
	var n = word.length - 1;
	// log('initial s: ' + JSON.stringify(st));
	for (var i = n; i >= 2; i--) {
		st = this.addArc(st, word[i]);
	};
	this.addFinalArc(st, word[1], word[0]);

	st = initial;
	for (var i = n-1; i >= 0; i--) {
		st = this.addArc(st, word[i]);
	};
	this.addFinalArc(st, this.separator, word[n]);

	for (var m = word.length - 2; m >= 0; m--) {
		var forceSt = st;
		var st = initial;
		for (var i = m - 1; i >= 0; i--) {
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
	result += STATESETS[this.initial].toDot({});
	result +='}}';
	return result;
}

module.exports = Gordon;