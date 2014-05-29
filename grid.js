var log = require('./util.js').log;
var clc = require('cli-color');
var ansiTrim = require('cli-color/trim');

var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var LETTERSCORES = '1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10'.split(',').map(function(item){return parseInt(item)});

function Grid(newSize) {
    if (newSize.constructor == Grid) {
        this.size = newSize.size;
        this.length = newSize.length;
        newSize.forEach(function(letter, index) {
            this[index] = letter;
        }, this);
    } else {
        this.size = newSize;
        this.length = this.size*this.size;
        this.fill(' ', 0, this.length);
        
        this.board = 
        "T  d   T   d  T" +
        " D   t   t   D " +
        "  D   d d   D  " +
        "d  D   d   D  d" +
        "    D     D    " +
        " t   t   t   t " +
        "  d   d d   d  " +
        "T  d   D   d  T" +
        "  d   d d   d  " +
        " t   t   t   t " +
        "    D     D    " +
        "d  D   d   D  d" +
        "  D   d d   D  " +
        " D   t   t   D " +
        "T  d   T   d  T";
        this.board.split('')
            .forEach(function(letter, index) {
                // log("Letter " + letter + " at " + index);
                this[index] = clc.bold(letter);
            }, this);
    }

    this.lexicon = null;

}


Grid.prototype = new Array();
Grid.prototype.constructor = Grid;


Grid.prototype.wordH = function(col, row, word) {
    var i = row * this.size + col;
    var that = this;
    word.split('').forEach(function (letter) {
        // log("Have that: " + this);
        this[i++] = letter;
    }, that);
    // this.print();
}

Grid.prototype.wordV = function(col, row, word) {
    var i = 0;
    var that = this;
    word.split('').forEach(function (letter) {
        // log("Have that: " + this);
        var index = (row + i++) * this.size + col
        this[index] = letter;
    }, that);
    // this.print();
}

Grid.prototype.addWord = function(word, col, row, horizontal) {
    if (horizontal) {
        this.wordH(col, row, word);
    } else {
        this.wordV(col, row, word);
    }
}

Grid.prototype.fits = function(col, row, horizontal, word) {
	if (col < 0 || row < 0)
		return false;
	if (horizontal) {
		if (col + word.length > this.size)
			return false;
	} else {
		if (row + word.length > this.size)
			return false;
	}

	var result = !word.split('').some(function (letter) {
		var rawCell = this.rawCell(col, row);
		var cell = this.rawCell(col, row);
		// log('Letter ' + letter + ' fits ' + rawCell + ' ' + cell + ' (' + col + ', ' + row + ')');
		if (horizontal)
		{
			col++;
		} else {
			row++;
		}
		if (rawCell != letter && cell == ansiTrim(rawCell))
		{
			// Doesn't match letter already on board
			return true;
		}
		// Blank or matches previous piece
		return false;
	}, this);
	// log(word + ' fits ' + (!result));
	return result;
}

Grid.prototype.rawCell = function(col, row) {
	if (row >= this.size || col >= this.size) {
		return null;
	}
    var i = row * this.size + col;
    return this[i];
}

Grid.prototype.cell = function(col, row) {
	if (row >= this.size || col >= this.size) {
		return null;
	}
    var i = row * this.size + col;
    return ansiTrim(this[i]);
}

Grid.prototype.print = function () {
    var i = 0;
    for (var x = 0; x < this.size; x++) {
        log('|' + this.slice(x * this.size,x*this.size + this.size).join('') + '|');
    };
}

Grid.prototype.clone = function() {
    return new Grid(this);
}

Grid.prototype.scoreWord = function(word) {
	return word.split('').reduce(function(prev, letter) {
		return prev + this.scoreLetter(letter);
	}.bind(this), 0);
}

Grid.prototype.scoreLetter = function(letter) {
    var score = LETTERSCORES[ALPHABET.indexOf(letter)];
    if (isNaN(score))
        return 0;
    return score;
}

Grid.prototype.wordMultiplier = function(cell) {
    switch(cell) {
        case clc.bold('T'):
            return 3;
        case clc.bold('D'):
            return 2;
        default:
            return 1;
    } 
}

Grid.prototype.letterMultiplier = function(cell) {

    switch(cell) {
        case clc.bold('t'):
            return 3;
        case clc.bold('d'):
            return 2;
        default:
            return 1;
    } 
}

Grid.prototype.cellEmpty = function(col, row) {
	var rawCell = this.rawCell(col, row);
	var cell = this.cell(col, row); 
	return cell !== rawCell || cell === ' ';
}

