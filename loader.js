var Gaddag = require('./gaddag.js').Gaddag;
var fs = require('fs');
var log = require('./util.js').log;

function LexiconLoader() {

    this.callback = null;
    this.lexicon = null;

    this.load = function (callback) {
        this.callback = callback;
        if (!fs.existsSync('lexicon.js')) {
            log('loading the raw lexicon, this takes about 8 seconds');
            this.loadText(this.save.bind(this));
        } else {
            log('loading the lexicon, this takes about 3 seconds');
            this.loadJson(this.callback);
            // process();
        }
    }

    this.compress = function() {
        var trie = this.lexicon.getTrie();
        var target = this.getBottom(trie);
    }

    this.getBottom = function(trie) {
        var cur = trie;
        for (var node in cur) {
            return getBottom(cur[ node ]);
        }
        return cur;
    }

    this.save = function() {
        // this.compress();
        log('Saving the processed lexicon for later');
        console.time('write')
        fs.writeFileSync('lexicon.js', JSON.stringify(this.lexicon.getTrie()), {encoding:'utf8'});
        console.timeEnd('write');
        if (this.callback)
        {
            this.callback(this.lexicon);
        }
    }

    this.loadText = function (callback){
        this.data = "";
        this.totalWords = 0;

        this.lexicon = new Gaddag();

        console.time('wordlist')
        fs.createReadStream('Lexicon.txt', {encoding:'utf8'})
            .on('data', (function (chunk) {this.handleData(chunk);}).bind(this))
            .on('end', (function () {
                this.handleData(this.data);
                log('end');
                console.timeEnd('wordlist');

                if (callback) {
                    callback(this.lexicon);
                }
            }).bind(this));
    }
    this.handleData = function(chunk) {
        this.data += chunk.toString();
        var split = '\r\n';
        var index = this.data.lastIndexOf('\r\n');
        if (index == -1) {
            split = '\n';
            index = this.data.lastIndexOf('\n');
        }

        if (index != -1) {
            var words = this.data.substr(0,index).split(split);
            this.totalWords += words.length;
            this.data = this.data.substring(index + 1);
            words.forEach(function(word) {
                if (word.length > 15) return;
                this.lexicon.add(word.toUpperCase())
            }, this);
            log("Added " + this.totalWords + " words");
        }
    }

    this.loadJson = function (callback) {
        
        this.lexicon = new Gaddag();

        var lexiconJS = "";
        console.time('json')
        fs.createReadStream('lexicon.js', {encoding:'utf8'})
            .on('data', function(chunk) {
                lexiconJS += chunk.toString();
            })
            .on('end', (function () {
                this.lexicon.setTrie(JSON.parse(lexiconJS));
                // this.lexicon.setTrie(eval(lexiconJS));
                console.timeEnd('json');

                if (callback) {
                    callback(this.lexicon);
                }

        }).bind(this));
    }
}


// Grid.prototype = new Array();
// Grid.prototype.constructor = Grid;

module.exports.LexiconLoader = LexiconLoader;