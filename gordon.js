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

Gordon.prototype.initialArc = function() {
	if (this.ia === undefined) {
		this.ia = new Arc(this.initial);
	}
	return this.ia;
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
		// log('key ' + key);
		i++;
		var arc = this[key];
		// log('arc ' + JSON.stringify(arc, null, 2))	;
		var s = STATESETS[arc.s];
		// log('astate ' + arc.s + ' s ' + s);
		if (dict[this.id +':' + s.id] === undefined) {
			result += this.id + ' -> ' + s.id + '[label = " ' + key + (arc.cs !== undefined?'|' + CS[arc.cs]:'') + '"];\n';
			result += s.toDot(dict);
			dict[this.id +':' + s.id] = true;
		}
	}
	// result = this.id + '[label="' + this.id + '"];\n' + result;
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
	var state = this.addArc(s, c1);
	// log('Add final arc from s: ' + s.id + ' ' + JSON.stringify(s) + ' for ' + c1 + ' = ' + JSON.stringify(state));
	var arc = s[c1];
	// log('Add char ' + c2 + ' to arc ' + JSON.stringify(arc));
	arc.addLetter(c2);
	// log('Arc ' +  JSON.stringify(arc) + ' char: ' + this.arcChar(arc));
	return state;
};

Gordon.prototype.forceArc = function(s, ch, forceState) {

	if (s.hasOwnProperty(ch))
		return;

	s[ch] = new Arc(forceState.id);

// log('s[ch].s: ' + JSON.stringify(s[ch].s));
// log('forceState.id: ' + JSON.stringify(forceState.id));
// 	if (s[ch].s !== forceState.id) {
// 		// log("Can't force this s already exists");
// 		// log('s: ' + JSON.stringify(s));
// 		// log('c: ' + ch);
// 		// log('force: ' + forceState);
// 		return;
// 		// log('Force Arc: ' + ch);
// 		// log('  s[ch].s ' + JSON.stringify(s[ch].s));
// 		// log('  forceState ' + JSON.stringify(forceState));
// 		// throw new Error("Can't force this s, a s already exists");
// 	}
};

