$(function() {
    var defaultGridSize = { rows: 5, cols: 7 };
    var testData = null;
    //{
    //    grid: [
    //        [ 'v', 'k', 225, 180, 'g', 'c', 'z' ],
    //        [  90, 'u', 'p', 'z', 's', 'l', 'n' ],
    //        [ 'r', 'f', 'k', 'f', 'n', 'h', 315 ],
    //        [ 'a', 'i', 'u', 'i', 'x', 'q', 'v' ],
    //        [  45,  45, 'd', 'r', 's',  90, 'e' ]
    //    ],
    //    fixed: [
    //        [ 4, 6 ]
    //    ]
    //};

    var arrowIncrements = {
          0 : { rInc: -1, cInc:  0 },
         45 : { rInc: -1, cInc: +1 },
         90 : { rInc:  0, cInc: +1 },
        135 : { rInc: +1, cInc: +1 },
        180 : { rInc: +1, cInc:  0 },
        225 : { rInc: +1, cInc: -1 },
        270 : { rInc:  0, cInc: -1 },
        315 : { rInc: -1, cInc: -1 }
    };

    var stateStrings = {
        'new': 'Defining Grid',
        'run': 'Running',
        'done': 'Solved!'
    };
    var setState = function(state) {
        if (puzzle.state !== state) {
            $('#actions').removeClass(puzzle.state);
            $('#grid').removeClass(puzzle.state);
        }
        puzzle.state = state;
        $('#actions').addClass(state);
        $('#grid').addClass(state);
        $('#state').text(stateStrings[state]);
    };

    var generateWord = function(puz) {
        var word = '';
        for (var r = 0; r < puz.gridSize.rows; r++) {
            for (var c = 0; c < puz.gridSize.cols; c++) {
                var test = [ r, c ];
                if (_.findIndex(puz.fixed, function(o) { return _.isEqual(o, test); }) < 0) continue;
                word += puz.grid[r][c].toUpperCase();
            }
        }
        return word;
    };

    var initPuzzle = function(gridSize) {
        var puz = {
            gridSize: gridSize,
            grid: [],
            fixed: [],
            perm: [],
            state: 'new',
            word: ''
        };
        if (testData) {
            puz.grid = testData.grid;
            puz.gridSize = { rows: puz.grid.length, cols: puz.grid[0].length };
            puz.fixed = testData.fixed;
            puz.perm = _.clone(testData.fixed);
            puz.state = 'run';
            puz.word = generateWord(puz);
        } else {
            for (var r = 0; r < gridSize.rows; r++) {
                var row = [];
                for (var c = 0; c < gridSize.cols; c++) {
                    row.push('');
                }
                puz.grid.push(row);
            }
        }
        return puz;
    };

    var setCell = function(cell, as, fromCell) {
        if (cell[0] < 0 || cell[0] >= puzzle.gridSize.rows ||
            cell[1] < 0 || cell[1] >= puzzle.gridSize.cols) return;
        var $c = $('#cell-'+cell[0]+'-'+cell[1]);
        if ($c.hasClass('arrow') || $c.hasClass('perm')) return;
        if (fromCell) {
            var from = $c.data('lockFrom') || [];
            if (as === 'locked') {
                from.push(fromCell);
                $c.data('lockFrom', from);
                $c.addClass(as);
            } else {
                _.remove(from, function(o) { return _.isEqual(o, fromCell) });
                if (from.length === 0) {
                    from = null;
                    $c.removeClass('locked');
                }
                $c.data('lockFrom', from);
            }
        } else if (as === '') {
            $c.removeClass('fixed');
        } else {
            $c.addClass(as);
        }
    };

    var makeCellFixed = function(cell, setClass) {
        setClass = (setClass === null) ? 'fixed' : setClass;
        setCell(cell, setClass);
        var r = cell[0];
        var c = cell[1];
        var surroundClass = (setClass.indexOf('fixed') >= 0 ? 'locked' : '');
        setCell([ r - 1, c ], surroundClass, cell);
        setCell([ r - 1, c + 1 ], surroundClass, cell);
        setCell([ r, c + 1 ], surroundClass, cell);
        setCell([ r + 1, c + 1 ], surroundClass, cell);
        setCell([ r + 1, c ], surroundClass, cell);
        setCell([ r + 1, c - 1 ], surroundClass, cell);
        setCell([ r, c - 1 ], surroundClass, cell);
        setCell([ r - 1, c - 1 ], surroundClass, cell);
    };

    var arrowHover = function(e) {
        var $c = $(e.target);
        if (!$c.hasClass('cell')) { $c = $c.parents('.cell'); }
        var r = $c.data('row');
        var c = $c.data('col');
        var ri = $c.data('rInc');
        var ci = $c.data('cInc');
        while (1 === 1) {
            r += ri;
            c += ci;
            if (r < 0 || r >= puzzle.gridSize.rows || c < 0 || c >= puzzle.gridSize.cols) break;
            var $tc = $('#cell-'+r+'-'+c);
            if ($tc.hasClass('locked') || $tc.hasClass('fixed') || $tc.hasClass('arrow')) continue;
            $tc.toggleClass('highlight');
        }
    };

    var cellHover = function(e) {
        var $c = $(e.target);
        if (!$c.hasClass('cell')) { $c = $c.parents('.cell'); }
        // TODO: find the arrows pointing to this cell and toggle highlight on them
    };

    var cellClick = function(e) {
        var $c = $(e.target);
        if (!$c.hasClass('cell')) { $c = $c.parents('.cell'); }
        if ($c.hasClass('locked') || $c.hasClass('perm')) return;
        var r = $c.data('row');
        var c = $c.data('col');
        var cell = [ r, c ];
        if ($c.hasClass('fixed')) {
            makeCellFixed(cell, '');
            _.remove(puzzle.fixed, function(o) { return _.isEqual(o, cell); })
        } else {
            makeCellFixed(cell, 'fixed');
            puzzle.fixed.push(cell);
        }
        puzzle.word = generateWord(puzzle);
        $('#word').text(puzzle.word);
    };

    var renderGrid = function() {
        var $grid = $('#grid');
        $grid.html('');
        for (var r = 0; r < puzzle.gridSize.rows; r++) {
            var $row = $('<div>').addClass('row');
            for (var c = 0; c < puzzle.gridSize.cols; c++) {
                var letter = puzzle.grid[r][c];
                var $cell = $('<div>')
                    .attr('id', 'cell-'+r+'-'+c)
                    .addClass('cell')
                    .data({
                        row: r,
                        col: c,
                    });
                if (_.isNumber(letter)) {
                    var incs = arrowIncrements[letter];
                    $cell.addClass('arrow a-'+letter).data(incs);
                } else {
                    letter = letter.toUpperCase();
                    $cell.data('letter', letter).text(letter);
                }
                $row.append($cell);
            }
            $grid.append($row);
        }
        for (var i = 0; i < puzzle.fixed.length; i++) {
            makeCellFixed(puzzle.fixed[i], 'fixed perm');
        }
        // find "stranded" cells and mark them locked to save time
        var pointedCells = {};
        for (var r = 0; r < puzzle.gridSize.rows; r++) {
            for (var c = 0; c < puzzle.gridSize.cols; c++) {
                var dir = puzzle.grid[r][c];
                if (!_.isNumber(dir)) continue;
                var incrs = arrowIncrements[dir];
                var tr = r;
                var tc = c;
                while (1 === 1) {
                    tr += incrs.rInc;
                    tc += incrs.cInc;
                    if (tr < 0 || tr > puzzle.gridSize.rows || tc < 0 || tc >= puzzle.gridSize.cols) break;
                    pointedCells[tr+'-'+tc] = true;
                }
            }
        }
        for (var r = 0; r < puzzle.gridSize.rows; r++) {
            for (var c = 0; c < puzzle.gridSize.cols; c++) {
                var dir = puzzle.grid[r][c];
                var $c = $('#cell-'+r+'-'+c);
                if (_.isNumber(dir)) {
                    $c.hover(arrowHover);
                    continue;
                }
                if (pointedCells[r+'-'+c]) {
                    $c.hover(cellHover);
                    $c.click(cellClick);
                } else {
                    $c.addClass('locked perm');
                }
            }
        }
        $('#word').text(puzzle.word);
    };

    $('#restart').click(function(e) {
        if (!confirm('Are you sure?')) return;
        $('.cell').each(function(idx, cell) {
            var $cell = $(cell);
            if ($cell.hasClass('perm') || $cell.hasClass('arrow')) return;
            $cell.removeClass('fixed locked highlight');
        });
        puzzle.fixed = _.clone(puzzle.perm);
        puzzle.word = generateWord(puzzle);
        $('#word').text(puzzle.word);
        setState('run');
    });

    var arrowAngles = [ 0, 45, 90, 135, 180, 225, 270, 315 ];
    var setArrowAngle = function($cell) {
        var r = $cell.data('row');
        var c = $cell.data('col');
        var angleIndex = $cell.data('angleIdx');
        if (_.isNil(angleIndex)) { angleIndex = -1; }
        if (angleIndex >= 0) { $cell.removeClass('a-'+arrowAngles[angleIndex]); }
        angleIndex += 1;
        if (angleIndex >= arrowAngles.length) angleIndex = 0;
        var angle = arrowAngles[angleIndex];
        $cell.addClass('a-'+angle);
        $cell.data('angleIdx', angleIndex);
        puzzle.grid[r][c] = angle;
    };
    var cellValueEntered = function(e) {
        var $inp = $(e.target);
        var $cell = $inp.parents('.cell');
        var row = $cell.data('row');
        var col = $cell.data('col');

        if (e.which === 8) { // delete
            $inp.val('');
            puzzle.grid[row][col] = '';
            if ($cell.hasClass('arrow')) {
                $cell.removeClass('arrow a-0 a-45 a-90 a-135 a-180 a-225 a-280 a-315');
            } else if ($cell.hasClass('fixed')) {
                $cell.removeClass('fixed');
                _.remove(puzzle.fixed, function(o) {_.isEqual(o, [ row, col ]) });
            }
            col -= 1;
            if (col < 0) {
                col = puzzle.gridSize.cols - 1;
                row -= 1;
            }
            if (row >= 0) {
                $('#cell-'+row+'-'+col+' input').focus();
            }
        } else {
            var key = String.fromCharCode(e.which).toUpperCase();
            var validKey = false;
            if (key === '6') {
                $inp.val('');
                $cell.addClass('arrow');
                setArrowAngle($cell);
                validKey = true;
            } else if (key >= 'A' && key <= 'Z') {
                $inp.val(key);
                $cell.removeClass('arrow');
                puzzle.grid[row][col] = key;
                validKey = true;
            } else if (key == '8' && !$cell.hasClass('arrow')) {
                if ($cell.hasClass('fixed')) {
                    $cell.removeClass('fixed');
                    _.remove(puzzle.fixed, function(o) {_.isEqual(o, [ row, col ]) });
                } else {
                    $cell.addClass('fixed');
                    puzzle.fixed.push([ row, col ]);
                }
                $inp.val(puzzle.grid[row][col]);
            } else {
                $inp.val('');
            }
            if (validKey) {
                col += 1;
                if (col >= puzzle.gridSize.cols) {
                    col = 0;
                    row += 1;
                }
                if (row < puzzle.gridSize.rows) {
                    $('#cell-' + row + '-' + col + ' input').focus();
                }
            }
        }
        e.preventDefault();
    };

    var newGrid = function() {
        puzzle = initPuzzle(defaultGridSize);
        $('#word').text('');
        var $grid = $('#grid');
        $grid.html('');
        setState('new');
        for (var r = 0; r < puzzle.gridSize.rows; r++) {
            var $row = $('<div>').addClass('row');
            for (var c = 0; c < puzzle.gridSize.cols; c++) {
                var $cell = $('<div>').addClass('cell').data({
                    row: r,
                    col: c
                }).attr('id', 'cell-'+r+'-'+c);
                var $inp = $('<input>').attr('type', 'text');
                $inp.keyup(cellValueEntered);
                $cell.click(function(e) {
                    var $c = $(e.target);
                    if (!$c.hasClass('cell')) { $c = $c.parents('.cell'); }
                    if (!$c.hasClass('arrow')) return;
                    setArrowAngle($c);
                    e.preventDefault();
                });
                $cell.append($inp);
                $row.append($cell);
            }
            $grid.append($row);
        }
        $('#cell-0-0 input').focus();
    };

    $('#new').click(function(e) {
        if (!confirm('Are you sure?')) return;
        setState('new');
        newGrid();
    });

    $('#cancel').click(function(e) {
        newGrid();
    });

    $('#save').click(function(e) {
        testData = {
            grid: puzzle.grid,
            fixed: puzzle.fixed
        };
        setState('run');
        puzzle = initPuzzle();
        renderGrid();
    });

    var puzzle = initPuzzle(defaultGridSize);
    setState(puzzle.state);
    if (puzzle.state === 'new') {
        newGrid();
    } else {
        renderGrid();
    }
});
