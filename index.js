
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

// rack and hook should be arrays
// word is a string
function rackLength(rack, word, hook, replacements) {
    var result = reduceRack(rack, word, hook, false, replacements);
    // log('Result: ' + result);
    if (result !== null)
        return result.length;
    else 
        return -1;
}
function reduceRack(rack, word, hook, debug, replacements) {
    if (debug) {
        log("input word: " + word)
        log("input hook: " + hook);
        log("input rack: " + rack);
        log("input replacements: " + replacements);
    }
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
            index = replacements.indexOf(letter.toLowerCase());
            if (index !== -1) {
                replacements.splice(index,1);
                if (debug)
                    log('r ' + replacements + " replaced " + letter + ' with ?');

                // letter = '?';
                index = rack.indexOf(letter.toLowerCase());
                if (index !== -1) {
                    rack.splice(index,1);
                    return false;
                }
            }
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
        // log("Returning rack: '" + rack.join('') + "'");
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

    var totalScore = 0;
    var foundWords = [];
    var firstWord = true;

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
                    if (grid.beforeEmpty(col, row, false))
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
                    if (grid.beforeEmpty(col, row, true))
                        processRack(rack.slice(0), [], hookLetters.join(''), firstWord, true);
                }
            };
        }

        function processRack(rack, replacements, hook, firstWord, horizontal) {
            // log("process hook " + hook);
            var index = rack.indexOf('?');
            if (index != -1) {

                log('Rack: ' + rack.join(''));
                // log("Replace ? in rack: " + rack.join(""));
                lowerAlphabet.forEach(function(letter) {
                    var filledRack = rack.slice(0);
                    filledRack[index] = letter;
                    var r = replacements.slice(0);
                    r.push(letter);
                    processRack(filledRack, r, hook, firstWord, horizontal);
                }, this);
                return;
            } else {
                // log('   Rack: ' + rack.join(''));
            }

            candidates = lexicon.findWordsWithRackAndHook(rack.slice(0), hook);
            log("Rack: " + rack.join("") + " In Bag: " + bag.length + " Candidates: " + candidates.length);
            if (!candidates || candidates.length == 0)
                return;

            candidates.forEach(
                function (item) {
                    var itemCol = col;
                    var itemRow = row;

                    log('Have word: ' + item);
                    if (!grid.fits(itemCol,itemRow,horizontal,item))
                        return;

                    var leftOver = rackLength(rack.slice(0), item, hook.split(''), replacements.slice(0));
                    log("Left over: " + leftOver);
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
        var wordRack = rack.slice(0).join('');
        rack = reduceRack(rack.slice(0), word, wordHook.split(''), true, wordReplacements);
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

    }
    var bagScore = grid.scoreWord(bag);
    var rackScore = grid.scoreWord(rack);
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