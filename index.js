
// var process = require('process');
var log = require('./util.js').log;
var fs = require('fs');
var clc = require('cli-color');
var ansiTrim = require('cli-color/trim');

var Grid = require('./grid.js').Grid;
var LexiconLoader = require('./loader.js').LexiconLoader;

var lexicon;

// log("Must be run with --max-old-space-size=3000 to use the ENABLE lexicon especially if it hasn't been processed.")

var problems = {
    A: 'AIOIETPRTIRDDGNEOEDERUCERAAOIOEEFAHASZENKBBSTLRIURMSC?SFGLQETAIGEOYEAOOT?PVNUMLIJVWODNAIIAXLNEWNYUHT',
    B: 'BMLUNNRESETO?AOSADTJUOWALITSNTEEDUIRAEAWECNBDTECPIOAYOSINKGERVOYAMIEPTRQEXFRAUVLFOEGEDIIA?HLZOHIIRGN',
    C: 'CHHBUERLTJ?PFEXONFADERNRAZOVAEEIOVISWDTPYAEYIN?GENNDILKITOATMSIOEQAITCRILEDEOOGNWGSMRAUALUUEATEBROSI',
    D: 'DEHERIOEGDPYOERICIAGFSMYUA?ENAEUFUTBONTRJAWLNITEEINMZNSIRIIPHISE?SQREOTOLEVATAGNCTABORWOAKLDDEOAUVLX',
    E: 'E?AVCDNGTIEANJSSCOTLEIREMAEBDPOTLANIEAIWZDTSXRUIPEOONEGUFVIBUMEERIOLWIOAGYNDQ?ESATKYAUHHROEIRFAOTNRL',
    F: 'FUOEEBS?ORI?ITARWIDUTATMETAAZQLYEEIMONLOIAVJUGFNAIRTOVEEACYIBPXSEHPEILDISLNRCGOUNHANWOEESDKONARRDEGT',
    G: 'GZASFIOIDANNTAAOURMISLN?ONXDDAEEAOEREUFVUGO?HRIMWEOERKETIADRILECTIOEUIIANQNOYPSVEHEWJALREGCBTSPTBTLY',
    H: 'HYAIEOEINE?LSIACATLTBEHMERWJWVOFENNRAAILTRQSSBNOEVUGDRCDOOENRUIORPEFYGAALAAKOOTDEIEDEIITPNGTZXU?IMSU',
    I: 'IEOUOSNYHCJDEIA?WTTDEQDAZCXEABENAIUTALH?SANWLIIEANELIALREOUOSIUGVTESNEVNORGEFFOPRTEOTRDYRGOIMPBKAIMR',
    J: 'JVUQENNWNDEARLAIOUEABZDIREAEBAATFNYOMEAIOT?HRRTAFEEETPOLSNADNIUMEKVGOOXOUWIG?SPYICTSSRTIOHLRCLIEIEDG',
    K: 'KHEETWIOEWTMO?OIIACEDORF?VJASTRDNEBNOURQHEASOAYIODIEAIIUNZEULITLCRXGTARMEISVNYNUTAELGNADRESLOPBPEFGA',
    L: 'LTUDELNVREITEOSSYBEUNRFA?SOI?DRIHETNUXOMEGPOWACOAIERNTAOJTDIRAVLIWHARDTAGNNEALBUMZGISAPIEEECQIOEKFOY',
    M: 'MWLTAFEUEIETAIAXYAOTONNCRFEWAEI?DPEEICIREHILKRZNSJOIDDUYLIBSAHTAAIRNETOUQTOLEDR?GSEPOAUBSGVVRNOOGEMN',
    N: 'NARNNMSAAPHCOERRUHAOOIIIEIEKTTAGODUAFOITEDSFDYOOEEGRJENDSIGCLIEITAPQLUME?LRRVBINXTETOL?EWVEANBUZYSWA',
    O: 'OETZNIIASEEUHDWDMCTRGOIQDIUNAOOEAEPTWNHENYRINOEDPVRLIIIATATCMV?BNASALBFYSOEIUXELERTEUARORKASOFJL?GGE',
    P: 'PEEEENELAJCOOIUNSFIROIEESTBADVMIYWHTRXOULZEGATIECWN?OINE?UMIIBGDVRORAASSOLEPDUATHTREGLQNFATOIAKDRANY',
    Q: 'QDSEEOEUUHONGLWRA?ELITRDLNXRMADEZCANYOEOTTAIBVYAEGORNHBTINROPIFSDIMEIGTITNOKSEALOVICFISRAEAJ?UWEPAEU',
    R: 'ROTFMAATIAIAGJLAASP?GUUECTNRRIOLRVMYVGASNOXEFDIIDHSOTWZTRNEOIEBAIYEIULDOPSHNWKR?EALENUNOQECEDEEEOTIB',
    S: 'SQOJDGAHIAAIBXCYCII?DERLUZSNI?IDNNMRGPMELEKOFGYLOWETVNNOVEOBOLUFRUTNHEOETAITSAAOWEAIRIDUATREAESTEERP',
    T: 'TCWIMNVOTAOKRANEZVGIEFOWOURFNXDAOHAIL?GEGEALTRRESICHLAENM?TOSNAUTNSEYDQYJBAAEEDSEIOERTOPDLUIEPIRBIUI',
    U: 'UFTUNTSIAR?COZTEMGRJIRMKRDEHLVIAEGEAXIEDAO?OOPTPBBFNYORARHCINIWEEWTGOSEAANLSTUUAELEINYAONEEOIVLQISDD',
    V: 'VRETPMPEVAAEEHTCOTENMEIIUWSIOZGARILOGAEIFEOWA?DQAYYIDONOFTXRRELURANSTCOLKTEENJGUOBIR?USANLDHAIIBNEDS',
    W: 'WAAVROAYAIIERNTTRIINOXOEPUOLHLGTITAEADDERBOSEROT?ONDECL?GTEUVILJZNQSKMSIEEUIEWAUCSINPDGEEARBYFFHNAOM',
    X: 'XPENAHAEAEWTLTRQDVNJTDHIR?SMUTOIITMNEAZETERBOUWROIOERALRFUSBKIECLLEOEDIAYFNOGEOUA?SIAINIESDGCYPGVNOA',
    Y: 'YEEAWRUVENLDSSTTZUEABOTIROOAAAONRIMDQFGDRXJGOYLLITTRFITEGSEE?SPBURHHEOANLAECDNOUCENEIWIIMEP?AAIVINKO',
    Z: 'ZQSELYRKALAFEBVFRUSHND?UE?REAAEITIGNALOURRAVGOTTXSOOYDMPOSAIEIIAEOIPRHEEETNTCBNMDUGDIJIOWLTCIEOENWNA'
}

