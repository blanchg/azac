
var Gaddag = require('./gaddag.js').Gaddag;
var log = require('./util.js').log;
var fs = require('fs');
var clc = require('cli-color');
var ansiTrim = require('cli-color/trim');

var gaddag = new Gaddag();

// log("Must be run with --max-old-space-size=3000 to use the ENABLE lexicon especially if it hasn't been processed.")

function loadTxtLexicon(callback){
    var lexicon = "";
    var totalWords = 0;
    console.time('wordlist')
    fs.createReadStream('Lexicon.txt', {encoding:'utf8'})
        .on('data', function(chunk) {
            lexicon += chunk.toString();
            var index = lexicon.lastIndexOf('\n');
            if (index != -1) {
                var words = lexicon.substr(0,index).split('\n');
                totalWords += words.length;
                lexicon = lexicon.substring(index + 1);
                gaddag.addAll(words);
                log("Added " + totalWords + " words");
            }
        })
        .on('end', function () {log('end');lexiconLoaded(lexicon)});

    function lexiconLoaded(lexicon) {
        gaddag.addAll(lexicon.split('\n'));
        console.timeEnd('wordlist');

        if (callback) {
            callback();
        }
    }
}

function loadJsonLexicon (callback) {
    
    gaddag = new Gaddag();

    var lexiconJS = "";
    console.time('json')
    fs.createReadStream('lexicon.js', {encoding:'utf8'})
        .on('data', function(chunk) {
            lexiconJS += chunk.toString();
        })
        .on('end', function () {
            gaddag.setTrie(JSON.parse(lexiconJS)); 
            console.timeEnd('json');

            if (callback) {
                callback();
            }

    });
}


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
        
        this.board = "T  d   T   d  T" +
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

    this.wordH = function(row, col, word) {
        var i = row * this.size + col;
        var that = this;
        word.split('').forEach(function (letter) {
            // log("Have that: " + this);
            this[i++] = letter;
        }, that);
        // this.print();
    }

    this.wordV = function(row, col, word) {
        var i = 0;
        var that = this;
        word.split('').forEach(function (letter) {
            // log("Have that: " + this);
            var index = (row + i++) * this.size + col
            this[index] = letter;
        }, that);
        // this.print();
    }

    this.fits = function(row, col, horizontal, word) {
    	if (row < 0 || col < 0)
    		return false;
    	if (horizontal) {
    		return col + word.length <= this.size;
    	} else {
    		return row + word.length <= this.size;
    	}
        // var i = 0;
        // var that = this;
        // word.split('').forEach(function (letter) {
        //     // log("Have that: " + this);
        //     var index = (row + i++) * this.size + col
        //     this[index] = letter;
        // }, that);
        // this.print();
    }

    this.rawCell = function(row, col) {
    	if (row >= this.size || col >= this.size) {
    		return null;
    	}
        var i = row * this.size + col;
        return this[i];
    }

    this.cell = function(row, col) {
    	if (row >= this.size || col >= this.size) {
    		return null;
    	}
        var i = row * this.size + col;
        return ansiTrim(this[i]);
    }

    this.print = function () {
        var i = 0;
        for (var x = 0; x < this.size; x++) {
            log('|' + this.slice(x * this.size,x*this.size + this.size).join('') + '|');
        };
    }

    this.clone = function() {
        return new Grid(this);
    }
}

Grid.prototype = new Array();
Grid.prototype.constructor = Grid;

var problem = "A";
var bag = "AIOIETPRTIRDDGNEOEDERUCERAAOIOEEFAHASZENKBBSTLRIURMSC?SFGLQETAIGEOYEAOOT?PVNUMLIJVWODNAIIAXLNEWNYUHT".toLowerCase().split("");
var rack = [];
var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
var scores = '1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10'.split(',').map(function(item){return parseInt(item)});
var gridWidth = 15;
var grid = new Grid(gridWidth);
var board = grid.clone();


var fillRack = function() {
    while (rack.length < 7 && bag.length > 0) {
        rack.push(bag.shift());
    }
}
var removeFromRack = function(word, replacements) {
    var letters = word.split('');
    replacements.forEach(function (letter) {
        letters.push('?');
    })
    letters.forEach(function (letter) {
    // log("looking for " + letter + " in " + rack.join(","));
        var index = rack.indexOf(letter);
        if (index == -1) {
            log("Error in rack")
            throw "Invalid move error: " + letter + " not in " + rack.join(",") + " index: " + index;
        }
        rack.remove(index);
    });
}
var removeHookFromWord = function(hook, word, error) {
    if (error === undefined)
        error = true;
    var index = word.indexOf(hook);
    if (index == -1 && error) {
        log("Error in word " + word)
        throw "Invalid move error: " + hook + " not in " + word + " index: " + index;
    }
    word = word.substring(0, index) + word.substring(index + 1);
    return word;
}

function saveLexicon() {
    console.time('write')
    fs.writeFileSync('lexicon.js', gaddag.getJson(), {encoding:'utf8'});
    console.timeEnd('write');
    process();
}

function wordMultiplier(cell) {
	switch(cell) {
		case clc.bold('T'):
			return 3;
		case clc.bold('D'):
			return 2;
		default:
			return 1;
	} 
}
function letterMultiplier(cell) {
	switch(cell) {
		case clc.bold('t'):
			return 3;
		case clc.bold('d'):
			return 2;
		default:
			return 1;
	} 
}

