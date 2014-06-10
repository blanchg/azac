
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

var Result = function(replacements, hook, word, col, row, horizontal, score) {
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

Anchor.prototype.move = function(pos) {
    if (this.horizontal) {
        return new Anchor(this.x + pos, this.y, this.horizontal);
    } else {
        return new Anchor(this.x, this.y + pos, this.horizontal);
    }
};

Solver.prototype.getAnchors = function(firstWord) {
    var result = [];
    if (firstWord)
    {
        result.push(new Anchor(6,7,true));
        // result.push(new Anchor(7,6,false));
    } else {
        // TODO
    }
    return result;
}

Solver.prototype.nextArc = function(arc, l) {
    // log('Next arc ' + JSON.stringify(arc) + ' letter ' + l);
    var state = this.grid.lexicon.stateSets[arc.s];
    if (state !== undefined && state.hasOwnProperty(l)) {
        return state[l];
    } else {
        return null;
    }
};
Solver.prototype.arcState = function(arc) {
    if (this.grid.lexicon.stateSets.hasOwnProperty(arc.s))
        return this.grid.lexicon.stateSets[arc.s];
    return null;
}
Solver.prototype.arcChar = function(arc) {
    if (arc.hasOwnProperty("cs") && this.grid.lexicon.cs.hasOwnProperty(arc.cs))
        return this.grid.lexicon.cs[arc.cs];
    return null;
}
Solver.prototype.letterOnArc = function(arc, letter) {
    if (!arc)
        return false;
    var chars = this.arcChar(arc);
    var result = chars !== null && chars.indexOf(letter) != -1
    // log('arc: ' + JSON.stringify(arc) + '\n  letter: ' + letter + '\n  chars: ' + chars + '\n==' + result);
    return result;
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
    // TODO
    return true;
};

Solver.prototype.gen = function(anchor, pos, result, rack, arc) {
    // log('Gen arc ' + JSON.stringify(arc));
    rack = rack.slice(0).sort();
    var l = this.grid.letter(anchor.x, anchor.y);
    if (l !== null) {
        var nextArc = this.nextArc(arc, l);
        if (nextArc !== null)
            this.goOn(anchor, pos, l, result, rack, nextArc, arc);
    } else if (rack.length > 0) {
        var lastLetter = null;
        rack.forEach(function (letter) {
            if (letter == lastLetter)
                return;
            lastLetter = letter;
            if (letter === '?') {
                for (var blankLetter in this.arcState(arc)) {
                    if (!this.allowedHere(anchor, pos, blankLetter))
                        continue
                    var nextArc = this.nextArc(arc, blankLetter);
                    this.goOn(anchor, pos, letter, result, this.rackMinus(rack, letter), nextArc, arc);
                }
            } else {
                if (!this.allowedHere(anchor, pos, letter))
                    return;
                var nextArc = this.nextArc(arc, letter);
                this.goOn(anchor, pos, letter, result, this.rackMinus(rack, letter), nextArc, arc);
            }
        }, this);
    }
};

Solver.prototype.recordPlay = function(result, anchor, pos) {
    var p = anchor.move(pos);
    log('record...' + p.x + ',' + p.y + (p.horizontal?'h ':'v ') + result);
    this.results.push(new Result(null, null, result, p.x, p.y, p.horizontal, 0));
    // result. = '';
};

Solver.prototype.goOn = function(anchor, pos, l, result, rack, newArc, oldArc) {
    // log('goOn newArc ' + JSON.stringify(newArc));
    if (pos <= 0) {
        var leftPos = anchor.move(pos - 1);
        result = l + result;
        if (this.letterOnArc(oldArc, l) &&
            this.grid.cellEmpty(leftPos.x, leftPos.y)) {
            this.recordPlay(result, anchor, pos);
        }
        if (newArc !== null) {
            if (this.grid.roomLeft(anchor, pos)) {
                this.gen(anchor, pos - 1, result, rack, newArc);
            }

            var newArc = this.nextArc(newArc, '>');
            if (newArc !== null &&
                this.grid.cellEmpty(leftPos.x, leftPos.y) &&
                this.grid.roomRight(anchor, 0)) {
                this.gen(anchor, 1, result, rack, newArc);
            }
        }
    } else if (pos > 0) {
        result += l;
        if (this.letterOnArc(oldArc, l) && 
            this.grid.cellEmpty(anchor.move(pos).x, anchor.move(pos).y)) {
            this.recordPlay(result, anchor, pos);
        }
        var right = pos + 1;
        if (newArc !== null && 
            this.grid.roomRight(anchor, pos)) {
            this.gen(anchor, pos + 1, result, rack, newArc);
        }
    }
};

Solver.prototype.processAll = function() {
try {
    log('ready to process');

    var totalScore = 0;
    var foundWords = [];
    var firstWord = true;

    this.grid.print();
    this.grid.lexicon = this.lexicon;
    var col = 3;
    var row = 7;
    while (this.bag.length > 0 || this.rack.length > 0)
    {
        this.fillRack(this.rack, this.bag);
        log('Starting Rack: ' + this.rack);
        log('bag: ' + this.bag.join(''));
        
        var result = new Result(null, null, null, 0, 0, true, 0);

        var anchors = this.getAnchors(firstWord);
        firstWord = false;

        this.results = [];
        anchors.forEach(function (anchor) {
            this.gen(anchor, 0, "", this.rack, this.grid.lexicon.initialArc());
        }, this);

        this.results.sort();
        log("Results: " + this.results.join('\n'));

        // if (firstWord) {
        //     col = 7;
        //     for (row = 1; row < this.grid.size / 2; row++) {
        //         this.processRack(col, row, this.rack, [], '', firstWord, false, result);
        //     };
        //     row = 7;
        //     for (col = 1; col < this.grid.size / 2; col++) {
        //         this.processRack(col, row, this.rack, [], '', firstWord, true, result);
        //     }
        //     firstWord = false;
        // } else {
        //     var hookRow;
        //     var hookCol;
        //     var hookLetters;
        //     for (row = 0; row < this.grid.size; row++) {
        //         for (col = 0; col < this.grid.size; col++) {
        //             hookCol = col;
        //             hookLetters = [];
        //             for (hookRow = row; hookRow < this.grid.size; hookRow++) {
        //                 var cell = this.grid.cell(hookCol, hookRow);
        //                 var rawCell = this.grid.rawCell(hookCol, hookRow);
        //                 if (cell != rawCell) {
        //                     hookLetters.push('?');
        //                 } else {
        //                     hookLetters.push(rawCell);
        //                 }
        //             };
        //             if (this.grid.beforeEmpty(col, row, false))
        //                 this.processRack(col, row, this.rack.slice(0), [], hookLetters.join(''), firstWord, false, result);
        //             hookRow = row;
        //             hookLetters = [];
        //             for (hookCol = col; hookCol < this.grid.size; hookCol++) {
        //                 var cell = this.grid.cell(hookCol, hookRow);
        //                 var rawCell = this.grid.rawCell(hookCol, hookRow);
        //                 if (cell != rawCell) {
        //                     hookLetters.push('?');
        //                 } else {
        //                     hookLetters.push(rawCell);
        //                 }
        //             };
        //             if (this.grid.beforeEmpty(col, row, true))
        //                 this.processRack(col, row, this.rack.slice(0), [], hookLetters.join(''), firstWord, true, result);
        //         }
        //     };
        // }

        

        log('word: ' + result.word);
        if (!result.word || result.word.length == 0)
        {
            log("Reached end rack " + this.rack.join("") + " bag " + this.bag.length);
            break;
        }
        // log("Scoring word: " + word + ' replacements: ' + wordReplacements + ' hook: ' + wordHook);
        var wordRack = this.rack.slice(0).join('');
        this.rack = this.reduceRack(this.rack.slice(0), result.word, result.hook.split(''), true, result.replacements);
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