var problem = "A";
var bag = "AIOIETPRTIRDDGNEOEDERUCERAAOIOEEFAHASZENKBBSTLRIURMSC?SFGLQETAIGEOYEAOOT?PVNUMLIJVWODNAIIAXLNEWNYUHT".split("");
var rack = [];
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var lowerAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
var COLUMNS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
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

var removeFromRack = function(r, word, replacements) {
    // log('w ' + word);
    var letters = word.split('');
    replacements.forEach(function (letter) {
        letters.push('?');
    })
    letters.forEach(function (letter) {
        // log("looking for " + letter + " in " + r.join(","));
        var index = r.indexOf(letter);
        if (index == -1) {
            log("Error in rack")
            throw "Invalid move error: " + letter + " not in " + r.join(",") + " index: " + index;
        }
        r.remove(index);
    });
    return r;
}

var removeHookFromWord = function(hook, word, error) {
    if (hook == '')
        return word;
    if (error === undefined)
        error = true;
    var result = hook.split('').some(function(hookLetter) {
        if (hookLetter == '?') return false;
        var index = word.indexOf(hookLetter);
        if (index == -1 && error) {
            log("Error in word " + word)
            throw "Invalid move error: " + hookLetter + " not in " + word + " index: " + index;
            return true;
        }
        word = word.substring(0, index) + word.substring(index + 1);
        return false;
    });
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
        var cellCol = horizontal?col:col+i;
        var cellRow = !horizontal?row:row+i;
		var cell = grid.rawCell(cellCol, cellRow);
		if (cell === null)
			return -1;
        // log('letter ' + letter + ' ' + score + ' * ' + letterMultiplier(cell) + ' ' + cell);
		score *= letterMultiplier(cell);
		multiplier = multiplier * wordMultiplier(cell);
        totalScore += score;
    });
    // log('word ' + letters.join('') + ' ' + totalScore + ' * ' + multiplier);
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

