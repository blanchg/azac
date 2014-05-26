var log = require('./util.js').log;
var clc = require('cli-color');
var ansiTrim = require('cli-color/trim');

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

    this.wordH = function(col, row, word) {
        var i = row * this.size + col;
        var that = this;
        word.split('').forEach(function (letter) {
            // log("Have that: " + this);
            this[i++] = letter;
        }, that);
        // this.print();
    }

    this.wordV = function(col, row, word) {
        var i = 0;
        var that = this;
        word.split('').forEach(function (letter) {
            // log("Have that: " + this);
            var index = (row + i++) * this.size + col
            this[index] = letter;
        }, that);
        // this.print();
    }

    this.fits = function(col, row, horizontal, word, firstWord) {
    	if (col < 0 || row < 0)
    		return false;
    	if (horizontal) {
    		if (col + word.length > this.size)
    			return false;
    	} else {
    		if (row + word.length > this.size)
    			return false;
    	}

    	var middleFilled = false;

    	var result = !word.split('').some(function (letter) {
    		var rawCell = this.rawCell(col, row);
    		var cell = this.rawCell(col, row);
    		if (col == Math.floor(this.size / 2) && row == Math.floor(this.size / 2)) {
    			middleFilled = true;
    		}
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

    	if (result && firstWord) {
    		result = middleFilled;

    	}
    	// log(word + ' fits ' + (!result));
    	return result;
    }

    this.rawCell = function(col, row) {
    	if (row >= this.size || col >= this.size) {
    		return null;
    	}
        var i = row * this.size + col;
        return this[i];
    }

    this.cell = function(col, row) {
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

module.exports.Grid = Grid;