var Gaddag = require('./gaddag.js').Gaddag;
var log = require('./util.js').log;

var gaddag = new Gaddag();

gaddag.add('bat');
gaddag.add('bla');
gaddag.add('bating');
// gaddag.add('racing');
// gaddag.add('rubbing');
// gaddag.add('tatin');
// gaddag.add('tating');

log(JSON.stringify(gaddag.getTrie(), null, 2));

log('Find part of word: ' + gaddag.findWordsWithRackAndHook('bagt'.split(''), 'tin').join(', '));

log('Find word: ' + gaddag.findWord('bating'));
log('Find word: ' + gaddag.findWord('batin'));
log('Find word: ' + gaddag.findWord('bati'));
log('Find word: ' + gaddag.findWord('bat'));
log('Find word: ' + gaddag.findWord('blah'));
log('Find word: ' + gaddag.findWord('bl'));
log('Find word: ' + gaddag.findWord('b'));
log('Find word: ' + gaddag.findWord('bla'));