var Trie = require('./trie.js').Trie;
var log = require('./util.js').log;

function Gaddag() {
    if (!(this instanceof Gaddag))
        return new Gaddag();
    Trie.call(this);
    this.separator = ">";
}

// Inherit from Trie
Gaddag.prototype =  Object.create(Trie.prototype);
// Gaddag.prototype =  new Trie();
Gaddag.prototype.constructor = Gaddag;

Gaddag.prototype.add = function (word) {

    if (word.length === 0) return;

    for (var i = 1; i < word.length; i++) {
        var prefix, ch;

        prefix = word.substring(0, i);
        ch = prefix.split('');
        ch.reverse();
        Trie.prototype.add.call(this, ch.join('') + this.separator + word.substring(i));
    }

    ch = word.split('');
    ch.reverse();
    Trie.prototype.add.call(this, ch.join('') + this.separator + word.substring(i));
}

Gaddag.prototype.findWord = function(word) {
    var trie = this.getTrie();

    word.split('').some(function (letter) {
        if (trie === undefined)
            return true;

        if (trie['>']) {
            trie = trie['>'];
        }
        trie = trie[letter];
    },this);

    if (trie !== undefined && 
        (trie === 0 || trie['$'] !== undefined)) {
        return true;
    } else {
        return false;
    }
}

Gaddag.prototype.findWordsWithHook = function (hook) {
    var trie = this.getTrie();
    var starterNode = trie[hook];
    var words = [];

    if (typeof starterNode === 'undefined') return;

    this.dig(hook, starterNode, 'reverse', words);
    return words;
}



Gaddag.prototype.dig = function(word, cur, direction, words) {
    for (var node in cur) {
        var val = cur[ node ],
            ch = (node === this.separator || node === "$" ? '' : node);

        if (val === 0) {
            words.push(word + ch);

        } else {
            // nodes after this form the suffix
            if (node === this.separator) direction = 'forward';

            var part = (direction === 'reverse' ? ch + word : word + ch);
            this.dig(part, val, direction, words);

        }

        // done with the previous subtree, reset direction to indicate we are in the prefix part of next subtree
        if (node === this.separator) direction = 'reverse';
    }
}

Gaddag.prototype.findWordsWithSuffix = function (suffix) {
    var trie = this.getTrie();
    var starterNode = trie;
    var words = [];

    suffix.split('').reverse().some(function(letter) {
        console.log(typeof starterNode);
        if (typeof starterNode === 'undefined') return true;
        starterNode = starterNode[letter];
        return false;
    }, this);

    if (typeof starterNode === 'undefined') return;

    dig(suffix, starterNode, 'reverse');
    return words;

    function dig(word, cur, direction) {
        for (var node in cur) {
            var val = cur[ node ],
                ch = (node === this.separator || node === "$" ? '' : node);

            if (val === 0) {
                words.push(word + ch);

            } else {
                // nodes after this form the suffix
                if (node === this.separator) direction = 'forward';

                var part = (direction === 'reverse' ? ch + word : word + ch);
                dig(part, val, direction);

            }

            // done with the previous subtree, reset direction to indicate we are in the prefix part of next subtree
            if (node === this.separator) direction = 'reverse';
        }
    }
}

/**
 * rack is array
 * hook is string
 */
Gaddag.prototype.findWordsWithRackAndHook = function (rack, hook) {
    var trie = this.getTrie();
    var words = [];

    /* To avoid recursing down duplicate characters more than once, sort the array and check whether we have already
     processed a letter before descending the subtree.
     */
    rack.sort();
    // rack = rack.map(function(letter) { return letter.toUpperCase()});

    if (hook === '') {
        /*
            Each character in the rack acts as a hook with the remaining characters as the new rack.
        */
        while(rack.length > 1) {
            var h = rack.shift();
            this.findWordsRecurse("", rack, h, trie, 'reverse', words);
        }
    } else if (hook.length > 1) {
        // if (typeof(hook) == 'string') {
        //     hook = hook.split('');
        // }
        if (hook.indexOf('?') != -1) {
            this.searchGaps(hook, rack.slice(0), trie, words, false);
            // while (hook[0] == '?') {
            //     hook = hook.substr(1);
            //     this.searchGaps(hook, rack.slice(0), trie, words, false);
            // }
        } else {
            this.findWordsWithPart(hook, trie, rack, words, false);
        }
    } else {
        this.findWordsRecurse("", rack, hook, trie, 'reverse', words);
    }

    return words.unique();
}