function scoreLettersRaw(letters) {

    if (!letters || letters.length == 0)
        return 0;
    var totalScore = 0;
    letters.forEach(function(letter, i) {
    	var score = scores[alphabet.indexOf(letter)];
    	if (isNaN(score))
    		return;
        totalScore += score;
    });
    return totalScore;	
}
function scoreLetters(letters, row, col, horizontal) {
    if (horizontal === undefined)
        horizontal = true;

    if (!letters || letters.length == 0)
        return 0;
    var totalScore = 0;
    letters.forEach(function(letter, i) {
    	var score = scores[alphabet.indexOf(letter)];
    	var multiplier = 1;
    	if (row !== undefined && col !== undefined) {
    		var cell = grid.rawCell(horizontal?row + i:row, horizontal?col:col+i);
    		if (cell === null)
    			return -1;
    		score *= letterMultiplier(cell);
    		multiplier *= wordMultiplier(cell);
    	}
        totalScore += score * multiplier;
    });
    return totalScore;
}
function score(word, rack, row, col, horizontal) {
    var score = 0;
    if (rack.length == 0) {
        score += 50;
    }
    var letterScore = scoreLetters(word.split(''), row, col, horizontal);
    if (letterScore < 0)
    	return -1;
    score += letterScore;
    return score;
}

function process() {
    log('ready to process');

    // console.time('search2');
    // var rack = 'abatisr'.split('');
    // log("All words that can be formed using " + rack.join(', ') + ": ");
    // log(gaddag.findWordsWithRackAndHook(rack, ''));
    // console.timeEnd('search2');
    var totalScore = 0;
    var foundWords = [];
    var hookLetters = [''];
    // grid.wordH(2, 2, 'hello');
    // grid.wordV(2, 2, 'hello');
    // grid.print();

    // log("prefix: " + gaddag.findWordsWithRackAndHook('train'.split(''), 'ing').join(','));

    // log("0,0: " + (board.cell(0,0) == 'T'));
    grid.print();
    var row = 7;
    var col = 3;
    var horizontal = true;
    while (bag.length > 0 || rack.length > 0)
    {
        fillRack();
        
        var word = null;
        var wordHook = null;
        var longest = 0;
        var wordReplacements = null;
        var wordRow = 0;
        var wordCol = 0;
        var wordHorizontal = true;

        testWord(hookLetters);

        function testWord(hookLetters) {
        hookLetters.forEach(function (hook) {

            function processRack(rack, replacements) {
                var index = rack.indexOf('?');
                if (index != -1) {
                    // log("Replace ? in rack: " + rack.join(""));
                    alphabet.forEach(function(letter) {
                        var filledRack = rack.slice(0);
                        filledRack[index] = letter;
                        var r = replacements.slice(0);
                        r.push(letter);
                        processRack(filledRack, r);
                    });
                    return;
                }

                candidates = gaddag.findWordsWithRackAndHook(rack.slice(0), hook);
                // log("Rack: " + rack.join("") + " In Bag: " + bag.length + " Candidates: " + candidates.length);
                if (!candidates || candidates.length == 0)
                    return;

                candidates.forEach(
					function (item) {
						var itemRow = row;
						var itemCol = col;
			        	if (horizontal) {
			        		itemCol -= item.indexOf(hook) + 1;
			        	} else {
			        		itemRow -= item.indexOf(hook) + 1;
			        	}


			        	if (!grid.fits(itemRow,itemCol,horizontal,item))
			        		return;

			            var tempItem = '' + item;
			            replacements.forEach(function (letter) { tempItem = removeHookFromWord(letter, tempItem, false) });
			            var itemScore = scoreLetters(tempItem.split(''), itemRow, itemCol, horizontal);

			            if (itemScore > 0 && itemScore > longest) {
			                wordReplacements = replacements;
			                wordHook = hook;
			                word = item;
							log("(" + itemCol + ", " + itemRow + ")");
			                wordRow = itemRow;
			                wordCol = itemCol;
			                wordHorizontal = horizontal;
			                longest = itemScore;
			            }
					}, this);
            }
            processRack(rack, []);

            if (horizontal) {
            	row++;
            } else {
            	col++;
            }
        });
		}


        if (!word || word.length == 0)
        {
            log("Reached end rack " + rack.join("") + " bag " + bag.length);
            break;
        }

        var foundWord = word;
        wordReplacements.forEach(function (letter) { word = removeHookFromWord(letter, word, false) });
        var scoreWord = word;
        word = removeHookFromWord(wordHook, word);
        var wordRack = rack.slice(0).join('');
        removeFromRack(word, wordReplacements);
        wordScore = score(scoreWord, rack, wordRow, wordCol, wordHorizontal);
        if (wordHook) {
            log(foundWord + "(" + wordCol + ", " + wordRow + ") off letter " + wordHook + " using " + wordRack + " leftover letters " + rack.join("") + " scores " + wordScore);
        } else {
            log(foundWord + "(" + wordCol + ", " + wordRow + ") using " + wordRack + " leftover letters " + rack.join("") + " scores " + wordScore);
        }
        totalScore += wordScore;
        foundWords.push(foundWord);
        hookLetters = word.split('');
        if (wordHorizontal)
        	grid.wordH(wordRow, wordCol, foundWord);
        else
        	grid.wordV(wordRow, wordCol, foundWord);
        grid.print();


        // Setup for next word
		horizontal = !wordHorizontal;
		row = wordRow;
		col = wordCol;

        // log("Rack: " + rack.join(", "));
    }
    var bagScore = scoreLettersRaw(bag);
    var rackScore = scoreLettersRaw(rack);
    log("Total Score: " + totalScore  + " bagScore: -" + bagScore + " rackScore: -" + rackScore + " Final Score: " + (totalScore - bagScore - rackScore));
}



if (!fs.existsSync('lexicon.js')) {
    log('loading the raw lexicon, this takes about 8 seconds');
    loadTxtLexicon(saveLexicon);
} else {
    log('loading the lexicon, this takes about 3 seconds');
    loadJsonLexicon(process);
    // process();
}