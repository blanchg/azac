// requires trie.js and util.js

// TODO: Handle no hook case - just use first function?
//          or maybe make each rack letter a hook and call recursive function

// If not browser, assume nodejs
if (typeof browser === 'undefined') {
    var Trie = require('./trie.js').Trie;
    var log = require('./util.js').log;

}

function Gaddag() {

    var separator = ">";

    this.add = function (word) {

        if (word.length === 0) return;

        for (var i = 1; i < word.length; i++) {
            var prefix, ch;

            prefix = word.substring(0, i);
            ch = prefix.split('');
            ch.reverse();
            Gaddag.prototype.add(ch.join('') + separator + word.substring(i));
        }

        ch = word.split('');
        ch.reverse();
        Gaddag.prototype.add(ch.join('') + separator + word.substring(i));
    };

    this.findWord = function(word) {
        var trie = Gaddag.prototype.getTrie();
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

    this.findWordsWithHook = function (hook) {
        var trie = Gaddag.prototype.getTrie();
        var starterNode = trie[hook];
        var words = [];

        if (typeof starterNode === 'undefined') return;

        dig(hook, starterNode, 'reverse');
        return words;

        function dig(word, cur, direction) {
            for (var node in cur) {
                var val = cur[ node ],
                    ch = (node === separator || node === "$" ? '' : node);

                if (val === 0) {
                    words.push(word + ch);

                } else {
                    // nodes after this form the suffix
                    if (node === separator) direction = 'forward';

                    var part = (direction === 'reverse' ? ch + word : word + ch);
                    dig(part, val, direction);

                }

                // done with the previous subtree, reset direction to indicate we are in the prefix part of next subtree
                if (node === separator) direction = 'reverse';
            }
        }
    }

    this.findWordsWithSuffix = function (suffix) {
        var trie = Gaddag.prototype.getTrie();
        var starterNode = trie;
        var words = [];

        suffix.split('').reverse().some(function(letter) {
            console.log(typeof starterNode);
            if (typeof starterNode === 'undefined') return true;
            starterNode = starterNode[letter];
            return false;
        })

        if (typeof starterNode === 'undefined') return;

        dig(suffix, starterNode, 'reverse');
        return words;

        function dig(word, cur, direction) {
            for (var node in cur) {
                var val = cur[ node ],
                    ch = (node === separator || node === "$" ? '' : node);

                if (val === 0) {
                    words.push(word + ch);

                } else {
                    // nodes after this form the suffix
                    if (node === separator) direction = 'forward';

                    var part = (direction === 'reverse' ? ch + word : word + ch);
                    dig(part, val, direction);

                }

                // done with the previous subtree, reset direction to indicate we are in the prefix part of next subtree
                if (node === separator) direction = 'reverse';
            }
        }
    }

    /**
     * rack is array
     * hook is string
     */
    this.findWordsWithRackAndHook = function (rack, hook) {
        var trie = Gaddag.prototype.getTrie();
        var words = [];

        /* To avoid recursing down duplicate characters more than once, sort the array and check whether we have already
         processed a letter before descending the subtree.
         */
        rack.sort();

        if (hook === '') {
            /*
                Each character in the rack acts as a hook with the remaining characters as the new rack.
            */
            while(rack.length > 1) {
                var h = rack.shift();
                findWordsRecurse("", rack, h, trie, 'reverse');
            }
        } else if (hook.length > 1) {
            // if (typeof(hook) == 'string') {
            //     hook = hook.split('');
            // }
            if (hook.indexOf('?') != -1) {
                searchGaps(hook, rack.slice(0));
                while (hook[0] == '?') {
                    hook = hook.substr(1);
                    searchGaps(hook, rack.slice(0));
                }
                function searchGaps(hook, searchRack) {
                    // log('Hook: ' + hook + " rack: " + searchRack + ' words ' + words);
                    var index = hook.indexOf('?');
                    // log('Index: ' + index);
                    if (index != -1) {
                        if (index != 0) {
                            // Find words up to the next gap
                            // log('Finding words with ' + hook.substr(0, index));
                            findWordsWithPart(hook.substr(0, index), trie, []);
                            // log('words: ' + words);
                        }
                        if (searchRack.length == 0) {
                            return;
                        }

                        searchRack.forEach(function (rackLetter, i) {
                            // log('  rack letter ' + rackLetter + ' index ' + index + ' rack ' + searchRack);
                            var tempRack = searchRack.slice(0);
                            // log('temp rack: ' + tempRack[i]);
                            var hookArray = hook.split('');
                            hookArray[index] = tempRack[i];
                            hook = hookArray.join('');
                            tempRack.splice(i, 1);
                            // log('hook: ' + hook + ' temp rack: ' + tempRack);
                            searchGaps(hook.slice(0), tempRack);
                        });
                    } else {
                        // log('searching ' + hook + JSON.stringify(trie));
                        findWordsWithPart(hook.slice(0), trie, []); //searchRack.slice(0)
                    }
                }
            } else {
                findWordsWithPart(hook, trie, rack);
            }
        } else {
            findWordsRecurse("", rack, hook, trie, 'reverse');
        }

        return words.unique();

        function findWordsWithPart(hook, trie, rack) {
            var searchTrie = findSuffix(hook, trie);
            if (searchTrie) {
                var direction = 'reverse';
                if (searchTrie['>'] !== undefined) {
                    direction = 'forward';
                    searchTrie = searchTrie['>'];
                }
                // log('search trie ' + JSON.stringify(searchTrie));
                if (rack.length == 0)
                {
                    // log('searching with no rack using hook ' + hook + ' ' + JSON.stringify(searchTrie));
                    if (searchTrie === 0 || searchTrie['$'] === 0) {
                        // log('WORD FOUND');
                        words.push(hook);
                    }
                } else {
                    rack.forEach(function(h) {
                        findWordsRecurse(hook, rack, h, searchTrie, direction);
                    });
                }
            }
        }

        function findSuffix(suffix, trie) {
            var search = trie;
            // if (typeof(suffix) != 'string')
            //     suffix = suffix.join('');
            suffix.split('').reverse().some(function(letter) {
                // log('suffix letter ' + letter);
                if (typeof search === 'undefined') return true;
                search = search[letter];
                // log('suffix trie ' + JSON.stringify(search));
                return false;
            });
            return search;
        }

        function findPrefix(prefix, trie) {
            var search = trie;
            prefix.split('').some(function(letter) {
                if (typeof search === 'undefined') return true;
                if (search['>'])
                    search = search['>'];
                search = search[letter];
                return false;
            });
            return search;
        }

        function findWordsRecurse(word, rack, hook, cur, direction) {
            var hookNode = cur[ hook ];

            if (typeof hookNode === 'undefined') return;

            var hookCh = (hook === separator || hook === "$" ? '' : hook);
            word = (direction === "reverse" ? hookCh + word : word + hookCh);
            for (var nodeKey in hookNode) {
                var nodeVal = hookNode[ nodeKey ];
                var nodeCh = (nodeKey === separator || nodeKey === "$" ? '' : nodeKey);

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
                    if (nodeKey === separator) {
                        findWordsRecurse(word, rack, separator, hookNode, 'forward');
                    }
                    else {
                        // descend down the next subtree that is rooted at any letter in the rack (which is not a duplicate)
                        processRack(word, rack, nodeKey, hookNode, direction);
                    }
                }
            }
        }

        function processRack(word, rack, nodeKey, hookNode, direction) {
            for (var i = 0; i < rack.length; i++) {
                if (nodeKey === rack[i]) {
                    var duplicate = (i > 0 ? (rack[i] === rack[i - 1] ? true : false) : false);
                    if (!duplicate) {
                        var newRack = rack.slice(0);
                        newRack.remove(i);
                        findWordsRecurse(word, newRack, nodeKey, hookNode, direction);
                    }
                }
            }
        }
    }
}

// Inherit from Trie
Gaddag.prototype = new Trie();

// If not browser, assume nodejs
if (typeof browser === 'undefined')
    module.exports.Gaddag = Gaddag;
