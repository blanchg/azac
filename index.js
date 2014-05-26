

var log = require('./util.js').log;

var clc = require('cli-color');
var ansiTrim = require('cli-color/trim');

var Grid = require('./grid.js').Grid;
var LexiconLoader = require('./loader.js').LexiconLoader;

var lexicon;

// log("Must be run with --max-old-space-size=3000 to use the ENABLE lexicon especially if it hasn't been processed.")


var problem = "A";
var bag = "AIOIETPRTIRDDGNEOEDERUCERAAOIOEEFAHASZENKBBSTLRIURMSC?SFGLQETAIGEOYEAOOT?PVNUMLIJVWODNAIIAXLNEWNYUHT".toLowerCase().split("");
var rack = [];
var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
var COLUMNS = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
var ROWS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
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
    if (hook == '')
        return word;
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
function scoreLetters(letters, col, row, horizontal) {

    if (!letters || letters.length == 0)
        return 0;
    var totalScore = 0;
    var multiplier = 1;
    letters.forEach(function(letter, i) {
    	var score = scores[alphabet.indexOf(letter)];
    	if (col !== undefined && row !== undefined) {
            var cellCol = horizontal?col:col+i;
            var cellRow = !horizontal?row:row+i;
    		var cell = grid.rawCell(cellCol, cellRow);
    		if (cell === null)
    			return -1;
            log('letter ' + letter + ' ' + score + ' * ' + letterMultiplier(cell) + ' ' + cell);
    		score *= letterMultiplier(cell);
    		multiplier = multiplier * wordMultiplier(cell);
    	}
        totalScore += score;
    });
    log('word ' + letters.join('') + ' ' + totalScore + ' * ' + multiplier);
    totalScore *= multiplier;
    return totalScore;
}
function score(word, rack, col, row, horizontal) {
    var score = 0;
    if (rack.length == 0) {
        score += 50;
    }
    var letterScore = scoreLetters(word.split(''), col, row, horizontal);
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
    var hookLetters = null;
    // grid.wordH(2, 2, 'hello');
    // grid.wordV(2, 2, 'hello');
    // grid.print();

    // log("prefix: " + gaddag.findWordsWithRackAndHook('train'.split(''), 'ing').join(','));

    // log("0,0: " + (board.cell(0,0) == 'T'));
    grid.print();
    var col = 3;
    var row = 7;
    var horizontal = true;
    while (bag.length > 0 || rack.length > 0)
    {
        fillRack();
        
        var word = null;
        var wordHook = null;
        var longest = 0;
        var wordReplacements = null;
        var wordCol = 0;
        var wordRow = 0;
        var wordHorizontal = true;

        if (hookLetters === null) {
            col = 7;
            horizontal = false;
            for (row = 1; row < grid.size / 2; row++) {
                processRack(rack, [], '', 0, true);
            };
            horizontal = true;
            row = 7;
            for (col = 1; col < grid.size / 2; col++) {
                processRack(rack, [], '', 0, true);
            }
        } else {
            var hookRow;
            var hookCol;
            for (row = 0; row < grid.size; row++) {
                for (col = 0; col < grid.size; col++) {
                    horizontal = true;
                    hookCol = col;
                    hookLetters = [];
                    for (hookRow = row; hookRow < grid.size; hookRow++) {
                        var cell = grid.cell(hookCol, hookRow);
                        var rawCell = grid.rawCell(hookCol, hookRow);
                        if (cell != rawCell) {
                            hookLetters.push('?');
                        } else {
                            hookLetters.push(rawCell);
                        }
                    };
                    processRack(rack.slice(0), [], hookLetters.slice(0), 0, false);
                    horizontal = false;
                    hookRow = row;
                    hookLetters = [];
                    for (hookCol = col; hookCol < grid.size; hookCol++) {
                        var cell = grid.cell(hookCol, hookRow);
                        var rawCell = grid.rawCell(hookCol, hookRow);
                        if (cell != rawCell) {
                            hookLetters.push('?');
                        } else {
                            hookLetters.push(rawCell);
                        }
                    };
                    processRack(rack.slice(0), [], hookLetters.slice(0), 0, false);
                }
            };
        }

        function testWord(hookLetters) {
            // log('Hook word: ' + hookLetters.join(''));
            hookLetters.forEach(function (hook, hookIndex) {
                // log("Hook: " + hook + "@" + hookIndex);

                processRack(rack, [], hook, hookIndex, false);

            });
		}

        function processRack(rack, replacements, hook, hookIndex, firstWord) {
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

            candidates = lexicon.findWordsWithRackAndHook(rack.slice(0), hook);
            // log("Rack: " + rack.join("") + " In Bag: " + bag.length + " Candidates: " + candidates.length);
            if (!candidates || candidates.length == 0)
                return;

            candidates.forEach(
                function (item) {
                    var itemCol = col;
                    var itemRow = row;
                    if (hook.length > 0) {
                        if (horizontal) { // This is horizontal so previous was vertical so work off row
                            itemCol -= item.indexOf(hook);
                            itemRow = row + hookIndex;
                        } else {
                            itemCol = col + hookIndex;
                            itemRow -= item.indexOf(hook);
                        }
                    }
                    // log("(" + col + ", " + row + ") item (" + itemCol + ", " + itemRow + ") " + item + " - " + hook + "@" + hookIndex);


                    if (!grid.fits(itemCol,itemRow,horizontal,item, firstWord))
                        return;

                    var tempItem = '' + item;
                    replacements.forEach(function (letter) { tempItem = removeHookFromWord(letter, tempItem, false) });
                    var itemScore = scoreLetters(tempItem.split(''), itemCol, itemRow, horizontal);

                    if (itemScore > 0 && itemScore > longest) {
                        wordReplacements = replacements;
                        wordHook = hook;
                        word = item;
                        wordCol = itemCol;
                        wordRow = itemRow;
                        wordHorizontal = horizontal;
                        longest = itemScore;
                        // log("*");
                    }
                }, this);
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
        wordScore = score(scoreWord, rack, wordCol, wordRow, wordHorizontal);
        var position = ROWS[wordRow] + COLUMNS[wordCol] + "\t";
        if (!horizontal) {
            position = COLUMNS[wordCol] + ROWS[wordRow] + "\t";
        }
        if (wordHook) {
            log(position + foundWord + " off letter " + wordHook + " using " + wordRack + " leftover letters " + rack.join("") + " scores " + wordScore);
        } else {
            log(position + foundWord + " using " + wordRack + " leftover letters " + rack.join("") + " scores " + wordScore);
        }
        totalScore += wordScore;
        foundWords.push(foundWord);
        hookLetters = foundWord.split('');
        if (wordHorizontal)
        	grid.wordH(wordCol, wordRow, foundWord);
        else
        	grid.wordV(wordCol, wordRow, foundWord);
        grid.print();


        // Setup for next word
		horizontal = !wordHorizontal;
        col = wordCol;
		row = wordRow;

        // log("Rack: " + rack.join(", "));
    }
    var bagScore = scoreLettersRaw(bag);
    var rackScore = scoreLettersRaw(rack);
    log("Total Score: " + totalScore  + " bagScore: -" + bagScore + " rackScore: -" + rackScore + " Final Score: " + (totalScore - bagScore - rackScore));
}

var loader = new LexiconLoader();
loader.load((function(l) {
    lexicon = l;
    process()
}).bind(this));