$(function() {
    var testVals = null;
    //{
    //    word: "lacrosse",
    //    plusminus: "plus",
    //    letter: "e",
    //    start: "   s"
    //};

    function init(word, plusminus, letter, start) {
        var puz = {
            state: 'create',
            baseWord: '',
            extraLetter: {
                added: '',
                letter: ''
            },
            startState: '',
            lettersAvailable: '',
            currentState: '',
            selectedLetter: null,
            selectedSource: null,
            solved: false
        };

        if (!word && !letter && testVals) {
            word = testVals.word;
            plusminus = testVals.plusminus;
            letter = testVals.letter;
            start = testVals.start;
            testVals = null;
        }
        if (word && letter) {
            puz.baseWord = word.toUpperCase();
            puz.extraLetter.added = (plusminus !== 'minus');
            puz.extraLetter.letter = letter.toUpperCase();
            var wordLen = word.length + (puz.extraLetter.added ? 1 : -1);
            puz.startState = _.padEnd(start || '', wordLen).toUpperCase();
            puz.state = 'run';
        }
        puz.currentState = puz.startState;
        puz.lettersAvailable = puz.baseWord;
        if (puz.extraLetter.added) {
            puz.lettersAvailable += puz.extraLetter.letter;
        } else {
            puz.lettersAvailable = puz.lettersAvailable.replace(puz.extraLetter.letter, '');
        }

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
        var $extraLetter = $('#extraletter');
        var $solveWord = $('#solveword');
        $baseWord.html('');
        $extraLetter.html('');
        $solveWord.html('');

        if (puzzle.state == 'create') {
            $('#plus')[0].checked = true;
            return;
        }

        var minusLetter = (puzzle.extraLetter.added) ? null : puzzle.extraLetter.letter;
        for (var i = 0; i < puzzle.baseWord.length; i++) {
            var letter = puzzle.baseWord[i];
            var $span = $('<span>').addClass('letterTile inv');
            if (letter === minusLetter || puzzle.state === 'solved') {
                $span.addClass('unavailable');
                minusLetter = null;
            } else {
                $span.data('letter', letter).addClass('letter-'+letter);
                $span.click(selectSource);
            }
            $span.text(letter);
            $baseWord.append($span);
        }
        var $span = $('<span>').addClass('letterTile inv').html('<i>'+(puzzle.extraLetter.added ? '+' : '-')+'</i>'+puzzle.extraLetter.letter);
        if (puzzle.extraLetter.added && puzzle.state !== 'solved') {
            var letter = puzzle.extraLetter.letter;
            $span.data('letter', letter).addClass('letter-'+letter);
            $span.click(selectSource);
        } else {
            $span.addClass('unavailable');
        }
        $extraLetter.append($span);
        for (var i = 0; i < puzzle.currentState.length; i++) {
            var letter = puzzle.currentState[i];
            var startLetter = puzzle.startState[i];
            var $letterSpan = $('<span>').addClass('letter').html(letter === ' ' ? '&nbsp;' : letter);
            var $span = $('<span>').addClass('letterTile').data('letter', letter);
            $span.append($letterSpan);
            if (startLetter !== ' ') {
                $span.addClass('unavailable inv');
                $($('.letter-'+startLetter)[0]).addClass('unavailable');
            } else {
                if (letter !== ' ') { $span.addClass('assigned'); }
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

    function testAnagrams(variants, pageSize, start, end) {
        if (start == variants.length) return;

        console.log('testing variants ' + start + ' to ' + (end - 1));
        var page = variants.slice(start, end);
        var data = {
            strings: page,
            test: [ 'word' ]
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
                solvePuzzle(resp.anagrams[0]);
                return;
            }
            if (resp.partials && resp.partials.length > 0) {
                console.log('Found partials!');
                for (var pi = 0; pi < resp.partials.length; pi++) {
                    var partial = resp.partials[pi];
                    console.log('  * ' + partial.top + ' | ' + partial.bottom);
                }
            }
            start = end;
            end = Math.min(start + pageSize, variants.length);
            testAnagrams(variants, pageSize, start, end);
        }, function(err) {
            console.log('Error: ' + err);
        });
    }

    function walkVariants(variants, word, availableLetters, startState, index) {
        if (availableLetters.length === 0) {
            variants.push({ word: word });
        } else {
            if (startState[index] !== ' ') {
                word += startState[index];
                walkVariants(variants, word, availableLetters, startState, index + 1);
            } else {
                for (var i = 0; i < availableLetters.length; i++) {
                    var letter = availableLetters[i];
                    var newWord = word + letter;
                    var lessAvailableLetters = availableLetters.replace(letter, '');
                    walkVariants(variants, newWord, lessAvailableLetters, startState, index + 1);
                }
            }
        }
    }

    function determineVariants(puzzle) {
        var variants = [];

        var availableLetters = puzzle.lettersAvailable;
        for (var i = 0; i < puzzle.startState.length; i++) {
            var letter = puzzle.startState[i];
            if (letter === ' ') continue;
            availableLetters = availableLetters.replace(letter, '');
        }
        walkVariants(variants, '', availableLetters, puzzle.startState, 0);
        for (var i = 0; i < variants.length; i++) {
            var variant = variants[i];
            variant.score = Anagram.wordScore(variant.word, true);
        }
        variants.sort(function(a, b) {
            return b.score - a.score;
        });
        // work by pages of 10%s or 200's
        var pageSize = Math.min(parseInt(variants.length * 0.1), 200);
        testAnagrams(variants, pageSize, 0, pageSize);
    }

    // set up starting state of puzzle
    var puzzle = init();
    testVals = null; // reset test vals
    setState();
    showpuzzle();

    $('#create').click(function(e) {
        var word = $('#word').val().trim().toUpperCase();
        var plusminus = $('#minus')[0].checked ? 'minus' : 'plus';
        var letter = $('#letter').val().trim().toUpperCase();
        var start = $('#start').val().toUpperCase();

        var errors = [];
        if (!/^[A-Z]+$/.test(word)) {
            errors.push('Invalid word');
        }
        if (!/^[A-Z]$/.test(letter)) {
            errors.push('Invalid letter');
        }
        if (start.length > word.length || !/^[A-Z ]*$/.test(start)) {
            errors.push('Invalid start state');
        }
        if (errors.length > 0) {
            var error = "Errors:\n" + errors.join('\n');
            alert(error);
            return;
        }

        puzzle = init(word, plusminus, letter, start);

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
                plusminus: puzzle.extraLetter.added ? 'plus' : 'minus',
                letter: puzzle.extraLetter.letter,
                start: puzzle.startState
            };
            puzzle = init();
            setState();
            showpuzzle();
        }
    });
    $('#solve').click(function(e) {
        determineVariants(puzzle);
    });
    function solvePuzzle(anagram) {
        setState('solved');
        console.log('Solution: ' + anagram.word);
        puzzle.currentState = anagram.word;
        showpuzzle(puzzle);
    }
});
