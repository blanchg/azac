
var Grid = require('./grid.js').Grid;
var log = require('./util.js').log;
var fs = require('fs');
var clc = require('cli-color');
var ansiTrim = require('cli-color/trim');
var Combinatorics = require('js-combinatorics').Combinatorics;

var Solver = function() {
    this.rack = [];
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.lowerAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    this.COLUMNS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.ROWS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    this.scores = '1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10'.split(',').map(function(item){return parseInt(item)});
    this.grid = new Grid(15);
    this.template = new Grid(15);
    this.lexicon = null;
    this.bag = [];
    this.problem = '?';
    this.preferredMoves = [];
}

module.exports = Solver;

// Modifies rack and bag which are both arrays
Solver.prototype.fillRack = function(rack, bag) {
    while (rack.length < 7 && bag.length > 0) {
        rack.push(bag.shift());
    }
}

var Result = function(replacements, hook, word, col, row, horizontal, score, rack) {
    this.rack = rack;
    this.replacements = replacements;
    this.hook = hook;
    this.word = word;
    this.col = col;
    this.row = row;
    this.horizontal = horizontal;
    this.score = score;
}

Result.prototype.toString = function() {
    return this.word + '[' + this.col + ', ' + this.row + ']';
};

Solver.prototype.saveProgress = function(grid, foundWords) {

    log('Saving the progress for later');
    console.time('write');
    var output = '\n';
    grid.print(function(data) { output += data + '\n';});

    output += 'Result\n' + this.problem + ':\n' + foundWords.map(function(f) {return f.join(' ');}).join(',\n');
    fs.writeFileSync(this.problem + '.log', output, {encoding:'utf8'});
    console.timeEnd('write');
}

var Anchor = function(x,y,horizontal,lookLeft) {
    this.x = x;
    this.y = y;
    this.horizontal = horizontal;
    this.lookLeft = lookLeft;
}

Solver.prototype.Anchor = Anchor;

Anchor.prototype.move = function(pos) {
    if (this.horizontal) {
        return new Anchor(this.x + pos, this.y, this.horizontal, this.lookLeft);
    } else {
        return new Anchor(this.x, this.y + pos, this.horizontal, this.lookLeft);
    }
};
Anchor.prototype.toString = function() {
    return this.x + ',' + this.y + (this.horizontal?'h':'v');
};

Solver.prototype.getAnchors = function(firstWord) {
    var result = [];
    if (firstWord)
    {
        result.push(new Anchor(7,7,false,true));
        result.push(new Anchor(7,7,true,true));
        // result.push(new Anchor(7,7,false));
    } else {
        var i = 0;
        var anchors = this.grid.anchors;
        var size = this.grid.size;
        var firstH = false;
        var firstV = false;
        for (var y = 0; y < size; y++) {
            if (y == 0) firstV = true;
            for (var x = 0; x < size; x++) {
                if (x == 0) firstH = true;
                var a = anchors[i];
                i++;
                if (a == 1) {
                    result.push(new Anchor(x, y, false, firstV));
                    result.push(new Anchor(x, y, true, firstH));
                    if (firstV) firstV = false;
                    if (firstH) firstH = false;
                }
            };
        };
    }
    return result;
}

Solver.prototype.nextArc = function(arc, l) {
    return this.grid.lexicon.nextArc(arc, l);
};
Solver.prototype.arcState = function(arc) {
    return this.grid.lexicon.arcState(arc);
};
Solver.prototype.arcChar = function(arc) {
    return this.grid.lexicon.arcChar(arc);
};
Solver.prototype.letterOnArc = function(arc, letter) {
    return this.grid.lexicon.letterOnArc(arc, letter);
};

Solver.prototype.rackMinus = function(rack, letter) {
    var index = rack.indexOf(letter);
    if (index == -1) {
        return null;
    }
    if (index == 0)
        return rack.slice(1);
    if (index == rack.length - 1)
        return rack.slice(0, index);
    return rack.slice(0, index).concat(rack.slice(index + 1));
};

