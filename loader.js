var Gordon = require('./gordon.js');
var fs = require('fs');
var log = require('./util.js').log;
var JSONR = require('./jsonr.js');

function LexiconLoader() {

    this.callback = null;
    this.lexicon = null;
    this.dy = {};

    this.load = function (callback) {
        this.callback = callback;
        if (!fs.existsSync('lexiconr.json')) {
            log('loading the raw lexicon, this takes about 8 seconds');
            this.loadText(this.save.bind(this));
        } else {
            log('loading the lexicon, this takes about 3 seconds');
            this.loadJson(this.callback);
        }
    }

    this.save = function() {
        log('Saving the processed lexicon for later');
        console.time('stringify');
        var data = JSON.stringify(this.lexicon.getData());
        console.timeEnd('stringify');
        console.time('write')
        fs.writeFileSync('lexiconr.json', data, {encoding:'utf8'});
        console.timeEnd('write');
        if (this.callback)
        {
            this.callback(this.lexicon);
        }
    }

    this.loadText = function (callback){
        this.data = "";
        this.totalWords = 0;

        this.lexicon = new Gordon();

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
                this.lexicon.addWord(word.toUpperCase())
            }, this);
            log("Added " + this.totalWords + " words");
        }
    }

    this.loadJson = function (callback) {
        
        this.lexicon = new Gordon();

        var lexiconJS = "";
        console.time('json')
        fs.createReadStream('lexiconr.json', {encoding:'utf8'})
            .on('data', function(chunk) {
                lexiconJS += chunk.toString();
            })
            .on('end', (function () {
                this.lexicon.setData(JSON.parse(lexiconJS));
                // this.lexicon.setTrie(eval(lexiconJS));
                console.timeEnd('json');

                if (callback) {
                    callback(this.lexicon);
                }

        }).bind(this));
    }
}

module.exports.LexiconLoader = LexiconLoader;