Gordon.prototype.addWord = function(word) {

	if (word.length < 2) return;

	var initial = STATESETS[this.initial];
	var st = initial;
	var n = word.length - 1;
	log('initial s: ' + st.id + " " + JSON.stringify(st));
	log("n: " + n);
	log("n -> 0");
	for (var i = n; i >= 2; i--) {
		log(i + " s: " + st.id + " -> " + word[i]);
		st = this.addArc(st, word[i]);
		log(" --> " + st.id);
	};
	log("1" + " s: " + st.id + " -> " + word[1]);
	log("0" + " | " + word[0]);
	this.addFinalArc(st, word[1], word[0]);

	log("n-1 -> 0 : n");
	st = initial;
	for (var i = n-1; i >= 0; i--) {
		log(i + " s: " + st.id + " -> " + word[i]);
		st = this.addArc(st, word[i]);
		log(" --> " + st.id);
	};
	log(n + " s: " + st.id + " -> " + word[n]);
	this.addFinalArc(st, this.separator, word[n]);

	log('remaining paths');
	for (var m = n - 2; m >= 0; m--) {
		var forceSt = st;
		var st = initial;
		for (var i = m; i >= 0; i--) {
			log(i + " s: " + st.id + " -> " + word[i]);
			st = this.addArc(st, word[i]);
			log(" --> " + st.id);
		};
		log("s: " + st.id + " -> >");
		st = this.addArc(st, '>');
		log(" --> " + st.id);
		log("force: " + st.id + " -> " + word[m+1] + " -> " + forceSt.id);
		this.forceArc(st, word[m+1], forceSt);
		// this.addFinalArc(st, word[m+1], word[m+2]);
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
		'node[shape="circle",fixedsize=true,height=0.15,width=0.15,color=grey,fontsize=8,fontcolor=grey];\n' + 
		'edge[color=grey,arrowsize=0.5,fontsize=8];\n';
	result += STATESETS[this.initial].toDot({});
	result +='}}';
	return result;
}
Gordon.prototype.nextArc = function(arc, l) {
    // log('Next arc ' + JSON.stringify(arc) + ' letter ' + l);
    if (arc === null)
    	return null;
    var state = this.stateSets[arc.s];
    if (state !== undefined) {
    	if (state.hasOwnProperty(l)) {
        	return state[l];
        // } else if (state.hasOwnProperty(this.separator)) {
        // 	arc = state[this.separator];
        // 	state = this.stateSets[arc.s];
        // 	if (state.hasOwnProperty(l)) {
        // 		return state[l];
        // 	}
        }
    }
    return null;
};
Gordon.prototype.arcState = function(arc) {
	if (arc === null)
		return null;
    if (this.stateSets.hasOwnProperty(arc.s))
        return this.stateSets[arc.s];
    return null;
};
Gordon.prototype.arcChar = function(arc) {
	if (arc === null)
		return null;
    if (arc.hasOwnProperty("cs") && CS.hasOwnProperty(arc.cs))
        return CS[arc.cs];
    return null;
};
Gordon.prototype.letterOnArc = function(arc, letter) {
    if (!arc)
        return false;
    var chars = this.arcChar(arc);
    var result = chars !== null && chars.indexOf(letter) != -1
    // log('arc: ' + JSON.stringify(arc) + '\n  letter: ' + letter + '\n  chars: ' + chars + '\n==' + result);
    return result;
};
Gordon.prototype.findWord = function(word) {
	var arc = this.initialArc();
	if (!arc)
		return false;
	var found = false;
	var failed = word.split('').some(function(letter,i) {

		var endLetter = i == word.length - 1;
		var secondLetter = i == 1;
		if (secondLetter) {
			arc = this.nextArc(arc, this.separator);
		}
		// log('letter: ' + letter + ' end ' + endLetter + ' second ' + secondLetter + ' arc ' + JSON.stringify(arc) + ' state ' + JSON.stringify(this.arcState(arc)));
		if (endLetter) {
			var separatorArc = this.nextArc(arc, this.separator);
			if (this.letterOnArc(arc, letter) || this.letterOnArc(separatorArc, letter)) {
				found = true;
				return true;
			}
			return false;
		} else {
			var letterArc;
			letterArc = this.nextArc(arc, letter);
			if (letterArc === null && !secondLetter) {
				letterArc = this.nextArc(arc, this.separator);
				if (letterArc !== null) {
					letterArc = this.nextArc(letterArc, letter);
				}
			}
			if (letterArc === null) {
				return true
			}
			arc = letterArc;
			return false;
		}
	}, this);
	return found;
};

Gordon.prototype.allWords = function() {
	var results = [];

	var initial = STATESETS[this.initial];
	for (var stateLetter in initial) {
		var arc = initial[stateLetter];
		this.getFinalWords(arc, stateLetter, results, true);
		var nextArc = this.nextArc(arc, this.separator);
		this.loop(nextArc, stateLetter, results);
	}
	return results;
}

Gordon.prototype.getFinalWords = function(arc, word, results, reverse) {
	if (arc === null)
		return;

	var letters = this.arcChar(arc);
	if (letters !== null) {
		letters.split('').forEach(function(letter) {
			if (reverse) {
				this.pushUnique(results, letter + word);
			} else {
				this.pushUnique(results, word + letter);
			}
		}, this);
	}
};

Gordon.prototype.pushUnique = function(arr, obj) {
	if (arr.indexOf(obj) === -1)
		arr.push(obj);
};

Gordon.prototype.loop = function(arc, word, results) {
	if (arc === null)
		return;
	
	this.getFinalWords(arc, word, results, false);
	state = this.arcState(arc);
	for (var stateLetter in state) {
		if (stateLetter === '>') {
			this.loop(this.nextArc(arc, stateLetter), word, results);
		} else {
			this.loop(this.nextArc(arc, stateLetter), word + stateLetter, results);
		}
	}
};

module.exports = Gordon;