// Utility functions

// Array Remove - By John Resig (MIT Licensed)
// http://ejohn.org/blog/javascript-array-remove/
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

// http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/#comment-348025468
Array.prototype.unique = function(){
    return this.filter(function(s, i, a){ return i == a.lastIndexOf(s); });
}

/*
    message - Message to log.
    newline - If true, a new line is appended to the logged message. Default is true.
 */
function log(message, newline) {

    // for convenience, set default to true
    if(typeof newline === 'undefined')
        newline = false;

    // If not browser, assume nodejs
    if (typeof browser === 'undefined') {
        console.log(message + (newline ? "\n" : ""));
    } else {
        document.write(message + (newline ? "<br/><br/>" : ""));
    }
}


// If not browser, assume nodejs
if (typeof browser === 'undefined') {
    module.exports.log = log;
}

if (![].fill) {
  Array.prototype.fill = function(value) {

    // Steps 1-2.
    var O = Object(this);

    // Steps 3-5.
    var len = parseInt(O.length);

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = parseInt(start) || 0;

    // Step 8.
    var k = relativeStart < 0
            ? Math.max(len + relativeStart, 0)
            : Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined
                      ? len 
                      : (parseInt(end) || 0);

    // Step 11.
    var final = relativeEnd < 0
                ? Math.max(len + relativeEnd, 0)
                : Math.min(relativeEnd, len);

    // Step 12.
    for (; k < final; k++) {
        O[k] = value;
    }

    // Step 13.
    return O;
  };
}