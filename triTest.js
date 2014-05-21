var Gaddag = require('./gaddag.js').Gaddag;
var log = require('./util.js').log;

var gaddag = new Gaddag();

gaddag.add('bat');
gaddag.add('bating');
// gaddag.add('racing');
// gaddag.add('rubbing');
// gaddag.add('raaacing');

log(JSON.stringify(gaddag.getTrie(), null, 2));

log(JSON.stringify(gaddag.findWordsWithRackAndHook('ing'.split(''), 'bat'), null, 2));