Solver.prototype.allowedHere = function(anchor, pos, letter) {
    var p = anchor.move(pos);
    var prefix = this.grid.prefix(p.x, p.y, !p.horizontal);
    if (prefix.length == 0)
        if (this.template.prefix(p.x, p.y, !p.horizontal).length > 0)
            return false;
    var suffix = this.grid.suffix(p.x, p.y, !p.horizontal);
    if (suffix.length == 0)
        if (this.template.suffix(p.x, p.y, !p.horizontal).length > 0)
            return false;

    if (prefix.length == 0 && suffix.length == 0)
        return true;

    var altWord = prefix + letter + suffix;
    if (altWord.length > 1) {
        var result = this.grid.lexicon.findWord(altWord.toUpperCase());
        // if (!result) {
        //     log('alt word: ' + altWord + ' doesn\'t exist');
        // }
        // if (result) {
        //     log(p.x + ', ' + p.y + ' ' + p.horizontal);
        //     log('p ' + prefix + ' s ' + suffix);
        //     log('alt word: ' + altWord);
        // }
        return result;
    }
    return true;
};

Solver.prototype.gen = function(anchor, pos, result, rack, arc, firstWord, space) {
    // if (space === undefined) {
    //     space = '';
    // } else {
    //     space += '  ';
    // }
    // log(space + 'Gen arc ' + JSON.stringify(arc) + '\n' + space + JSON.stringify(this.arcState(arc)));
    // log(space + 'rack: ' + rack);
    // log(space + 'result: ' + result);
    // log(space + 'anchor: ' + anchor);
    // log(space + 'pos: ' + pos);
    rack = rack.slice(0).sort();
    var p = anchor.move(pos);
    var l = this.grid.letter(p.x, p.y);
    var t = null;
    // log(space + ' grid letter: ' + l);
    if (l === null) {
        t = this.template.letter(p.x, p.y);
        if (t !== undefined) {
            if (rack.indexOf(t) != -1) {
                rack = this.rackMinus(rack, t);
            } else if (rack.indexOf('?') != -1) {
                rack = this.rackMinus(rack, '?');
            } else {
                t = null;
            }
        }

    }
    if (t !== null) {
        var nextArc = this.nextArc(arc, t);
        this.goOn(anchor, pos, t, result, rack, nextArc, arc, firstWord, space);
    } else if (l !== null) {
        var nextArc = this.nextArc(arc, l);
        this.goOn(anchor, pos, l, result, rack, nextArc, arc, firstWord, space);
    } else if (rack.length > 0) {
        var lastLetter = null;
        rack.forEach(function (letter) {
            if (letter === lastLetter)
                return;
            lastLetter = letter;
            if (letter === '?') {
                var allChars = this.arcChar(arc);
                var chars = (allChars !== null)?allChars.split(''):[];
                for (var blankLetter in this.arcState(arc)) {
                    if (blankLetter === '>')
                        continue;
                    if (chars.indexOf(blankLetter) == -1)
                        chars.push(blankLetter);
                }
                chars.forEach(function (blankLetter) {
                    if (!this.allowedHere(anchor, pos, blankLetter)) 
                        return;
                    var nextArc = this.nextArc(arc, blankLetter);
                    this.goOn(anchor, pos, blankLetter.toLowerCase(), result, this.rackMinus(rack, letter), nextArc, arc, firstWord, space);
                }, this);
            } else {
                if (!this.allowedHere(anchor, pos, letter)) {
                    // log(space + 'xxxxxxxx');
                    return;
                }
                var nextArc = this.nextArc(arc, letter);
                // log(space + 'l: ' + letter);
                this.goOn(anchor, pos, letter, result, this.rackMinus(rack, letter), nextArc, arc, firstWord, space);
            }
        }, this);
    }
};