// rack and hook should be arrays
// word is a string
function rackLength(rack, word, hook) {
    var result = reduceRack(rack, word, hook);
    if (result)
        return result.length;
    else 
        return -1;
}
function reduceRack(rack, word, hook, debug) {
    if (debug)
        log("input hook: " + hook);
    var failed = word.split('').some(function(letter) {
        if (letter === letter.toLowerCase())
            return false;
        var index = hook.indexOf(letter);
        if (index !== -1) {
            hook.splice(index,1);
            if (debug)
                log('h ' + hook + " took " + letter);
            return false;
        }
        index = rack.indexOf(letter);
        if (index === -1) {
            if (debug)
                log("Rack " + rack + " doesn't have " + letter + " from word " + word + " hook " + hook)
            return true;
        } else {
            rack.splice(index,1);
        }
        return false;
    });
    if (failed)
    {
        return null;
    } else {
        return rack;
    }
}

function saveProgress(grid, foundWords) {

    log('Saving the progress for later');
    console.time('write');
    var output = '\n';
    grid.print(function(data) { output += data + '\n';});

    output += 'Result\n' + problem + ':\n' + foundWords.map(function(f) {return f.join(' ');}).join(',\n');
    fs.writeFileSync(problem + '.log', output, {encoding:'utf8'});
    console.timeEnd('write');
}

