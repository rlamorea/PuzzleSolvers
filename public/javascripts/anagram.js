var anagram = function() {
    // build an array of common, uncommon, unlikely letter combos
    var commonCombos = {
        'A': 'BCDFGHIJLMNPQRSTVWZ',
        'B': 'AEILORSU',
        'C': 'AEHIKLORSTU',
        'D': 'AEIORSU',
        'E': 'ACDEFGILMNQRST',
        'F': 'AEFILORSU',
        'G': 'AEHILORSU',
        'H': 'AEIOU',
        'I': 'CDEFLMNORST',
        'J': 'AEIOU',
        'K': 'AEILNORSUY',
        'L': 'AEFGIKLMNOPRSTUVY',
        'M': 'AEIMNOPSTUY',
        'N': 'ACDEGIKNOSTUVY',
        'O': 'ACDFHILMNOPRSTUVWXYZ',
        'P': 'AEHILOPRSTUY',
        'Q': 'U',
        'R': 'ABCDEGIKLMNOPRSTUVY',
        'S': 'ACEHIKLMNOPQUSTUWY',
        'T': 'ACEHILORSTUWY',
        'U': 'ACDHILMNOPRST',
        'V': 'AEIOU',
        'W': 'AEILNORSU',
        'X': 'E',
        'Y': 'AELORSTU',
        'Z': 'AEILOSUWYZ'
    };
    var consonants = "BCDFGHJKLMNPQRSTVWXZ";
    var vowels = "AEIOUY";

    // heuristic:
    // *wordScore = +15pts for start with consonant
    // *wordScore = +5pts for vowel -> consonant or consonant -> vowel
    // *wordScore = +25pts for "common" transition
    // *wordScore = -10pts for once-repeated vowel
    // *wordScore = -5pts for once-repeated consonant
    // *wordScore = -100pts for twice-repeated+ letter (3 in a row)
    // *wordScore = -20pts for triple vowel
    // *wordScore = -50pts for quadruple+ vowel
    // *wordScore = -10pts for triple consonant
    // *wordScore = -25pts for quadruple+ consonant
    score = function(word, capitalized) {
        if (!capitalized) word = word.toUpperCase();
        var pts = 0;
        var lastLetter = null;
        var lastLetterType = null;
        var letterRepeatCount = 0;
        var letterTypeRepeatCount = 0;
        for (var i = 0; i < word.length; i++) {
            var letter = word[i];
            var letterType = (vowels.indexOf(letter) >= 0) ? 'vowel' : 'consonant';
            if (i == 0) {
                if (letterType == 'consonant') pts += 20;
            } else {
                if (lastLetterType != letterType) {
                    pts += 5;
                    letterTypeRepeatCount = 0;
                    letterRepeatCount = 0;
                } else if (lastLetter == letter) {
                    letterRepeatCount += 1;
                    if (letterRepeatCount > 1) {
                        pts -= 100;
                    } else {
                        pts -= (letterType == 'vowel' ? 10 : 5)
                    }
                } else {
                    letterRepeatCount = 0;
                    letterTypeRepeatCount += 1;
                    if (letterTypeRepeatCount == 2) {
                        pts -= (letterType == 'vowel' ? 20 : 10);
                    } else if (letterTypeRepeatCount > 2) {
                        pts -= (letterType == 'vowel' ? 50 : 25);
                    }
                }
                if (commonCombos[lastLetter].indexOf(letter) >= 0) {
                    pts += 20;
                }
            }
            lastLetter = letter;
            lastLetterType = letterType;
        }
        return pts;
    };

    var rank = function(wordArray, opts) {
        opts = opts || {};
        var ranked = [];
        for (var i = 0; i < wordArray.length; i++) {
            var word = wordArray[i];
            ranked.push({ word: word, score: score(word, opts.capitalized) });
        }
        ranked.sort(function(a, b) {
            var diff = b.score - a.score;
            return (diff == 0) ? a.word.localeCompare(b.word) : diff;
        }); // highest score first
        if (opts.justWords) {
            return ranked.map(function(v) { return v.word });
        } else {
            return ranked;
        }
    };

    var findPage = function(variants, tests, pageSize, start, end, anagrams, callback) {
        if (start == variants.length) {
            anagrams = _.sortedUniq(anagrams.sort());
            callback(null, anagrams);
            return;
        }

        console.log('testing variants ' + start + ' to ' + (end - 1));
        var page = variants.slice(start, end);
        var data = {
            strings: page,
            tests: tests
        };
        $.ajax({
            url: '/anagram/test',
            type: 'post',
            accepts: 'application/json',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data)
        }).then(function(resp) {
            if (resp.found > 0) {
                for (var i = 0; i < resp.anagrams.length; i++) {
                    anagrams.push(resp.anagrams[i]);
                }
            }
            start = end;
            end = Math.min(start + pageSize, variants.length);
            findPage(variants, tests, pageSize, start, end, anagrams, callback);
        }, function(err) {
            callback(err);
        });
    };

    var find = function(variants, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        var pageSize = options.pageSize || 1000;
        var anagrams = [];
        var start = 0;
        var end = Math.min(pageSize, variants.length);
        findPage(variants, options.tests, pageSize, start, end, anagrams, callback);
    };

    var combos = function(letters, c, remaining, curWord) {
        if (c == null) c = [];
        if (remaining == null) remaining = letters.toUpperCase();
        if (curWord == null) curWord = '';
        if (remaining.length === 0) {
            c.push(curWord);
        }
        for (var i = 0; i < remaining.length; i++) {
            var nextLetter = remaining[i];
            var nextWord = curWord + nextLetter;
            var nextRemaining = remaining.replace(nextLetter, '');
            combos(letters, c, nextRemaining, nextWord);
        }
        return c;
    };

    return {
        wordScore: score,
        rankWords: rank,
        combinations: combos,
        findAnagrams: find
    }
};

var Anagram = new anagram();
