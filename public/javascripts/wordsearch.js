$(function() {
    var initData = null;
    //{
    //    gridSize: 9,
    //    grid: [
    //        [ 'a', 's', 'a', 's', 'h', 'o', 'r', 'e', 'a' ],
    //        [ 'o', 't', 'n', 'a', 'n', 'n', 'e', 'p', 'n' ],
    //        [ 'n', 'm', 'i', 'n', 'h', 'e', 'l', 'm', 'i' ],
    //        [ 'e', 'o', 'h', 'c', 'u', 't', 't', 'e', 'r' ],
    //        [ 'g', 'o', 'u', 'h', 'p', 's', 'c', 'k', 'a' ],
    //        [ 'l', 'r', 'l', 'o', 'o', 'a', 'l', 'e', 'm' ],
    //        [ 'i', 'i', 'l', 'r', 'r', 'f', 's', 'e', 'n' ],
    //        [ 'q', 'u', 'a', 'y', 't', 'g', 'a', 'l', 'f' ],
    //        [ 'g', 'f', 'o', 'r', 'e', 'd', 'e', 'c', 'k' ]
    //    ],
    //    words: [
    //        'anchor',
    //        'cutter',
    //        'fasten',
    //        'flag',
    //        'foredeck',
    //        'genoa',
    //        'helm',
    //        'hull',
    //        'keel',
    //        'marina',
    //        'moor',
    //        'pennant',
    //        'port',
    //        'quay',
    //        'race',
    //        'rail',
    //        'sea',
    //        'shore'
    //    ]
    //};
    var puzzle = {};

    var createPuzzle = function(gridSize) {
        puzzle = {
            gridSize: gridSize,
            grid: [],
            words: [],
            state: 'new',
            keyword: '',
            selectCell: null
        };
        if (initData) {
            puzzle.gridSize = initData.gridSize;
            for (var r = 0; r < puzzle.gridSize; r++) {
                var row = [];
                for (var c = 0; c < puzzle.gridSize; c++) {
                    row.push(initData.grid[r][c].toUpperCase());
                }
                puzzle.grid.push(row);
            }
            for (var i = 0; i < initData.words.length; i++) {
                puzzle.words.push({
                    word: initData.words[i].toUpperCase(),
                    state: 'available'
                });
            }
            setState('run');
        }
    };

    var renderGrid = function() {
        var $grid = $('#grid');
        $grid.html('');
        for (var r = 0; r < puzzle.gridSize; r++) {
            var $row = $('<div>').addClass('row');
            for (var c = 0; c < puzzle.gridSize; c++) {
                var letter = puzzle.grid[r][c];
                var $cell = $('<div>')
                    .addClass('cell ltr-'+letter)
                    .attr('id', 'cell-'+r+'-'+c)
                    .data({
                        letter: letter,
                        row: r,
                        col: c
                    })
                    .text(letter);
                $cell.hover(hoverInCell, hoverOutCell);
                $cell.click(clickCell);
                $row.append($cell);
            }
            $grid.append($row);
        }
    };

    var clickCell = function(e) {
        var $e = $(e.target);
        var ltr = $e.data('letter');
        var row = $e.data('row');
        var col = $e.data('col');
        if (puzzle.selectCell) {
            if (puzzle.selectCell[0] === row && puzzle.selectCell[1] === col) {
                $e.removeClass('selected');
                puzzle.selectCell = null;
                $('.'+ltr+'-word').toggleClass('highlight');
                return;
            }
            if ($e.hasClass('identified')) {
                var cell = _.clone(puzzle.selectCell);
                var rowIncr = Math.sign(row - cell[0]);
                var colIncr = Math.sign(col - cell[1]);
                var word = '';
                while (1 === 1) {
                    $c = $('#cell-'+cell[0]+'-'+cell[1]);
                    $c.removeClass('testword identified');
                    $c.addClass('used used-new');
                    var cl = $c.data('letter');
                    word += cl;
                    if (cell[0] === row && cell[1] === col) break;
                    cell[0] += rowIncr;
                    cell[1] += colIncr;
                }
                var wordsLeft = 0;
                for (var w = 0; w < puzzle.words.length; w++) {
                    var wd = puzzle.words[w];
                    if (wd.state === 'available') {
                        wordsLeft += 1;
                        if (wd.word === word) {
                            var $word = $('#word-' + word);
                            $word.removeClass('identified');
                            $word.removeClass(word[0] + '-word');
                            wd.state = 'found';
                            $word.addClass('found');
                            $('.used-new').removeClass('used-new').addClass('cell-' + word);
                            wordsLeft -= 1;
                        }
                    }
                }
                if (wordsLeft === 0) {
                    var keyword = '';
                    for (var r = 0; r < puzzle.gridSize; r++) {
                        for (var c = 0; c < puzzle.gridSize; c++) {
                            var $cell = $('#cell-'+r+'-'+c);
                            var cl = $cell.data('letter');
                            if (!$cell.hasClass('used')) {
                                keyword += cl;
                            }
                        }
                    }
                    puzzle.keyword = keyword;
                    $('#keyword').text(keyword);
                    setState('done');
                }
                var $start = $('#cell-'+puzzle.selectCell[0]+'-'+puzzle.selectCell[1]);
                $start.removeClass('selected');
                puzzle.selectCell = null;
                $('.'+ltr+'-word').addClass('highlight');
            }
        } else {
            puzzle.selectCell = [ row, col ];
            $e.addClass('selected');
            $('.'+ltr+'-word').toggleClass('highlight');
        }
    };

    var hoverCell = function(e, hoverIn) {
        var $e = $(e.target);
        var ltr = $e.data('letter');
        if (puzzle.selectCell) {
            var row = $e.data('row');
            var col = $e.data('col');
            if (row === puzzle.selectCell[0] && col === puzzle.selectCell[1]) return;
            if (!hoverIn) {
                $('.testword').removeClass('testword');
                $('.identified').removeClass('identified');
                return;
            }
            var rowDiff = row - puzzle.selectCell[0];
            var colDiff = col - puzzle.selectCell[1];
            if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
                var rowIncr = Math.sign(rowDiff);
                var colIncr = Math.sign(colDiff);
                var cell = _.clone(puzzle.selectCell);
                var word = '';
                while (1 === 1) {
                    var $c = $('#cell-'+cell[0]+'-'+cell[1]);
                    $c.addClass('testword');
                    var cl = $c.data('letter');
                    word += cl;
                    if (cell[0] === row && cell[1] === col) break;
                    cell[0] += rowIncr;
                    cell[1] += colIncr;
                }
                for (var w = 0; w < puzzle.words.length; w++) {
                    var wd = puzzle.words[w];
                    if (wd.state === 'available' && wd.word === word) {
                        $('#word-'+word).addClass('identified');
                        $('.testword').addClass('identified');
                    }
                }
            }
        } else {
            $('.'+ltr+'-word').toggleClass('highlight');
        }
    };

    var hoverInCell = function(e) { hoverCell(e, true); };
    var hoverOutCell = function(e) { hoverCell(e, false); };

    var renderWords = function() {
        var $words = $('#words');
        $words.html('');
        for (var w = 0; w < puzzle.words.length; w++) {
            var word = puzzle.words[w].word;
            var firstLetter = word.substring(0, 1);
            var $word = $('<li>')
                .addClass('word '+firstLetter+'-word')
                .attr('id', 'word-'+word)
                .data({
                    letter: firstLetter,
                    word: word
                })
                .text(word);
            $word.hover(function(e) {
                if (puzzle.selectCell) return;
                var $e = $(e.target);
                if ($e.hasClass('found')) {
                    $('.cell-'+$e.data('word')).toggleClass('highlight');
                    return;
                }
                var ltr = $e.data('letter');
                $('.ltr-'+ltr).toggleClass('highlight');
            });
            $words.append($word);
        }
    };

    var stateStrings = {
        'new': 'Defining Grid',
        'run': 'Running',
        'done': 'Solved!'
    };
    var setState = function(newState) {
        newState = newState || puzzle.state;
        $('#actions').removeClass(puzzle.state);
        puzzle.state = newState;
        $('#actions').addClass(puzzle.state);
        $('#state').text(stateStrings[puzzle.state]);
        $('#grid').addClass(puzzle.state);
    };

    var addWordInput = function(focus) {
        var wordIdx = initData.words.length;
        initData.words.push('');
        var $word = $('<li>');
        var $wordInp = $('<input>')
            .attr({
                id: 'word-'+wordIdx,
                type: 'text'
            })
            .data('idx', wordIdx);
        $wordInp.change(function(e) {
            var $inp = $(e.target);
            var wordIdx = $inp.data('idx');
            var word = $inp.val().trim().toUpperCase();
            if (/^[A-Z]+$/.test(word)) {
                initData.words[wordIdx] = word;
                wordIdx += 1;
                if (wordIdx >= initData.words.length) {
                    addWordInput(true);
                } else {
                    $('#word-'+wordIdx).focus();
                }
                $inp.val(word);
            } else {
                $inp.val('');
                initData.words[wordIdx] = '';
                $inp.focus();
            }
        });
        $word.append($wordInp);
        $('#words').append($word);
        if (focus) {
            $wordInp.focus();
        }
    };

    var initPuzzle = function(gridSize) {
        initData = {
            gridSize: gridSize,
            grid: [],
            words: []
        };
        var $grid = $('#grid');
        var $words = $('#words');
        $grid.html('');
        $words.html('');
        $('#keyword').text('');

        for (var r = 0; r < gridSize; r++) {
            var row = [];
            var $row = $('<div>').addClass('row');
            for (var c = 0; c < gridSize; c++) {
                row.push('');
                var $cell = $('<input>')
                    .attr({
                        type: 'text',
                        id: 'cell-'+r+'-'+c
                    }).data({
                        row: r,
                        col: c
                    });
                $cell.keyup(function(e) {
                    var $inp = $(e.target);
                    var row = $inp.data('row');
                    var col = $inp.data('col');

                    if (e.which === 8) { // delete
                        $inp.val('');
                        initData.grid[row][col] = '';
                        col -= 1;
                        if (col < 0) {
                            col = gridSize - 1;
                            row -= 1;
                        }
                        if (row >= 0) {
                            $('#cell-'+row+'-'+col).focus();
                        }
                    } else {
                        var key = String.fromCharCode(e.which).toUpperCase();
                        if (key >= 'A' && key <= 'Z') {
                            $inp.val(key);
                            initData.grid[row][col] = key;
                            col += 1;
                            if (col >= gridSize) {
                                col = 0;
                                row += 1;
                            }
                            if (row < gridSize) {
                                $('#cell-'+row+'-'+col).focus();
                            } else {
                                $('#word-0').focus();
                            }
                        } else {
                            $inp.val('');
                        }
                    }
                });
                $row.append($cell);
            }
            initData.grid.push(row);
            $grid.append($row);
        }

        addWordInput(false);

        $('#cell-0-0').focus();
    };

    $('#cancel').click(function(e) {
        $('#grid input').val('');
        for (var r = 0; r < initData.gridSize; r++) {
            for (var c = 0; c < initData.gridSize; c++) {
                initData.grid[r][c] = '';
            }
        }
        $('#cell-0-0').focus();
    });

    $('#save').click(function(e) {
        var errors = [];
        var blankCount = 0;
        for (var r = 0; r < initData.gridSize; r++) {
            for (var c = 0; c < initData.gridSize; c++) {
                if (initData.grid[r][c] === '') blankCount++;
            }
        }
        if (blankCount > 0) {
            errors.push('Missing ' + blankCount + ' cells in grid.');
        }
        var words = _.filter(initData.words, function(o) { return o !== ''; });
        if (words.length === 0) {
            errors.push('Must define at least one word to search for.');
        }
        if (errors.length > 0) {
            alert('Errors:\n' + errors.join('\n'));
            return;
        }
        initData.words = words;
        createPuzzle();
        renderGrid();
        renderWords();
    });

    var defaultGridSize = 9;
    if (initData) {
        createPuzzle();
        renderGrid();
        renderWords();
    } else {
        setState('new');
        initPuzzle(puzzle.gridSize || defaultGridSize);
    }

    $('#restart').click(function(e) {
        if (!confirm('Are you sure?')) return;
        $('.cell').removeClass('used selected highlight testword identified');
        $('.word').removeClass('found highlight identified');
        $('#keyword').text('');
        for (var w = 0; w < puzzle.words.length; w++) {
            puzzle.words[w].state = 'available';
        }
        puzzle.keyword = '';
        puzzle.selectCell = null;
    });

    $('#new').click(function(e) {
        if (!confirm('Are you sure?')) return;
        setState('new');
        initPuzzle(puzzle.gridSize || defaultGridSize);
    });
});

