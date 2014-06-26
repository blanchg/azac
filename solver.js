
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
    this.lexicon = null;
    this.bag = [];
    this.problem = '?';
}

module.exports = Solver;

// Modifies rack and bag which are both arrays
Solver.prototype.fillRack = function(rack, bag) {
    while (rack.length < 7 && bag.length > 0) {
        rack.push(bag.shift());
    }
}

// rack and hook should be arrays
// word is a string
Solver.prototype.rackLength = function(rack, word, hook, replacements) {
    var result = this.reduceRack(rack, word, hook, false, replacements);
    if (result !== null)
        return result.length;
    else 
        return -1;
}

Solver.prototype.reduceRack = function(rack, word, hook, debug, replacements) {
    if (debug) {
        log("input word: " + word)
        log("input hook: " + hook);
        log("input rack: " + rack);
        log("input replacements: " + replacements);
    }
    var failed = word.split('').some(function(letter, i) {
        // if (letter === letter.toLowerCase())
        //     return false;
        var place = '?';
        if (hook.length > i) {
            place = hook[i];
        }
        if (debug) {
            log('hook ' + place + " letter " + letter);
        }
        if (place !== '?') {
            // letter in word matches hook so don't take it from the rack
            if (place.toUpperCase() === letter.toUpperCase()) {
                return false;
            } else {
                if (debug) {
                    log('Letter in word ' + letter + ' doesn\'t match place in hook ' + place)
                }
                return true;
            }
        }
        var index = rack.indexOf(letter);
        if (index === -1) {
            if (debug)
                log('letter ' + letter + ' not in rack checking replacements ')
            index = replacements.indexOf(letter);
            if (index !== -1) {
                replacements.splice(index,1);
                if (debug)
                    log('r ' + replacements + " replaced " + letter + ' with ?');

                // index = rack.indexOf(letter.toLowerCase());
                // if (index !== -1) {
                //     rack.splice(index,1);
                //     // return false;
                // }

                letter = '?';
                index = rack.indexOf(letter.toLowerCase());
                if (index !== -1) {
                    rack.splice(index,1);
                    // return false;
                }

            } else {
                if (debug)
                    log("Rack " + rack + " doesn't have " + letter + " from word " + word + " hook " + hook)
                return true;
            }
        } else {
            rack.splice(index,1);
        }
        return false;
    }, this);
    if (failed)
    {
        return null;
    } else {
        // log("Returning rack: '" + rack.join('') + "'");
        return rack;
    }
}

Solver.prototype.permutations = function(string) {
  return Combinatorics.permutationCombination(string.split(''));
};