function processAll() {
try {
    log('ready to process');

    // console.time('search2');
    // var rack = 'abatisr'.split('');
    // log("All words that can be formed using " + rack.join(', ') + ": ");
    // log(gaddag.findWordsWithRackAndHook(rack, ''));
    // console.timeEnd('search2');
    var totalScore = 0;
    var foundWords = [];
    var firstWord = true;
    // grid.wordH(2, 2, 'hello');
    // grid.wordV(2, 2, 'hello');
    // grid.print();

    // log("prefix: " + gaddag.findWordsWithRackAndHook('train'.split(''), 'ing').join(','));

    // log("0,0: " + (board.cell(0,0) == 'T'));
    grid.print();
    grid.lexicon = lexicon;
    var col = 3;
    var row = 7;
    while (bag.length > 0 || rack.length > 0)
    {
        fillRack();
        log('Starting Rack: ' + rack);
        
        var word = null;
        var wordHook = null;
        var wordScore = 0;
        var wordReplacements = null;
        var wordCol = 0;
        var wordRow = 0;
        var wordHorizontal = true;

        if (firstWord) {
            col = 7;
            for (row = 1; row < grid.size / 2; row++) {
                processRack(rack, [], '', firstWord, false);
            };
            row = 7;
            for (col = 1; col < grid.size / 2; col++) {
                processRack(rack, [], '', firstWord, true);
            }
            firstWord = false;
        } else {
            var hookRow;
            var hookCol;
            var hookLetters;
            for (row = 0; row < grid.size; row++) {
                for (col = 0; col < grid.size; col++) {
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
                    processRack(rack.slice(0), [], hookLetters.join(''), firstWord, false);
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
                    processRack(rack.slice(0), [], hookLetters.join(''), firstWord, true);
                }
            };
        }

        function processRack(rack, replacements, hook, firstWord, horizontal) {
            // log("process hook " + hook);
            var index = rack.indexOf('?');
            if (index != -1) {
                log("Replace ? in rack: " + rack.join(""));
                lowerAlphabet.forEach(function(letter) {
                    var filledRack = rack.slice(0);
                    filledRack[index] = letter;
                    var r = replacements.slice(0);
                    r.push(letter);
                    processRack(filledRack, r, hook, firstWord, horizontal);
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
                    // if (hook.length > 0) {
                    //     if (horizontal) { // This is horizontal so previous was vertical so work off row
                    //         itemCol -= item.indexOf(hook);
                    //         itemRow = row + hookIndex;
                    //     } else {
                    //         itemCol = col + hookIndex;
                    //         itemRow -= item.indexOf(hook);
                    //     }
                    // }

                    if (!grid.fits(itemCol,itemRow,horizontal,item))
                        return;

                    // var tempItem = '' + item;
                    // replacements.forEach(function (letter) { tempItem = removeHookFromWord(letter, tempItem, false) });
                    // var itemScore = scoreLetters(tempItem.split(''), itemCol, itemRow, horizontal);

                    var leftOver = rackLength(rack.slice(0), item, hook.split(''));
                    var itemScore = grid.validateMove(item, itemCol, itemRow, horizontal, firstWord, leftOver);
                    if (itemScore > 0)
                        log("(" + itemCol + ", " + itemRow + ") " + (horizontal?'h ':'v ') + item + " - " + hook + ' = ' + itemScore);

                    if (itemScore > 0 && itemScore > wordScore) {
                        wordReplacements = replacements;
                        wordHook = hook;
                        word = item;
                        wordCol = itemCol;
                        wordRow = itemRow;
                        wordHorizontal = horizontal;
                        wordScore = itemScore;
                        log('^^^^^^ best so far');
                    }
                }, this);
        }

        log('word: ' + word);
        if (!word || word.length == 0)
        {
            log("Reached end rack " + rack.join("") + " bag " + bag.length);
            break;
        }
        // log("Scoring word: " + word + ' replacements: ' + wordReplacements + ' hook: ' + wordHook);
        // var foundWord = word;
        // wordReplacements.forEach(function (letter) { word = removeHookFromWord(letter, word, false) });
        // var scoreWord = word;
        // word = removeHookFromWord(wordHook, word);
        var wordRack = rack.slice(0).join('');
        // removeFromRack(rack, word, wordReplacements);
        // wordScore = score(scoreWord, rack, wordCol, wordRow, wordHorizontal);
        rack = reduceRack(rack.slice(0), word, wordHook.split(''), true);
        var position = ROWS[wordRow] + COLUMNS[wordCol];
        if (!wordHorizontal) {
            position = COLUMNS[wordCol] + ROWS[wordRow];
        }
        var remainingRack = rack.join('');
        if (wordHook) {
            log(position + ' ' + word + " off hook " + wordHook + " using " + wordRack + " leftover letters " + remainingRack + " scores " + wordScore);
        } else {
            log(position + ' ' + word + " using " + wordRack + " leftover letters " + remainingRack + " scores " + wordScore);
        }
        totalScore += wordScore;
        log('total: ' + totalScore);
        foundWords.push([position, word, wordScore]);
        grid.addWord(word, wordCol, wordRow, wordHorizontal);
        grid.print();
        saveProgress(grid, foundWords);

        // Setup for next word
		// horizontal = !wordHorizontal;
  //       col = wordCol;
		// row = wordRow;

        // log("Rack: " + rack.join(", "));
    }
    var bagScore = scoreLettersRaw(bag);
    var rackScore = scoreLettersRaw(rack);
    log("Total Score: " + totalScore  + " bagScore: -" + bagScore + " rackScore: -" + rackScore + " Final Score: " + (totalScore - bagScore - rackScore));

} finally {
    log('Result\n' + problem + ':\n' + foundWords.map(function(f) {return f.join(' ');}).join(',\n'));
}
}


if (process.argv.length > 2) {
    problem = process.argv[2].toUpperCase();
    bag = problems[problem].split('');
    if (bag === null) {
        log('Please supply a letter A-Z');
        process.exit(1);
    }
    log('Problem: ' + problem);
    log('Bag: ' + bag);

}
var loader = new LexiconLoader();
loader.load((function(l) {
    lexicon = l;
    processAll();
}).bind(this));