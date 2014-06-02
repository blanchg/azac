var log = require('./util.js').log;
function Trie() {
    if (!(this instanceof Trie))
        return new Trie();

    this.trie = {};

}

Trie.prototype.removeAll = function() {
    delete this.trie;
    this.trie = {};
}

Trie.prototype.addAll = function (words) {
    for (var i = 0, l = words.length; i < l; i++) {
        this.add(words[i]);
    }

    return this;
}

Trie.prototype.add = function (word) {
    // log('word ' + word);
    var letters = word.split(""),
        cur = this.trie;

    for (var j = 0; j < letters.length; j++) {
        var letter = letters[j], pos = cur[ letter ];
        // log('letter ' + letter + ' pos ' + JSON.stringify(pos));
        if (pos == null) {
            cur = cur[ letter ] = j === letters.length - 1 ? 0 : {};

        } else if (pos === 0) {
            cur = cur[ letter ] = { $:0 };

        } else {
            cur = cur[ letter ];
        }
    }
    if (pos !== null) {
        cur[ '$' ] = 0;
    }

    return this;
}

// Returns the JSON structure
Trie.prototype.getTrie = function () {
    return this.trie;
}

Trie.prototype.setTrie = function (value) {
    this.trie = value;
}

// Prints all words contained in the Trie
Trie.prototype.getWords = function () {

    // from John Resig's dump-trie.js

    var words = [];
    dig("", this.trie);
    return( words );

    function dig(word, cur) {
        for (var node in cur) {
            var val = cur[ node ];

            if (node === "$") {
                words.push(word);

            } else if (val === 0) {
                words.push(word + node);

            } else {
                dig(word + node, val);
            }
        }
    }
}

Trie.prototype.getJson = function () {

    // Commented .replace(...) for debugging as I need the quotes to visualize JSON.
    var ret = JSON.stringify(this.trie); //.replace(/"/g, "");

    var reserved = [ "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
        "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends",
        "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in",
        "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected",
        "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws",
        "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with" ];

    for (var i = 0; i < reserved.length; i++) {
        ret = ret.replace(new RegExp("([{,])(" + reserved[i] + "):", "g"), "$1'$2':");
    }

    return(ret);
}

module.exports.Trie = Trie;

/*
// Test code
var t = new Trie();
t.addAll(["CAR", "CARE", "CARREL", "PRECEDE", "PRESTO", "RADIUS"]);
console.log("JSON string: " + t.getJson() + "\n");
console.log("Words: " + t.getWords().join(', '));
*/