Solver.prototype.processRack = function(col, row, rack, replacements, hook, firstWord, horizontal, result) {
    // log("process hook " + hook);
    var index = rack.indexOf('?');
    if (index != -1) {

        log('Rack: ' + rack.join(''));
        // log("Replace ? in rack: " + rack.join(""));
        this.lowerAlphabet.forEach(function(letter) {
            var filledRack = rack.slice(0);
            filledRack[index] = letter;
            var r = replacements.slice(0);
            r.push(letter);
            this.processRack(col, row, filledRack, r, hook, firstWord, horizontal, result);
        }, this);
        return;
    } else {
        // log('   Rack: ' + rack.join(''));
    }



    var candidates = this.grid.lexicon.findWordsWithRackAndHook(rack.slice(0), hook);
    // log("Rack: " + rack.join("") + " In Bag: " + bag.length + " Candidates: " + candidates.length);
    if (!candidates || candidates.length == 0)
        return;

    candidates.forEach(
        function (item) {
            var itemCol = col;
            var itemRow = row;

            // log('Have word: ' + item);
            if (!this.grid.fits(itemCol,itemRow,horizontal,item))
                return;

            var leftOver = this.rackLength(rack.slice(0), item, hook.split(''), replacements.slice(0));
            // log("Left over: " + leftOver);
            var itemScore = this.grid.validateMove(item, itemCol, itemRow, horizontal, firstWord, rack.length - leftOver);
            if (itemScore > 0)
                log("(" + itemCol + ", " + itemRow + ") " + (horizontal?'h ':'v ') + item + " - " + hook + ' = ' + itemScore);

            if (itemScore > 0 && itemScore > result.score) {
                result.replacements = replacements;
                result.hook = hook;
                result.word = item;
                result.col = itemCol;
                result.row = itemRow;
                result.horizontal = horizontal;
                result.score = itemScore;
                log('^^^^^^ best so far');
            }
        }, this);

    return result;
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

var Anchor = function(x,y,horizontal) {
    this.x = x;
    this.y = y;
    this.horizontal = horizontal;
}

Solver.prototype.Anchor = Anchor;

Anchor.prototype.move = function(pos) {
    if (this.horizontal) {
        return new Anchor(this.x + pos, this.y, this.horizontal);
    } else {
        return new Anchor(this.x, this.y + pos, this.horizontal);
    }
};
Anchor.prototype.toString = function() {
    return this.x + ',' + this.y + (this.horizontal?'h':'v');
};

Solver.prototype.getAnchors = function(firstWord) {
    var result = [];
    if (firstWord)
    {
        result.push(new Anchor(7,7,true));
        // result.push(new Anchor(7,7,false));
    } else {
        this.grid.anchors.forEach(function(x, i) {
            if (x == 1) {
                result.push(new Anchor(Math.floor(i / this.grid.size), i % this.grid.size, false));
                result.push(new Anchor(Math.floor(i / this.grid.size), i % this.grid.size, true));
            }
        }, this);
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
    if (index == -1)
        return null;
    if (index == 0)
        return rack.slice(1);
    if (index == rack.length - 1)
        return rack.slice(0, index);
    return rack.slice(0, index).concat(rack.slice(index + 1));
};

Solver.prototype.allowedHere = function(anchor, pos, letter) {
    var p = anchor.move(pos);
    var prefix = this.grid.prefix(p.x, p.y, !p.horizontal);
    var suffix = this.grid.suffix(p.x, p.y, !p.horizontal);
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
    // log(space + ' grid letter: ' + l);
    if (l !== null) {
        var nextArc = this.nextArc(arc, l);
        this.goOn(anchor, pos, l, result, rack, nextArc, arc, firstWord, space);
    } else if (rack.length > 0) {
        // var lastLetter = null;
        rack.forEach(function (letter) {
            // if (letter === lastLetter)
            //     return;
            // lastLetter = letter;
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
    // log('record...' + p.x + ',' + p.y + (p.horizontal?'h ':'v ') + word);
    this.results.push(new Result(null, null, word, p.x, p.y, p.horizontal, score, rack));
    // result. = '';
};

Solver.prototype.goOn = function(anchor, pos, l, result, rack, newArc, oldArc, firstWord, space) {
    space += '  ';
    var movedAnchor = anchor.move(pos);
    // log(space + 'goOn newArc ' + JSON.stringify(newArc) + ' oldArc: ' + JSON.stringify(oldArc));// + '\n' + space + JSON.stringify(this.arcState(newArc)));
    // log(space + 'pos: ' + pos);
    // log(space + 'l: ' + l);
    if (pos <= 0) {
        var leftPos = anchor.move(pos - 1);
        result = l + result;
        // log(space + 'result: ' + result);
        // log(space + 'letter on arc: ' + this.letterOnArc(oldArc, l.toUpperCase()));
        // log(space + 'empty left:' + this.grid.cellEmpty(leftPos.x, leftPos.y));
        if (this.letterOnArc(oldArc, l.toUpperCase()) &&
            this.grid.cellEmpty(leftPos.x, leftPos.y)) {
                // log(space + 'record1 ' + result + ' at ' + anchor.x + ',' + anchor.y + ' pos: ' + pos + ' letter ' + l);
            this.recordPlay(result, anchor, pos, rack, firstWord);
        }
        if (newArc !== null) {
            // log(space + 'new arc and room left:' + this.grid.roomLeft(anchor, pos));
            if (this.grid.roomLeft(anchor, pos)) {
                this.gen(anchor, pos - 1, result, rack, newArc, firstWord, space);
            }
            newArc = this.nextArc(newArc, this.grid.lexicon.separator);
            // log(space + 'Sep arc: ' + newArc);
            // log(space + 'empty left:' + this.grid.cellEmpty(leftPos.x, leftPos.y));
            // log(space + 'room right:' + this.grid.roomRight(anchor, 0));
            if (newArc !== null &&
                this.grid.cellEmpty(leftPos.x, leftPos.y) &&
                this.grid.roomRight(anchor, 0)) {
                this.gen(anchor, 1, result, rack, newArc, firstWord, space);
            }
        }
    } else if (pos > 0) {
        result += l;
        var rightPos = anchor.move(pos + 1);
        // log(space + 'chars: ' + this.arcChar(oldArc));
        if (this.letterOnArc(oldArc, l.toUpperCase())) {
            if (this.grid.cellEmpty(rightPos.x, rightPos.y)) {
                // log(space + 'record2 ' + result + ' at ' + anchor.x + ',' + anchor.y + ' pos: ' + pos + ' letter ' + l);
                this.recordPlay(result, anchor, pos - result.length + 1, rack, firstWord);
            }
        } else {
            var sepArc = this.nextArc(oldArc, this.grid.lexicon.separator);
            // log(space + 'LETTER NOT ON ARC TRY SEP: ' + this.grid.lexicon.separator + ' ' + sepArc);
            if (sepArc) {
                // log('Separator found moving right: ' + JSON.stringify(sepArc));
                if (this.letterOnArc(sepArc, l.toUpperCase())) {
                    if (this.grid.cellEmpty(rightPos.x, rightPos.y)) {
                    // log(space + 'record3 ' + result + ' at ' + anchor.x + ',' + anchor.y + ' pos: ' + pos + ' letter ' + l);
                        this.recordPlay(result, anchor, anchor.x + pos - result.length - 1, rack, firstWord);
                    }
                }
            }
        }
        var right = pos + 1;
        if (newArc !== null && 
            this.grid.roomRight(anchor, pos)) {
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
    log('Starting Rack: ' + this.rack);
    log('bag: ' + this.bag.join(''));
    
    var result = new Result(null, null, null, 0, 0, true, 0);

    var anchors = this.getAnchors(firstWord);

    this.results = [];
    this.wordDict = {};
    log('Found: ' + anchors.length + ' anchors');
    anchors.forEach(function (anchor, i) {
        // log(i);
        this.gen(anchor, 0, "", this.rack.slice(0), this.grid.lexicon.initialArc(), firstWord);
        // log(' ' + i);
    }, this);

    // this.results.sort();
    // log("Results: " + this.results.join('\n'));
    log("Found " + this.results.length + " words");
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

var SearchState = function(problem, grid, bag, rack, firstWord) {
    this.finalScore = 0;
    this.totalScore = 0;
    this.foundWords =[];
    this.firstWord = firstWord;
    this.problem = problem;
    this.grid = grid;
    this.bag = bag;
    this.rack = rack;
}

Solver.prototype.processAll = function() {
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

    // var endStates = [];
    var bestFinalState = new SearchState();
    var searchState = new SearchState(this.problem, this.grid, this.bag, this.rack, true);
    var states = [];
    states.push(searchState);
    while(states.length > 0) {
        var state = states.pop();
        var results = null;
        var q = null;
        if (state.bag.length > 0 || state.rack.length > 0)
        {
            q = new Query(state.rack, state.bag, state.grid, state.firstWord);
            results = this.processQuery(q);
        }

        if (results === null || results.length === 0) {
            if (state.finalScore == 0) {
                this.grid = state.grid;
                log("Remaining rack: " + state.rack);
                log("Remaining bag: " + state.bag);
                var bagScore = this.grid.scoreWord(state.bag.join(''));
                var rackScore = this.grid.scoreWord(state.rack.join(''));
                state.finalScore = (state.totalScore - bagScore - rackScore);
                log("Total Score: " + state.totalScore  + 
                    " bagScore: -" + bagScore + 
                    " rackScore: -" + rackScore + 
                    " Final Score: " + state.finalScore +
                    " / " + bestFinalState.finalScore);

                if (state.finalScore > bestFinalState.finalScore) {
                    bestFinalState = state;
                    this.saveProgress(state.grid, state.foundWords);
                    state.grid.print();
                    log('Result\n' + this.problem + ':\n' + state.foundWords.map(function(f) {return f.join(' ');}).join(',\n'));
                }
                // endStates.push(state);
            }
        } else {

            results.forEach(function(result) {

                log('From word: ' + result.word + ' ' + result.score);

                if (result.word === null || result.word.length == 0)
                {
                    return true;
                }

                var newState = new SearchState(state.problem, new Grid(q.grid), q.bag, result.rack, false);
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
                return true;
            }, this);
        }
    }
};

Solver.prototype.processAllOld = function() {
try {
    log('ready to process');

    var totalScore = 0;
    var foundWords = [];
    var firstWord = true;

    this.grid.print();
    this.grid.lexicon = this.lexicon;
    var col = 3;
    var row = 7;

    if (this.grid.lexicon.findWord('TE')) {
        log('ERROR can find word TE!');
        return;
    }
    if (this.grid.lexicon.findWord('EASOZ')) {
        log('ERROR can find word EASOZ!');
        return;
    }

    while (this.bag.length > 0 || this.rack.length > 0)
    {
        this.fillRack(this.rack, this.bag);
        log('Starting Rack: ' + this.rack);
        log('bag: ' + this.bag.join(''));
        
        var result = new Result(null, null, null, 0, 0, true, 0);

        var anchors = this.getAnchors(firstWord);

        this.results = [];
        this.wordDict = {};
        log('Found: ' + anchors.length + ' anchors');
        anchors.forEach(function (anchor, i) {
            // log(i);
            this.gen(anchor, 0, "", this.rack.slice(0), this.grid.lexicon.initialArc(), firstWord);
            // log(' ' + i);
        }, this);

        this.results.sort();
        // log("Results: " + this.results.join('\n'));
        log("Found " + this.results.length + " words");
        // this.results = this.results.unique();
        // log("Found " + this.results.length + " unique words");

        this.results.forEach(function (r) {
            log(' ' + r.word + ' = ' + r.score + ' ' + r.col + ',' + r.row + ' ' + r.horizontal);
            if (r.score > result.score) {
                result = r;
            }
        }, this);
        firstWord = false;

        log('word: ' + result.word);
        if (!result.word || result.word.length == 0)
        {
            log("Reached end rack " + this.rack.join("") + " bag " + this.bag.length);
            break;
        }
        // log("Scoring word: " + word + ' replacements: ' + wordReplacements + ' hook: ' + wordHook);
        var wordRack = this.rack.slice(0).join('');
        this.rack = result.rack; //this.reduceRack(this.rack.slice(0), result.word, result.hook.split(''), true, result.replacements);
        var position = this.ROWS[result.row] + this.COLUMNS[result.col];
        if (!result.horizontal) {
            position = this.COLUMNS[result.col] + this.ROWS[result.row];
        }
        var remainingRack = this.rack.join('');
        if (result.hook) {
            log(position + ' ' + result.word + " off hook " + result.hook + " using " + wordRack + " leftover letters " + remainingRack + " scores " + result.score);
        } else {
            log(position + ' ' + result.word + " using " + wordRack + " leftover letters " + remainingRack + " scores " + result.score);
        }
        totalScore += result.score;
        log('total: ' + totalScore);
        foundWords.push([position, result.word, result.score]);
        this.grid.addWord(result.word, result.col, result.row, result.horizontal);
        this.grid.print();
        this.saveProgress(this.grid, foundWords);

    }
    var bagScore = this.grid.scoreWord(this.bag.join(''));
    var rackScore = this.grid.scoreWord(this.rack.join(''));
    log("Total Score: " + totalScore  + " bagScore: -" + bagScore + " rackScore: -" + rackScore + " Final Score: " + (totalScore - bagScore - rackScore));

} finally {
    log('Result\n' + this.problem + ':\n' + foundWords.map(function(f) {return f.join(' ');}).join(',\n'));
}
}