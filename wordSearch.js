
var LexiconLoader = require('./loader.js').LexiconLoader;
var log = require('./util.js').log;

var pattern = process.argv[2].toUpperCase();

var loader = new LexiconLoader();
loader.load((function(lexicon) {
	var words = lexicon.findPattern(pattern);
	log('For pattern: ' + pattern + ' found ' + words.length + '\n' + words);
}).bind(this));