Grid.prototype.prefix = function(col, row, horizontal) {
	var word = '';
	if (!this.cellEmpty(col, row))
		return word;
	if (horizontal) {
		for (var itemCol = col-1; itemCol > 0; itemCol--) {
			if (this.cellEmpty(itemCol, row)) {
				break;
			}
			word = this.cell(itemCol, row) + word;
		};
	} else {
		for (var itemRow = row-1; itemRow > 0; itemRow--) {
			if (this.cellEmpty(col, itemRow))
				break;
			word = this.cell(col, itemRow) + word;
		};
	}
	return word;
}

Grid.prototype.suffix = function(col, row, horizontal) {
	var word = '';
	if (!this.cellEmpty(col, row))
		return word;
	if (horizontal) {
		for (var itemCol = col+1; itemCol < this.size; itemCol++) {
			if (this.cellEmpty(itemCol, row)) {
				break;
			}
			word += this.cell(itemCol, row);
		};
	} else {
		for (var itemRow = row+1; itemRow < this.size; itemRow++) {
			if (this.cellEmpty(col, itemRow))
				break;
			word += this.cell(col, itemRow);
		};
	}
	return word;
}

/**
 * Takes a word as a string, a column and a row and if it is a horizontal word

Place letters one-by-one onto the board
    For each one, check if there are any existing letters to the immediate left or right (above/below if the move is horizontal).
    If yes, grab the subword to the left of this position (in this case, ‘SQUAT’), append this letter, then add the subword to the right of this position (nothing this time).
    Validate this hook against the lexicon.
    Score the letters appropriately - multipliers on existing letters don’t count, but whatever multiplier the current letter is sitting on will apply. This should be done while grabbing the prefix and suffix for the hook.
Validate the “main” word and calculate the score appropriately.

 **/
Grid.prototype.validateMove = function(word, col, row, horizontal, firstWord, rackLength) {
    if (!this.fits(col, row, horizontal, word))
        return -1;
    var totalScore = 0;
    var totalWordMultiplier = 1;
    var foundAltWord = false;
    var foundHook = false;
    var foundMiddle = false;
    var middleColRow = Math.floor(this.size / 2);
    var failed = word.split('').some(function(letter, i) {
        var cellCol = horizontal?col+i:col;
        var cellRow = !horizontal?row+i:row;
        var rawCell = this.rawCell(cellCol, cellRow);
        
        // Outside of grid or word in place
        if (rawCell === null)
            return true;

        var cell = this.cell(cellCol, cellRow);
        if (cell === rawCell && cell === letter) {
            foundHook = true;
        }

        if (cellCol === middleColRow && cellRow === middleColRow) {
            foundMiddle = true;
        }

        var letterMultiplier = this.letterMultiplier(rawCell);
        var letterScore = this.scoreLetter(letter);
        var wordMultiplier = this.wordMultiplier(rawCell)
        var altScore = 0;
        if (this.lexicon !== null) {
        	// log(cellCol + ', ' + cellRow + ' ' + horizontal);
            var prefix = this.prefix(cellCol, cellRow, !horizontal);
            var suffix = this.suffix(cellCol, cellRow, !horizontal);
            // log('p ' + prefix + ' s ' + suffix);
            var altWord = prefix + letter + suffix;
            if (altWord.length > 1) {

                log('alt word: ' + altWord);
	            if (this.lexicon.findWord(altWord.toUpperCase())) {
	            	altScore = this.scoreWord(prefix) + this.scoreWord(suffix) + (letterScore * letterMultiplier);
	            	altScore *= wordMultiplier;
                    foundAltWord =  true;
	            } else {
                    return true;
                }
	        }
		}

        // log(rawCell + ' ' + letter + ' ' + letterScore + ' * ' + letterMultiplier + ' + ' + altScore + ' = ' + (letterScore * letterMultiplier + altScore));
        totalScore += letterScore * letterMultiplier + altScore;
        totalWordMultiplier = totalWordMultiplier * wordMultiplier;

        return false;
    }, this);

    if (failed)
        return -1;

    if (firstWord) {
        if (!foundMiddle) {
            // log("not through middle")
            return -1;
        }
    } else {
        if (!foundAltWord && !foundHook)
        {
            // log("not alt word or not hook")
            return -1;
        }
    }

    totalScore = totalScore * totalWordMultiplier;

    if (rackLength === 0)
    {
        totalScore += 50;
    }
    return totalScore;
}


module.exports.Grid = Grid;