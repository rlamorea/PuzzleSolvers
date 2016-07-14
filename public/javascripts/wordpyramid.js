$(function() {
    var startLevels = 6;
    var puzzle = {};

    var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function insertAlphabet(baseWord, index, combos) {
        for (var i = 0; i < ALPHABET.length; i++) {
            var word = baseWord;
            var letter = ALPHABET[i];
            if (index < 0) {
                word = letter + word;
            } else if (index >= baseWord.length) {
                word = word + letter;
            } else {
                word = baseWord.substring(0, index + 1) + letter + baseWord.substring(index + 1);
            }
            combos.push(word);
        }
    }

    function buildGuesses(baseWord, combos) {
        for (var i = 0; i < baseWord.length; i++) {
            insertAlphabet(baseWord, i - 1, combos);
        }
        insertAlphabet(baseWord, baseWord.length, combos);
    }

    function selectWord(e) {
        var word = $(e.target).text();
        var $choices = $('#choices');
        var level = $choices.data('level');
        puzzle.levelWords[level] = word;
        for (var i = 0; i < word.length; i++) {
            var ltr = word[i];
            $('.level-'+level+' .idx-'+i).val(ltr);
            setLetter(level, i, ltr);
        }
        $choices.html('');
    }

    function findWord(e) {
        var level = $(e.target).data('level');
        var curWord = puzzle.levelWords[level];
        var prevWord = puzzle.levelWords[level - 1];
        if (prevWord.indexOf(' ') >= 0) return;
        if (curWord.indexOf(' ') < 0) return;
        var combos =  Anagram.combinations(prevWord);
        var guessCombos = [];
        for (var c = 0; c < combos.length; c++) {
            buildGuesses(combos[c], guessCombos);
        }
        var rankedGuesses = Anagram.rankWords(guessCombos, { capitalized: true, justWords: true });
        Anagram.findAnagrams(rankedGuesses, function(err, anagrams) {
            var $choices = $('#choices');
            if (err) {
                $choices.addClass('bg-danger').text(err);
                return;
            } else if (anagrams.length === 0) {
                $choices.removeClass('bg-danger').text('None found');
                return;
            }
            $choices.data('level', level);
            $choices.removeClass('bg-danger').html('');
            for (var i = 0; i < anagrams.length; i++) {
                var $an = $('<li>').text(anagrams[i]);
                $an.click(selectWord);
                $choices.append($an);
            }
        });
    }

    function setLetter(level, idx, letter) {
        var prevLetters = puzzle.levelWords[level - 1];
        var word = puzzle.levelWords[level];
        var textLetter = (letter === 8 ? ' ' : letter);
        word = word.substr(0, idx) + textLetter + word.substr(idx+textLetter.length);
        puzzle.levelWords[level] = word;
        var letterCount = 0;
        $('.level-'+level+' .tile').removeClass('ref error');
        for (var i = 0; i < word.length; i++) {
            var ch = word[i];
            if (ch === ' ') continue;
            letterCount += 1;
            for (var p = 0; p < prevLetters.length; p++) {
                if (ch === prevLetters[p]) {
                    $('.level-'+level+' .idx-'+i).addClass('ref');
                    prevLetters = prevLetters.replace(ch, '');
                    break;
                }
            }
        }
        if (letterCount === word.length && prevLetters.length > 0) {
            $('.level-'+level+' .tile:not(.ref)').addClass('error');
        }
        $('.level-' + level + ' i.fa').toggleClass('active', letterCount < word.length);
        var nextIdx = idx;
        var nextLevel = level;
        if (letter === 8) {
            nextIdx = idx - 1;
            if (nextIdx < 0) {
                nextLevel = level - 1;
                nextIdx = nextLevel;
            }
        } else {
            nextIdx = idx + 1;
            if (nextIdx > level) {
                nextIdx = 0;
                nextLevel = level + 1;
            }
        }
        if (nextLevel >= 1 && nextLevel <= puzzle.levels) {
            $('.level-'+nextLevel+' .idx-'+nextIdx).focus();
            $('.level-'+nextLevel+' i.fa').toggleClass('active', puzzle.levelWords[nextLevel].indexOf(' ') >= 0);
        }
    }

    function createLevel(level) {
        var levelDiv = $('<div>').addClass('level level-'+level).data('level', level);
        var levelNo = $('<span>').addClass('levelNo').html(level === 0 ? '&nbsp;' : level.toString());
        levelDiv.append(levelNo);
        for (var col = 0; col <= level; col++) {
            var letterInp = $('<input>').prop({
                type: 'text',
                maxlength: 1,
                pattern: '[a-zA-Z]'
            }).addClass('tile idx-'+col).data('idx', col);
            letterInp.keyup(function(e) {
                var inp = $(e.target);
                var key = e.which;
                if (e.which !== 8) { // delete
                    key = String.fromCharCode(e.which).toUpperCase();
                }
                var level = parseInt(inp.parent().data('level'));
                var idx = parseInt(inp.data('idx'));
                if (!puzzle.firstLetter && level > 0) {
                    inp.val('');
                } else if (puzzle.firstLetter && level === 0) {
                    inp.val(puzzle.firstLetter); // once set, this cannot be changed
                } else if (key === 8 || /[a-zA-Z ]/.test(key)) {
                    inp.val(key === 8 ? ' ' : key);
                    if (level === 0) {
                        puzzle.firstLetter = key;
                        puzzle.levelWords[0] = key;
                        inp.prop('disabled', true);
                        $('.level-1 .idx-0').focus();
                    } else {
                        setLetter(level, idx, key);
                    }
                } else {
                    inp.val(puzzle.levelWords[level][idx]);
                }
                e.preventDefault();
            });
            levelDiv.append(letterInp);
        }
        var $find = $('<i>').addClass('fa fa-question-circle').data('level', level);
        $find.click(findWord);
        if (level <= 1) { $find.addClass('nofind'); }
        levelDiv.append($find);
        var levelMinus = $('<button>').html('&minus;');
        levelMinus.click(function(e) {
            var level = parseInt($(e.target).parent().data('level'));
            $('#level-'+level).remove();
            $('#addlevel button').data('nextlevel', level);
            puzzle.levels -= 1;
            puzzle.levelWords = _.dropRight(puzzle.levelWords);
        });
        if (level <= 2) { levelMinus.addClass('nodel'); }
        levelDiv.append(levelMinus);
        $('#addlevel').before(levelDiv);
        puzzle.levels += 1;
        puzzle.levelWords.push(_.pad('', level + 1));
    }

    function resetLevels() {
        $('.level').remove();
        puzzle = {
            firstLetter: null,
            levels: startLevels,
            levelWords: []
        };

        for (var level = 0; level <= startLevels; level++) {
            createLevel(level);
            $('#addlevel button').data('nextlevel', level + 1);
        }

        $('#addlevel button').click(function (e) {
            var nextLevel = parseInt($(e.target).data('nextlevel'));
            createLevel(nextLevel);
            $('#addlevel button').data('nextlevel', nextLevel + 1);
            puzzle.levels = nextLevel;
            puzzle.levelWords.push(_.pad('', nextLevel + 1));
        });
    }

    resetLevels();

    $('#new').click(resetLevels);
});