Solver.prototype.recordPlay = function(word, anchor, pos, rack, firstWord) {
    // log('Record: ' + word + ' anchor: ' + JSON.stringify(anchor) + ' pos ' + pos);
    var p = anchor.move(pos);
    var key = word + (p.x + (p.y * this.grid.size)) + (p.horizontal?'h':'v');
    if (this.wordDict[key] !== undefined) {
        // log('already found');
        return;
    }
    this.wordDict[key] = true;
    var score = this.grid.validateMove(word, p.x, p.y, p.horizontal, firstWord, this.rack.length - rack.length);
    // log('located at ' + p.x + ', ' + p.y + ' ' + key + ' = ' + score);
    // log('Score: ' + score + ' firstWord ' + firstWord);
    if (score == -1) {
        return;
    }
    // if (word == 'ADROIT') {
    //     log('record...' + p.x + ',' + p.y + (p.horizontal?'h ':'v ') + word);
    //     log('Template: ' + this.template.letter(p.x, p.y));
    //     log('Rack: ' + rack);
    // }
    this.results.push(new Result(null, null, word, p.x, p.y, p.horizontal, score, rack));
    // result. = '';
};

Solver.prototype.goOn = function(anchor, pos, l, result, rack, newArc, oldArc, firstWord, space) {
    // space += '  ';
    // var movedAnchor = anchor.move(pos);
    // log(space + 'goOn newArc ' + JSON.stringify(newArc) + ' oldArc: ' + JSON.stringify(oldArc));// + '\n' + space + JSON.stringify(this.arcState(newArc)));
    // log(space + 'pos: ' + pos);
    // log(space + 'l: ' + l);
    var L = l.toUpperCase();
    if (pos <= 0) {
        var leftPos = anchor.move(pos - 1);
        result = l + result;
        // log(space + 'result: ' + result);
        // log(space + 'letter on arc: ' + this.letterOnArc(oldArc, l.toUpperCase()));
        // log(space + 'empty left:' + this.grid.cellEmpty(leftPos.x, leftPos.y));
        if (this.letterOnArc(oldArc, L) &&
            this.grid.cellEmpty(leftPos.x, leftPos.y) &&
            this.template.cellEmpty(leftPos.x, leftPos.y)) {
                // log(space + 'record1 ' + result + ' at ' + anchor.x + ',' + anchor.y + ' pos: ' + pos + ' letter ' + l);
            this.recordPlay(result, anchor, pos, rack, firstWord);
        }
        if (newArc !== null) {
            // log(space + 'new arc and room left:' + this.grid.roomLeft(anchor, pos));
            if (anchor.lookLeft && this.grid.roomLeft(anchor, pos) && this.template.roomLeft(anchor, pos)) {
                this.gen(anchor, pos - 1, result, rack, newArc, firstWord, space);
            }
            newArc = this.nextArc(newArc, this.grid.lexicon.separator);
            // log(space + 'Sep arc: ' + newArc);
            // log(space + 'empty left:' + this.grid.cellEmpty(leftPos.x, leftPos.y));
            // log(space + 'room right:' + this.grid.roomRight(anchor, 0));
            if (newArc !== null &&
                this.grid.cellEmpty(leftPos.x, leftPos.y) &&
                this.template.cellEmpty(leftPos.x, leftPos.y) &&
                this.grid.roomRight(anchor, 0) &&
                this.template.roomRight(anchor, 0)) {
                this.gen(anchor, 1, result, rack, newArc, firstWord, space);
            }
        }
    } else {
        result += l;
        var rightPos = anchor.move(pos + 1);
        // log(space + 'chars: ' + this.arcChar(oldArc));
        if (this.letterOnArc(oldArc, L)) {
            if (this.grid.cellEmpty(rightPos.x, rightPos.y) &&
                this.template.cellEmpty(rightPos.x, rightPos.y)) {
                // log(space + 'record2 ' + result + ' at ' + anchor.x + ',' + anchor.y + ' pos: ' + pos + ' letter ' + l);
                this.recordPlay(result, anchor, pos - result.length + 1, rack, firstWord);
            }
        } else {
            var sepArc = this.nextArc(oldArc, this.grid.lexicon.separator);
            // log(space + 'LETTER NOT ON ARC TRY SEP: ' + this.grid.lexicon.separator + ' ' + sepArc);
            if (sepArc) {
                // log('Separator found moving right: ' + JSON.stringify(sepArc));
                if (this.letterOnArc(sepArc, L)) {
                    if (this.grid.cellEmpty(rightPos.x, rightPos.y) &&
                        this.template.cellEmpty(rightPos.x, rightPos.y)) {
                    // log(space + 'record3 ' + result + ' at ' + anchor.x + ',' + anchor.y + ' pos: ' + pos + ' letter ' + l);
                        this.recordPlay(result, anchor, anchor.x + pos - result.length - 1, rack, firstWord);
                    }
                }
            }
        }
        var right = pos + 1;
        if (newArc !== null && 
            this.grid.roomRight(anchor, pos) &&
            this.template.roomRight(anchor, pos)) {
            this.gen(anchor, pos + 1, result, rack, newArc, firstWord, space);
        }
    }
};

