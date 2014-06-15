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
        this.anchors = new Array(this.length);
        this.anchors.fill(0, 0, this.length);
        
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
                if (letter == ' ')
                	letter = '·';
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
    var start = row * this.size + Math.max(col - 1, 0);
    var end = row * this.size + Math.min(this.size, col + word.length + 1);
    // log(start + ' ' + end);
    this.anchors.fill(1, start, end);

    var row1 = Math.max(row - 1, 0) * this.size;
    start = row1 + col;
    end = start + word.length;
    this.anchors.fill(1, start, end);

    start = Math.min(row + 1, this.size) * this.size + col;
    end = Math.min(row + 1, this.size) * this.size + col + word.length;
    this.anchors.fill(1, start, end);
    // for (var x = start; x < end; x++) {
    // 	this.anchors[y * this.size]
    // };
    // this.anchors.fill(1, Math.max(i - 1,, Math.min(i + word.length, row*this.size + this.size));
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
    var start = Math.max(row - 1, 0);
    var end = Math.min(this.size, row + word.length + 1);
    for (var y = start; y < end; y++) {
    	this.anchors[y * this.size + col] = 1;
    };

    var col1 = Math.max(col - 1, 0);
    start = row;
    end = row + word.length;
    for (var y = start; y < end; y++) {
    	this.anchors[y * this.size + col1] = 1;
    };

    col1 = Math.min(col + 1, this.size);
    start = row;
    end = row + word.length;
    for (var y = start; y < end; y++) {
    	this.anchors[y * this.size + col1] = 1;
    };
}

Grid.prototype.addWord = function(word, col, row, horizontal) {
    if (horizontal) {
        this.wordH(col, row, word);
    } else {
        this.wordV(col, row, word);
    }
}

Grid.prototype.roomLeft = function(anchor, pos) {
    if (anchor.horizontal) {
        return (anchor.x + pos) - 1 >= 0;
    } else {
    	// log('    rl ' + anchor.y + ' + ' + pos + ' - 1 ');
        return (anchor.y + pos) - 1 >= 0;
    }
}

Grid.prototype.roomRight = function(anchor, pos) {
    if (anchor.horizontal) {
        return anchor.x + pos + 1 < this.size;
    } else {
        return anchor.y + pos + 1 < this.size;
    }
}

Grid.prototype.fits = function(col, row, horizontal, word) {
	if (col < 0 || row < 0) {
		// log('off start of board');
		return false;
	}
	if (horizontal) {
		if (col + word.length > this.size) {
			// log('off end of board');
			return false;
		}
	} else {
		if (row + word.length > this.size) {
			// log('ff end of board');
			return false;
		}
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
			// log('doesn\'t match letter on board');
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
    var val = this[i];
    // if (val === null || val === undefined) {
    // 	log('called with ' + col + ', ' + row);
    // }
    return ansiTrim(val);
}

Grid.prototype.letter = function(col, row) {
    var raw = this.rawCell(col, row);
    var cell = this.cell(col, row);
    if (raw === cell) {
        return cell;
    } else {
        return null;
    }
};

Grid.prototype.print = function (target) {
	var trim = true;
	if (!target || target === log) {
		target = log;
		trim = false;
	}
    var i = 0;

    var header = '   '
    for (var i = 0; i < this.size; i++) {
        header += ALPHABET[i];
    }
    target(header);
    for (var x = 0; x < this.size; x++) {
        var num = x + 1;
        if (num < 10)
            num = ' ' + num;
    	var line = num + '|' + this.slice(x * this.size,x*this.size + this.size).join('') + '|';
    	if (trim)
    		line = ansiTrim(line);
        target(line);
    };
}

Grid.prototype.printAnchors = function() {
	for (var i = 0; i < this.size; i++) {
		log(this.anchors.slice(i * this.size, i * this.size + this.size).join(''));
	};
};

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
	if (col < 0 || row < 0)
		return true;
	var rawCell = this.rawCell(col, row);
	var cell = this.cell(col, row); 
	return cell !== rawCell || cell === ' ';
}

