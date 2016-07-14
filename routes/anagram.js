var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var SpellCheck = require('hunspell-spellchecker');
var spellcheck = new SpellCheck();

var dataPath = path.resolve('.', 'data', 'hunspell_dictionaries');
console.log('dataPath = ' + dataPath);
var spellcheckDict = spellcheck.parse({
    aff: fs.readFileSync(path.join(dataPath, 'en_US.aff')),
    dic: fs.readFileSync(path.join(dataPath, 'en_US.dic'))
});
spellcheck.use(spellcheckDict);

router.post('/test', function(req, res) {
    var strings = req.body.strings;
    var test = req.body.test;
    var anagrams = [];
    var partials = [];
    for (var i = 0; i < strings.length; i++) {
        var str = strings[i];
        var ok = true;
        if (test && test instanceof Array) {
            var anyok = false;
            for (var t = 0; t < test.length; t++) {
                //var testok = !spellcheck.isMisspelled(str[test[t]]);
                //var temp = spellcheck.getCorrectionsForMisspelling(str[test[t]]);
                var testok = spellcheck.check(str[test[t]]);
                anyok |= testok;
                ok &= testok;
            }
            if (!ok && anyok) {
                partials.push(str);
            }
        } else if (test) {
            //ok = !spellcheck.isMisspelled(str[test]);
            ok = spellcheck.check(str[test]);
        } else {
            //ok = !spellcheck.isMisspelled(str);
            ok = spellcheck.check(str);
        }
        if (ok) anagrams.push(str);
    }

    res.status(200).send({ success: true, found: anagrams.length, anagrams: anagrams, partial: partials.length, partials: partials });
});


module.exports = router;
