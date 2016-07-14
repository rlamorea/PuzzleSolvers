$(function() {
    var testVals = null;
    //{
    //    word: "luckiest",
    //    def: "soild adhesive in tube",
    //    pattern: "G___ _____"
    //};

    function init(word, def, pattern) {
        var puz = {
            state: 'create',
            baseWord: '',
            definition: '',
            pattern: '',
            lettersAvailable: '',
            currentState: '',
            selectedLetter: null,
            selectedSource: null,
            solved: false
        };

        if (!word && !pattern && testVals) {
            word = testVals.word;
            def = testVals.def;
            pattern = testVals.pattern;
            testVals = null;
        }
        if (word && pattern) {
            puz.baseWord = word.toUpperCase().trim();
            puz.definition = (def || 'no definition');
            puz.pattern = pattern.toUpperCase().trim();
            puz.state = 'run';
        }
        puz.currentState = puz.pattern;
        puz.lettersAvailable = puz.baseWord.replace(/ /g, '');

        return puz;
    }

    function setState(state) {
        var $actions = $('#actions');
        var $puzzle = $('#puzzle');
        state = state || puzzle.state;
        puzzle.state = state;
        $actions.prop({ 'class':state });
        $puzzle.prop({ 'class':state });
    }

    function showpuzzle() {
        var $baseWord = $('#baseword');
        var $solveWord = $('#solveword');
        $baseWord.html('');
        $solveWord.html('');

        if (puzzle.state == 'create') return;

        $('#definition').text('(' + puzzle.definition + ')');

        for (var i = 0; i < puzzle.baseWord.length; i++) {
            var letter = puzzle.baseWord[i];
            if (letter === ' ') {
                var $space = $('<span>').addClass('space');
                $baseWord.append($space);
                continue;
            }
            var $span = $('<span>').addClass('letterTile inv');
            $span.data('letter', letter).addClass('letter-'+letter);
            $span.click(selectSource);
            $span.text(letter);
            $baseWord.append($span);
        }
        for (var i = 0; i < puzzle.currentState.length; i++) {
            var letter = puzzle.currentState[i];
            var patternLetter = puzzle.pattern[i];
            if (patternLetter === ' ') {
                var $space = $('<span>').addClass('space');
                $solveWord.append($space);
                continue;
            }
            var $letterSpan = $('<span>').addClass('letter').html(letter === '_' ? '&nbsp;' : letter);
            var $span = $('<span>').addClass('letterTile').data('letter', letter);
            $span.append($letterSpan);
            if (patternLetter !== '_') {
                $span.addClass('unavailable inv');
            } else {
                if (letter !== '_') { $span.addClass('assigned'); }
                if (puzzle.state !== 'solved') {
                    var $del = $('<span>').addClass('del').html('&times;');
                    $del.click(clearLetter);
                    $span.append($del);
                    $span.click(selectLetter);
                }
            }
            $span.data('index', i);
            $solveWord.append($span);
        }
    }

    function clearLetter(event) {
        event.stopPropagation();
        var $tile = $(event.target).parent();
        if (!$tile.hasClass('assigned')) return;

        // clear letter
        var letter = $tile.data('letter');
        $tile.removeClass('assigned');
        $tile.data('letter', ' ');
        $tile.find('.letter').html('&nbsp;');
        var idx = parseInt($tile.data('index'));
        puzzle.currentState[idx] = ' ';

        // restore source
        var source = $($('.unavailable.letter-'+letter)[0]);
        source.removeClass('unavailable');
    }

    function assignLetter() {
        // assign the letter
        var letter = puzzle.selectedSource.data('letter');
        puzzle.selectedLetter.find('.letter').text(letter);
        puzzle.selectedLetter.addClass('assigned').data('letter', letter);
        var idx = parseInt(puzzle.selectedLetter.data('index'));
        puzzle.currentState[idx] = letter;

        // make it unavailable
        puzzle.selectedSource.addClass('unavailable');

        puzzle.selectedLetter.removeClass('selected');
        puzzle.selectedSource.removeClass('selected');
        puzzle.selectedLetter = null;
        puzzle.selectedSource = null;
    }

    function selectLetter(event) {
        var $tile = $(event.target);
        if (!$tile.hasClass('letterTile')) {
            $tile = $tile.parent();
        }
        if ($tile.hasClass('assigned')) return;
        if (puzzle.selectedLetter) {
            puzzle.selectedLetter.removeClass('selected');
            if (puzzle.selectedLetter[0] === $tile[0]) return;
        }
        puzzle.selectedLetter = $tile;
        puzzle.selectedLetter.addClass('selected');
        if (puzzle.selectedSource) {
            assignLetter();
        }
    }

    function selectSource(event) {
        var $tile = $(event.target);
        if ($tile.hasClass('unavailable')) return;
        if (!$tile.hasClass('letterTile')) {
            $tile = $tile.parent();
        }

        if (puzzle.selectedSource) {
            puzzle.selectedSource.removeClass('selected');
            if (puzzle.selectedSource[0] === $tile[0]) return;
        }
        puzzle.selectedSource = $tile;
        puzzle.selectedSource.addClass('selected');
        if (puzzle.selectedLetter) {
            assignLetter();
        }
    }

    function testAnagrams(variants, pageSize, start, end, anagrams) {
        if (start == variants.length) {
            puzzleSolutions(anagrams);
            return;
        }

        console.log('testing variants ' + start + ' to ' + (end - 1));
        var page = variants.slice(start, end);
        var tests = [];
        _.each(variants[0], function(w, k) {
            if (k === 'score') return;
            tests.push(k);
        });
        var data = {
            strings: page,
            test: tests
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
            testAnagrams(variants, pageSize, start, end, anagrams);
        }, function(err) {
            console.log('Error: ' + err);
        });
    }

    function walkVariants(variants, word, availableLetters, pattern, index) {
        if (index === pattern.length) {
            var words = word.split(' ');
            var variant = {};
            for (var i = 0; i < words.length; i++) {
                variant['word'+(i+1)] = words[i];
            }
            variants.push(variant);
        } else {
            if (pattern[index] === ' ') {
                word += ' ';
                walkVariants(variants, word, availableLetters, pattern, index + 1);
            } else if (pattern[index] !== '_') {
                word += pattern[index];
                walkVariants(variants, word, availableLetters, pattern, index + 1);
            } else {
                for (var i = 0; i < availableLetters.length; i++) {
                    var letter = availableLetters[i];
                    var newWord = word + letter;
                    var lessAvailableLetters = availableLetters.replace(letter, '');
                    walkVariants(variants, newWord, lessAvailableLetters, pattern, index + 1);
                }
            }
        }
    }

    function determineVariants(puzzle) {
        var variants = [];

        var availableLetters = puzzle.lettersAvailable;
        walkVariants(variants, '', availableLetters, puzzle.pattern, 0);
        for (var i = 0; i < variants.length; i++) {
            var variant = variants[i];
            var score = 0;
            var words = 0;
            _.each(variant, function(w) {
                score += Anagram.wordScore(w, true);
                words += 1.0;
            });
            variant.score = (score*1.0) / words;
        }
        variants.sort(function(a, b) {
            return b.score - a.score;
        });
        // work by pages of 10%s or 200's
        var pageSize = Math.min(parseInt(variants.length * 0.1), 200);
        var anagrams = [];
        testAnagrams(variants, pageSize, 0, pageSize, anagrams);
    }

    // set up starting state of puzzle
    var puzzle = init();
    testVals = null; // reset test vals
    setState();
    showpuzzle();

    $('#create').click(function(e) {
        var word = $('#word').val().trim().toUpperCase();
        var def = $('#def').val().trim();
        var pattern = $('#pattern').val().toUpperCase();

        var errors = [];
        if (!/^[A-Z ]+$/.test(word)) {
            errors.push('Invalid word');
        }
        var unspacedWord = word.replace(/ /g, '');
        if (!/^[\w ]*$/.test(def)) {
            errors.push('Invalid definition');
        }
        if (!/^[A-Z _]+$/.test(pattern)) {
            errors.push('Invalid pattern');
        }
        if (pattern.match(/_/g).length != unspacedWord.length) {
            errors.push("Pattern has wrong number of blanks");
        }
        if (errors.length > 0) {
            var error = "Errors:\n" + errors.join('\n');
            alert(error);
            return;
        }

        puzzle = init(word, def, pattern);

        setState('run');
        showpuzzle();
    });
    $('#new').click(function(e) {
        if (confirm('Ok to clear current puzzle?')) {
            puzzle = init();
            setState('create');
            showpuzzle();
        }
    });
    $('#restart').click(function(e) {
        if (confirm('Ok to clear current puzzle?')) {
            testVals = {
                word: puzzle.baseWord,
                def: puzzle.definition,
                pattern: puzzle.pattern
            };
            puzzle = init();
            setState();
            showpuzzle();
        }
    });
    $('#solve').click(function(e) {
        determineVariants(puzzle);
    });
    function anagramString(anagram) {
        var str = '';
        _.each(anagram, function(w, k) {
            if (k === 'score') return;
            if (str.length > 0) str += ' ';
            str += w;
        });
        return str;
    }
    function puzzleSolutions(anagrams) {
        if (anagrams.length === 1) {
            solvePuzzle(anagrams[0]);
            return;
        }
        var $solutions = $('#solutions');
        $solutions.html('');
        for (var i = 0; i < anagrams.length; i++) {
            var anagram = anagrams[i];
            var $soln = $('<li>').data('anagram', anagram).text(anagramString(anagram)).click(function(e) {
                solvePuzzle($(e.target).data('anagram'));
                $('#solutions').html('');
            });
            $solutions.append($soln);
        }
    }
    function solvePuzzle(anagram) {
        setState('solved');
        console.log('Solution: ' + JSON.stringify(anagram));
        puzzle.currentState = anagramString(anagram);
        showpuzzle(puzzle);
    }
});
