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



    this.save = function save() {
        log('Saving the processed lexicon for later');
        console.time('write')
        fs.writeFileSync('lexicon.js', this.lexicon.getJson(), {encoding:'utf8'});
        console.timeEnd('write');
        if (this.callback)
        {
            this.callback(this.lexicon);
        }
    }

    this.loadText = function (callback){
        var data = "";
        var totalWords = 0;

        this.lexicon = new Gaddag();

        console.time('wordlist')
        fs.createReadStream('Lexicon.txt', {encoding:'utf8'})
            .on('data', (function(chunk) {
                data += chunk.toString();
                var split = '\r\n';
                var index = data.lastIndexOf('\r\n');
                if (index == -1) {
                    split = '\n';
                    index = data.lastIndexOf('\n');
                }

                if (index != -1) {
                    var words = data.substr(0,index).split(split);
                    totalWords += words.length;
                    data = data.substring(index + 1);
                    this.lexicon.addAll(words);
                    log("Added " + totalWords + " words");
                }
            }).bind(this))
            .on('end', (function () {log('end');lexiconLoaded.call(this,data)}).bind(this));

        function lexiconLoaded(data) {
            this.lexicon.addAll(data.split('\n'));
            console.timeEnd('wordlist');

            if (callback) {
                callback(this.lexicon);
            }
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