var Query = function(rack, bag, grid, firstWord) {
    this.rack = rack.slice(0);
    this.bag = bag.slice(0);
    this.grid = new Grid(grid);
    this.firstWord = firstWord;
}

Solver.prototype.processQuery = function(query) {
    this.rack = query.rack;
    this.bag = query.bag;
    this.grid = query.grid;
    var firstWord = query.firstWord;

    this.fillRack(this.rack, this.bag);
    // log('Starting Rack: ' + this.rack);
    // log('bag: ' + this.bag.join(''));
    
    // var result = new Result(null, null, null, 0, 0, true, 0);

    this.results = [];

    // this.preferredMoves.forEach(function (move) {
    //     var rack = this.rack.slice(0);
    //     if (!this.testPreferredMove(move, rack))
    //         return;
    //     // it works so just need to score and fix the rack
    //     var anchor = new Anchor(a.col, a.row, a.horizontal);
    //     this.recordPlay(a.word, anchor, 0, rack, firstWord)
    // }, this);

    // if (this.results.length != 0) {
    //     log("PLAYING PREFERRED MOVES! " + this.results.length);
    // }

    if (this.results.length == 0) {

        var anchors = this.getAnchors(firstWord);

        this.wordDict = {};
        // log('Found: ' + anchors.length + ' anchors');
        anchors.forEach(function (anchor, i) {
            // log(i);
            this.gen(anchor, 0, "", query.rack.slice(0), this.grid.lexicon.initialArc(), firstWord);
            // log(' ' + i);
        }, this);
    }

    this.results.sort(function(a,b){
        var al = a.word.length;
        var bl = b.word.length;
        if (al < bl)
            return -1;
        else if (al > bl)
            return 1;

        if (a.score > b.score)
            return 1;
        else if (a.score < b.score)
            return -1;
        return 0;
    });


    // log("Results: " + this.results.join('\n'));
    // log("Found " + this.results.length + " words");
    // this.results = this.results.unique();
    // log("Found " + this.results.length + " unique words");

    // this.results.forEach(function (r) {
    //     log(' ' + r.word + ' = ' + r.score + ' ' + r.col + ',' + r.row + ' ' + r.horizontal);
    //     if (r.score > result.score) {
    //         result = r;
    //     }
    // }, this);
    return this.results;
}

var SearchState = function(problem, grid, bag, rack, firstWord, percentWork, depth) {
    this.finalScore = 0;
    this.totalScore = 0;
    this.foundWords =[];
    this.firstWord = firstWord;
    this.problem = problem;
    this.grid = grid;
    this.bag = bag;
    this.rack = rack;
    this.percentWork = percentWork;
    this.depth = depth;
}

SearchState.prototype.copy = function(other) {
    this.finalScore = other.finalScore;
    this.totalScore = other.totalScore;
    this.foundWords = other.foundWords;
    this.firstWord = other.firstWord;
    this.problem = other.problem;
    this.grid = other.grid;
    this.bag = other.bag;
    this.rack = other.rack;
    this.percentWork = other.percentWork;
    this.depth = other.depth;
};

