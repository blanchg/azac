

var log = require('./util.js').log;
var Solver = require('./solver.js');
var Gordon = require('./gordon.js');
var solver = new Solver();


solver.lexicon = new Gordon();
solver.lexicon.addWord('TAILED');
solver.lexicon.addWord('ETA');
solver.lexicon.addWord('AE');
solver.lexicon.addWord('TA');
solver.lexicon.addWord('TAT');
solver.lexicon.addWord('TE');
solver.lexicon.addWord('ETE');
solver.lexicon.addWord('NE');
solver.lexicon.addWord('HEN');
solver.lexicon.addWord('HE');
solver.lexicon.addWord('ET');
solver.lexicon.addWord('NAE');
solver.lexicon.addWord('UTA');
solver.lexicon.addWord('ATE');
solver.lexicon.addWord('AT');
solver.lexicon.addWord('ONE');
solver.lexicon.addWord('ON');
solver.lexicon.addWord('OXYPHENBUTAZONE');

solver.setBag('TAILEDEAETATATETENEHENUTAONOXYPBZE'.split('')); // 


solver.addPreferredMove('TAILED',7,2,false);
solver.addPreferredMove('ETA',6,2,true);
solver.addPreferredMove('ETA',4,1,true);
solver.addPreferredMove('TAT',8,1,true);
solver.addPreferredMove('ETE',10,2,true);
solver.addPreferredMove('NE',12,1,true);
solver.addPreferredMove('HEN',4,0,true);
solver.addPreferredMove('UTA',8,0,true);
solver.addPreferredMove('ON',12,0,true);
solver.addPreferredMove("OXYPHENBUTAZONE", 0, 0, true);



// solver.addPreferredMove('ET',4,1,true);
// solver.addPreferredMove('TA',5,1,true);
// solver.addPreferredMove('TA',8,1,true);
// solver.addPreferredMove('TAT',8,1,true);
// solver.addPreferredMove('AT',9,1,true);
// solver.addPreferredMove('NE',12,1,true);

// solver.addPreferredMove('HEN',4,0,true);
// solver.addPreferredMove('HE',4,0,false);
// solver.addPreferredMove('ET',5,0,false);
// solver.addPreferredMove('NA',6,0,false);
// solver.addPreferredMove('UT',8,0,false);
// solver.addPreferredMove('TA',9,0,false);
// solver.addPreferredMove('AT',10,0,false);
// solver.addPreferredMove('ON',12,0,false);
// solver.addPreferredMove('NE',13,0,false);

solver.grid.lexicon = solver.lexicon;
solver.problem = '1';
solver.grid.print();
solver.template.print();
solver.processAll();