Gaddag.prototype.searchGaps = function(hook, searchRack, trie, words, rackUsed) {
        log('Hook: ' + hook + " rack: " + searchRack + ' words ' + words);
    var index = hook.indexOf('?');
    // log('Index: ' + index);
    if (index != -1) {
        if (index != 0) {
            // Find words up to the next gap
            // log('Finding words with ' + hook.substr(0, index));
            this.findWordsWithPart(hook.substr(0, index), trie, [], words, rackUsed);
            // log('words: ' + words);
        }
        if (searchRack.length == 0) {
            return;
        }

        searchRack.forEach(function (rackLetter, i) {
            log('  rack letter ' + rackLetter + ' index ' + index + ' rack ' + searchRack);
            var tempRack = searchRack.slice(0);
            log('temp rack: ' + tempRack[i]);
            var hookArray = hook.split('');
            hookArray[index] = tempRack[i];
            hook = hookArray.join('');
            tempRack.splice(i, 1);
            log('hook: ' + hook + ' temp rack: ' + tempRack);
            this.searchGaps(hook.slice(0), tempRack, trie, words, true);
        }, this);
    } else {
        // log('searching ' + hook + JSON.stringify(trie));
        this.findWordsWithPart(hook.slice(0), trie, [], words, rackUsed); //searchRack.slice(0)
    }
}

Gaddag.prototype.findWordsWithPart = function(hook, trie, rack, words, rackUsed) {
    log('trie ' + JSON.stringify(trie, null, 2));
    var searchTrie = this.findSuffix(hook, trie);
    log('searchtrie ' + JSON.stringify(searchTrie, null, 2));
    if (searchTrie) {

        // rack.forEach(function(h) {
        //     log('h ' + h + ' hook ' + hook + ' rack ' + rack);
        //     this.findWordsRecurse(hook, rack, h, searchTrie, direction, words);
        // }, this);
        var direction = 'reverse';
        if (searchTrie['>'] !== undefined) {
            direction = 'forward';
            searchTrie = searchTrie['>'];
        }
        log('search trie ' + JSON.stringify(searchTrie));
        if (rack.length == 0)
        {
            log('searching with no rack using hook ' + hook + ' ' + JSON.stringify(searchTrie));
            if (rackUsed && (searchTrie === 0 || searchTrie['$'] === 0)) {
                log('WORD FOUND: ' + hook);
                words.push(hook);
            }
        } else {
            rack.forEach(function(h) {
                log('h ' + h + ' hook ' + hook + ' rack ' + rack);
                this.findWordsRecurse(hook, rack, h, searchTrie, direction, words);
            }, this);
        }
    }
}

Gaddag.prototype.findSuffix = function(suffix, trie) {
    var search = trie;
    // if (typeof(suffix) != 'string')
    //     suffix = suffix.join('');
    suffix.split('').reverse().some(function(letter) {
        log('suffix letter ' + letter);
        if (typeof search === 'undefined') return true;
        search = search[letter.toUpperCase()];
        log('suffix trie ' + JSON.stringify(search));
        return false;
    }, this);
    return search;
}

Gaddag.prototype.findPrefix = function(prefix, trie) {
    var search = trie;
    prefix.split('').some(function(letter) {
        if (typeof search === 'undefined') return true;
        if (search['>'])
            search = search['>'];
        search = search[letter.toUpperCase()];
        return false;
    }, this);
    return search;
}

Gaddag.prototype.findWordsRecurse = function(word, rack, hook, cur, direction, words) {
    // log("this " + this);
    var hookNode = cur[ hook.toUpperCase() ];
    log('hookNode ' + JSON.stringify(hookNode));
    if (typeof hookNode === 'undefined') return;
    log('sep ' + this.separator);

    var hookCh = (hook === this.separator || hook === "$" ? '' : hook);
    word = (direction === "reverse" ? hookCh + word : word + hookCh);
    for (var nodeKey in hookNode) {
        var nodeVal = hookNode[ nodeKey ];
        var nodeCh = (nodeKey === this.separator || nodeKey === "$" ? '' : nodeKey);

        // if we have reached the end of this subtree, add the word (+ last character) to output array
        if (nodeVal === 0) {
            // words.push(word + nodeCh);
            if(nodeCh != '' && rack.indexOf(nodeCh) === -1) {
                continue;
            }
            else {
                words.push(word + nodeCh);
            }
        } else {
            // if this is the character separating the prefix, change direction and continue recursing
            if (nodeKey === this.separator) {
                this.findWordsRecurse(word, rack, this.separator, hookNode, 'forward', words);
            }
            else {
                // descend down the next subtree that is rooted at any letter in the rack (which is not a duplicate)
                this.processRack(word, rack, nodeKey, hookNode, direction, words);
            }
        }
    }
}

Gaddag.prototype.processRack = function(word, rack, nodeKey, hookNode, direction, words) {
    for (var i = 0; i < rack.length; i++) {
        if (nodeKey === rack[i].toUpperCase()) {
            var h = rack[i];
            var duplicate = (i > 0 ? (rack[i] === rack[i - 1] ? true : false) : false);
            if (!duplicate) {
                var newRack = rack.slice(0);
                newRack.remove(i);
                this.findWordsRecurse(word, newRack, h, hookNode, direction, words);
            }
        }
    }
}

module.exports.Gaddag = Gaddag;
