var log = require('./util.js').log;
var fs = require('fs');
var WordFinder = function() {
    this.loadText = function (callback){
        this.data = "";
        this.totalWords = 0;

        this.lexicon = [];

        console.time('wordlist')
        fs.createReadStream('Lexicon.txt', {encoding:'utf8'})
            .on('data', (function (chunk) {this.handleData(chunk);}).bind(this))
            .on('end', (function () {
                this.handleData(this.data);
                // log('end');
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
                this.lexicon.push(word.toUpperCase())
            }, this);
            // log("Added " + this.totalWords + " words");
        }
    }
}


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

var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var scores = '1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10'.split(',').map(function(item){return parseInt(item)});

var problem = "A";
var bag = problems[problem].split("");

if (process.argv.length > 2) {
    problem = process.argv[2].toUpperCase();
    bag = problems[problem].split('');
    if (bag === null) {
        log('Please supply a letter A-Z');
        process.exit(1);
    }
}

log('Problem: ' + problem);
log('Bag: ' + bag);

function wordsInBag(words, bag) {
    return words.filter(function(word) {
        var tempBag = bag.slice(0);
        var failed = reduceBag(word, bag.slice(0));
        return !failed;
    });
}

function scoreWords(words) {
    return words.map(function(word) {
        var score = word.split('').reduce(function(prev, letter) {
                return prev + scores[ALPHABET.indexOf(letter)];
            }, 0);
        return {word:word,score:score};
    });
}

function sortByScore(a,b) {
    if (a.score > b.score) {
        return -1;
    } else if (b.score > a.score) {
        return 1;
    } else {
        return 0;
    }
}

function reduceBag(word, bag) {
    var failed = word.split('').some(function(letter) {
        var index = bag.indexOf(letter);
        if (index == -1) {
            return true;
        }
        bag[index] = bag[bag.length - 1];
        bag.length = bag.length - 1;
        return false;
    });
    return failed;
}

var finder = new WordFinder();
finder.loadText(function(words){
    var longWords = words.filter(function (word) {
        return word.length == 15;
    });

    log("LongWords: " + longWords.length);

    var possibleWords = wordsInBag(longWords, bag);

    log("Possible Words: " + possibleWords.length);

    var wordScores = scoreWords(possibleWords);

    wordScores.sort(sortByScore);

    // var bestScore = wordScores[0].score - 5;
    // wordScores = wordScores.filter(function(a) { return a.score >= bestScore});
    // log("Scores: " + wordScores.map(function(a) {return a.word + ": " + a.score}).join("\n"));

    var combinations = [];

    wordScores.forEach(function (score, i) {
        var firstWord = score.word;
        var leftover = bag.slice(0);
        reduceBag(firstWord, leftover);

        var secondWords = wordsInBag(possibleWords, leftover).slice(0,1);
        var secondWordScores = scoreWords(secondWords);
        secondWordScores.sort(sortByScore);
        log(" " + firstWord + " " + score.score + " : " + secondWordScores[0].word + " " + secondWordScores[0].score);
    });

});