Grid.prototype.prefix = function(col, row, horizontal) {
	var word = '';
	if (!this.cellEmpty(col, row))
		return word;
	if (horizontal) {
		for (var itemCol = col-1; itemCol >= 0; itemCol--) {
			if (this.cellEmpty(itemCol, row)) {
				break;
			}
			word = this.cell(itemCol, row) + word;
		};
	} else {
		for (var itemRow = row-1; itemRow >= 0; itemRow--) {
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

Grid.prototype.beforeEmpty = function(col, row, horizontal) {
    var itemRow = row;
    var itemCol = col;
    if (horizontal) {
        itemCol--;
        // log('Empty test: ' + itemCol + ',' + itemRow + ' ' + horizontal);
        return itemCol < 0 || this.cellEmpty(itemCol, itemRow);
    } else {
        itemRow--;
        // log('Empty test: ' + itemCol + ',' + itemRow + ' ' + horizontal);
        return itemRow < 0 || this.cellEmpty(itemCol, itemRow);
    }
}

Grid.prototype.afterEmpty = function(word, col, row, horizontal) {
    var itemRow = row;
    var itemCol = col;
    if (horizontal) {
        itemCol += word.length;
        return itemCol >= this.size || this.cellEmpty(itemCol, itemRow);
    } else {
        itemRow += word.length;
        return itemRow >= this.size || this.cellEmpty(itemCol, itemRow);
    }
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
Grid.prototype.validateMove = function(word, col, row, horizontal, firstWord, rackUsed) {
	// log('validating word ' + word);
    if (!this.fits(col, row, horizontal, word)) {
    	// log('Doesn\'t fit');
        return -1;
    }
    var totalScore = 0;
    var totalAltScore = 0;
    var totalWordMultiplier = 1;
    var foundAltWord = false;
    var foundHook = false;
    var foundMiddle = false;
    var middleColRow = Math.floor(this.size / 2);
    var letterPlaced = false;

    if (!this.beforeEmpty(col, row, horizontal)) {
        return -1;
    }
    if (!this.afterEmpty(word, col, row, horizontal)) {
        return -1;
    }

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
        if (cell !== rawCell) {
        	letterPlaced = true;
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
            log('p ' + prefix + ' s ' + suffix);
            var altWord = prefix + letter + suffix;
            if (altWord.length > 1) {

                log('alt word: ' + altWord);
	            if (this.lexicon.findWord(altWord.toUpperCase())) {
	            	altScore = this.scoreWord(prefix) + this.scoreWord(suffix) + (letterScore * letterMultiplier);
	            	altScore *= wordMultiplier;
                    foundAltWord =  true;
	            } else {
	            	log("FAIL THIS WORD BECAUSE ALT WORD " + altWord + " DOESN'T EXIST");
                    return true;
                }
	        }
		}

        log(rawCell + ' ' + letter + ' ' + letterScore + ' * ' + letterMultiplier + ' = ' + (letterScore * letterMultiplier + altScore) + ' (' + altScore + ')');
        totalScore += letterScore * letterMultiplier;
        totalAltScore += altScore;
        totalWordMultiplier = totalWordMultiplier * wordMultiplier;

        return false;
    }, this);

    if (failed) {
        log('failed');
        return -1;
    }

    if (!letterPlaced) {
        log('!letterPlaced');
    	return -1;
    }

    if (firstWord) {
        if (!foundMiddle) {
            log("not through middle")
            return -1;
        }
    } else {
        if (!foundAltWord && !foundHook)
        {
            log("not alt word and not hook")
            return -1;
        }
    }

    // log("Total: " + totalScore + " * " + totalWordMultiplier + " + " + totalAltScore + " = " + (totalScore * totalWordMultiplier + totalAltScore));
    totalScore = totalScore * totalWordMultiplier + totalAltScore;

    if (rackUsed === 7)
    {
        totalScore += 50;
    }
    return totalScore;
}


module.exports.Grid = Grid;