Solver.prototype.processState = function(states, bestFinalState, i) {
    var state = states.pop();
    var results = null;
    var q = null;


    if (state.bag.length > 0 || state.rack.length > 0)
    {
        q = new Query(state.rack, state.bag, state.grid, state.firstWord);
        results = this.processQuery(q);
    }

    var newStates = this.processResults(bestFinalState, i, state, results, q);
    newStates.forEach(function (s) {
        states.push(s);
    });

    if (states.length > 0)
        setImmediate(this.processState.bind(this), states, bestFinalState, i);
}

Solver.prototype.processResults = function(bestFinalState, i, state, results, q) {

    var states = [];
    i++;

    if (results === null || results.length === 0) {
        if (state.finalScore == 0) {
            this.percentDone += state.percentWork;
            this.grid = state.grid;
            // log("Remaining rack: " + state.rack);
            // log("Remaining bag: " + state.bag);
            var bagScore = this.grid.scoreWord(state.bag.join(''));
            var rackScore = this.grid.scoreWord(state.rack.join(''));
            state.finalScore = (state.totalScore - bagScore - rackScore);

                this.totalBoards++;
            if (i > 1000) {
                log("Total Score: " + state.totalScore  + 
                    " bagScore: -" + bagScore + 
                    " rackScore: -" + rackScore + 
                    " Final Score: " + state.finalScore +
                    " / " + bestFinalState.finalScore +
                    "  " + (this.percentDone * 100) + "%" +
                    " Depth: " + state.depth +
                    " Boards: " + (this.totalBoards) + 
                    " / " + ((this.totalBoards)/this.percentDone).toFixed(0));
                log(state.foundWords.map(function(f) {return f[1]}).join(','));
                console.timeEnd('1000 Queries');
                i = 0;
                console.time('1000 Queries');
            }

            if (state.finalScore > bestFinalState.finalScore) {
                bestFinalState.copy(state);
                this.saveProgress(state.grid, state.foundWords);
                state.grid.print();
                log('Result\n' + this.problem + ': ' + state.foundWords.map(function(f) {return f.join(' ');}).join(','));
                log("Total Score: " + state.totalScore  + 
                    " bagScore: -" + bagScore + 
                    " rackScore: -" + rackScore + 
                    " Final Score: " + state.finalScore +
                    " / " + bestFinalState.finalScore +
                    "  " + (this.percentDone * 100) + "%" +
                    " Depth: " + state.depth +
                    " Boards: " + this.totalBoards + "k");
                // process.exit();
            }
            // endStates.push(state);
        }
    } else {

        var percentWork = state.percentWork / results.length;
        
        var resultScoreCutoff = 0;

        results.some(function(result, k) {
            // log('From word: ' + result.word + ' ' + result.score);
            var newState = new SearchState(state.problem, new Grid(q.grid), q.bag, result.rack, false, percentWork, state.depth + 1);
            // log("Next state: " + newState.rack + ' and bag ' + newState.bag);
            newState.totalScore = state.totalScore + result.score;
            newState.foundWords = state.foundWords.slice(0);
            var position = this.ROWS[result.row] + this.COLUMNS[result.col];
            if (!result.horizontal) {
                position = this.COLUMNS[result.col] + this.ROWS[result.row];
            }
            newState.foundWords.push([position, result.word, result.score]);
            newState.grid.addWord(result.word, result.col, result.row, result.horizontal);
            states.push(newState);
            return false;//c > 1;
        }, this);
    }

    return states;
};

Solver.prototype.addTarget = function(word, col, row, horizontal, rack) {
    // word.split('').forEach(function(letter) {
    //     this.rackMinus(rack, letter);
    // }, this);

    this.template.addWord(word, col, row, horizontal);
    // var score = this.grid.validateMove(word, col, row, horizontal, true, 1);
    // log('Score: ' + score);
    // var q = new Query(state.rack, state.bag, state.grid, state.firstWord);
    // var result = new Result(null, null, word, col, row, horizontal, score, rack.slice(0));

    // return this.processResults(bestFinalState, 0, state, [result], q);

};

