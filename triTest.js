var Gaddag = require('./gaddag.js').Gaddag;
var log = require('./util.js').log;

var gaddag = new Gaddag();

gaddag.add('bat');
gaddag.add('bating');
// gaddag.add('racing');
// gaddag.add('rubbing');
gaddag.add('tatin');
gaddag.add('tating');

// log(JSON.stringify(gaddag.getTrie(), null, 2));

log(gaddag.findWordsWithRackAndHook('bagt'.split(''), 'tin').join(', '));