Solver.prototype.testPreferredMove = function(move, rack) {
    var word = move.word;
    var anchor = new Anchor(move.col, move.row, move.horizontal, false);
    var pos = 0;
    if (!this.grid.beforeEmpty(move.col, move.row, move.horizontal))
        return false;
    // Has the letters in the rack
    var failed = word.split('').some(function(letter) {
        pos++;
        if (this.rack.indexOf(letter) == -1) {
            if (this.rack.indexOf('?') == -1) {
                return true;
            } else {
                this.rackMinus(rack, '?');
            }
        } else {
            this.rackMinus(rack, letter);
        }
        return false;
    }, this);
    if (failed)
        return false;
    var last = anchor.move(pos);
    if (!this.grid.afterEmpty(anchor.x, anchor.y, anchor.horizontal))
        return false;
};

Solver.prototype.addPreferredMove = function(word, col, row, horizontal) {
    this.preferredMoves.push({word:word, col:col, row:row, horizontal:horizontal});
    this.addTarget(word, col, row, horizontal);
}

Solver.prototype.processAll = function() {
    this.percentDone = 0;
    this.totalBoards = 0;
    this.grid.print();
    this.grid.lexicon = this.lexicon;

    if (this.grid.lexicon.findWord('TE')) {
        log('ERROR can find word TE!');
        return;
    }
    if (this.grid.lexicon.findWord('EASOZ')) {
        log('ERROR can find word EASOZ!');
        return;
    }

    var bestFinalState = new SearchState();
    var searchState = new SearchState(this.problem, this.grid, this.bag, this.rack, true, 1, 0);

    this.addTarget("OXYPHENBUTAZONE", 0, 0, true, this.rack);
    this.addPreferredMove('OX',0,0,true);
    this.addPreferredMove('OXY',0,0,true);
    this.addPreferredMove('OXYPHENBUTAZONE',0,0,true);
    this.addPreferredMove('HE',4,0,true);
    this.addPreferredMove('HEN',4,0,true);
    this.addPreferredMove('EN',5,0,true);
    this.addPreferredMove('BUT',7,0,true);
    this.addPreferredMove('UT',8,0,true);
    this.addPreferredMove('UTA',8,0,true);
    this.addPreferredMove('TA',9,0,true);
    this.addPreferredMove('AZO',10,0,true);
    this.addPreferredMove('AZON',10,0,true);
    this.addPreferredMove('ZONE',11,0,true);
    this.addPreferredMove('ON',12,0,true);
    this.addPreferredMove('ONE',12,0,true);
    this.addPreferredMove('NE',13,0,true);

    this.addPreferredMove('OX',0,0,false);
    this.addPreferredMove('HE',4,0,false);
    this.addPreferredMove('EN',5,0,false);
    this.addPreferredMove('BUT',7,0,false);
    this.addPreferredMove('UT',8,0,false);
    this.addPreferredMove('TA',9,0,false);
    this.addPreferredMove('AZO',10,0,false);
    this.addPreferredMove('ON',12,0,false);
    this.addPreferredMove('NE',13,0,false);

    // this.addTarget("BENZODIAZEPINES", 7, 0, false, this.rack);

    // this.addPreferredMove('BE',7,0,false);
    // // this.addPreferredMove('BE',7,0,false);
    // // this.addPreferredMove('BENZODIAZEPINE',7,0,false);
    // // this.addPreferredMove('BENZODIAZEPINE',7,0,false);
    // this.addPreferredMove('EN',7,1,false);
    // this.addPreferredMove('OD',7,4,false);
    // this.addPreferredMove('PI',7,10,false);
    // // this.addPreferredMove('PIN',7,10,false);
    // // this.addPreferredMove('PINE',7,10,false);
    // // this.addPreferredMove('PINES',7,10,false);
    // this.addPreferredMove('IN',7,11,false);
    // this.addPreferredMove('NE',7,12,false);
    // this.addPreferredMove('ES',7,13,false);

    log('Aiming for:');
    this.template.print();

    var states = [searchState];
    // var states = this.placeWord(searchState, bestFinalState, "BENZODIAZEPINES", 7, 0, false, this.rack);
    // states[0].firstWord = true;
    // return;

    var i = 0;
    console.time('1000 Queries');
    setImmediate(this.processState.bind(this), states, bestFinalState, i);

};
