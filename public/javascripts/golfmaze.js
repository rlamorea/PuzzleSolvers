$(function() {
    var startGridSize = 6;

    var testGrid = null;
    //{
    //    grid: [
    //        [ 4, 5, 5, 4, 5, 5 ],
    //        [ 4, 3, 4, 1, 3, 1 ],
    //        [ 4, 1, 2, 1, 4, 1 ],
    //        [ 4, 4, 2, 3, 4, 1 ],
    //        [ 1, 3, 4, 2, 3, 5 ],
    //        [ 3, 1, 5, 5, 0, 0 ]
    //    ],
    //    tee: [ 2, 1 ],
    //    hole: [ 5, 4 ]
    //};
    var puzzle = {
        state: 'new',
        gridSize: startGridSize,
        grid: [],
        tee: [],
        hole: [],
        highlighting: null,
        highlightCell: null,
    };

    var checkCell = function(arr, row, col, dir, type) {
        if (row >= 0 && row < puzzle.gridSize && col >= 0 && col < puzzle.gridSize) {
            arr.push({ cellId:'#cell-'+row+'-'+col, dir:dir, type: type });
        }
    };

    var showToFrom = function($c, show, ignore) { // inout
        var cell = $c[0];
        for (var i = 0; i < cell.tofrom.length; i++) {
            var def = cell.tofrom[i];
            var dc = $(def.cellId);
            if (dc.hasClass('locked') &&  dc.hasClass((ignore || show)+'-path')) continue;
            var s = (show === 'all') ? true : (show === 'none' ? false : (show === def.type));
            dc.toggleClass(def.type + ' ' + def.type + '-' + def.dir, s);
        }
    };

    var prepCells = function() {
        for (var r = 0; r < puzzle.gridSize; r++) {
            for (var c = 0; c < puzzle.gridSize; c++) {
                var $cell = $('#cell-'+r+'-'+c);
                var cell = $cell[0];
                var tos = true;
                var froms = true;
                cell.tofrom = [];
                if ($cell.hasClass('hole')) {
                    froms = false;
                } else if ($cell.hasClass('tee')) {
                    tos = false;
                }
                if (froms) {
                    var num = parseInt($cell.find('span').text());
                    if (num > 0) {
                        checkCell(cell.tofrom, r - num, c, 'up', 'from');
                        checkCell(cell.tofrom, r + num, c, 'down', 'from');
                        checkCell(cell.tofrom, r, c - num, 'left', 'from');
                        checkCell(cell.tofrom, r, c + num, 'right', 'from');
                    }
                }
                if (tos) {
                    for (var cx = 0; cx < puzzle.gridSize; cx++) {
                        if (cx == c) continue;
                        var diff = c - cx;
                        var dist = Math.abs(diff);
                        var $cellX = $('#cell-'+r+'-'+cx);
                        if ($cellX.hasClass('hole')) continue;
                        var numX = parseInt($cellX.find('span').text());
                        if (numX === 0) continue;
                        if (numX === dist) {
                            checkCell(cell.tofrom, r, cx, (diff < 0) ? 'left' : 'right', 'to');
                        }
                    }
                    for (var rx = 0; rx < puzzle.gridSize; rx++) {
                        if (rx == r) continue;
                        var diff = r - rx;
                        var dist = Math.abs(diff);
                        var $cellX = $('#cell-'+rx+'-'+c);
                        if ($cellX.hasClass('hole')) continue;
                        var numX = parseInt($cellX.find('span').text());
                        if (numX === 0) continue;
                        if (numX === dist) {
                            checkCell(cell.tofrom, rx, c, (diff < 0) ? 'up' : 'down', 'to');
                        }
                    }
                }
                if (cell.tofrom.length > 0) {
                    $cell.hover(function(e) {
                        if (puzzle.highlighting || puzzle.state === 'done') return;
                        var $c = $(e.target);
                        $c = $c.hasClass('cell') ? $c : $c.parents('.cell');
                        if (!$c.hasClass('locked')) { return; }
                        showToFrom($c, $c.is(':hover') ? 'all' : 'none');
                    });
                    $cell.click(function(e) {
                        if (puzzle.state === 'done') return;
                        var $c = $(e.target);
                        $c = $c.hasClass('cell') ? $c : $c.parents('.cell');
                        if (puzzle.highlighting && !$c.hasClass('highlight')) {
                            if (!$c.hasClass(puzzle.highlighting)) return;
                            var hrow = puzzle.highlightCell.data('row');
                            var hcol = puzzle.highlightCell.data('col');
                            var hlclass = puzzle.highlighting+'-'+hrow+'-'+hcol;
                            var opp = puzzle.highlighting === 'to' ? 'from' : 'to';
                            var hdir = puzzle.highlightCell.data(puzzle.highlighting);
                            puzzle.highlightCell.removeClass(opp + ' ' + hdir).data(puzzle.highlighting, null);
                            $c.toggleClass('locked');
                            if ($c.hasClass('locked') || $c.hasClass(opp+'-path-end')) {
                                $('.' + hlclass + '.locked').removeClass(hlclass + ' locked').data(opp, null);
                                $c.addClass(hlclass);
                                var row = $c.data('row');
                                var col = $c.data('col');
                                $c.data(opp, [ row, col ]);
                                puzzle.highlightCell.addClass(puzzle.highlighting).data(puzzle.highlighting, [ row, col ]);

                                // determine direction from highlight cell to current cell
                                puzzle.highlightCell.removeClass(opp+'-up '+opp+'-down '+opp+'-left '+opp+'-right');
                                var dir = 'right';
                                if (hrow < row) {
                                    dir = 'down';
                                } else if (hrow > row) {
                                    dir = 'up';
                                } else if (hcol > col) {
                                    dir = 'left';
                                }
                                puzzle.highlightCell.addClass(opp+'-'+dir);
                                var endClass = puzzle.highlighting+'-path-end';
                                puzzle.highlightCell.removeClass(endClass);
                                $c.addClass(endClass);
                                puzzle.highlightCell.removeClass('highlight');
                                showToFrom(puzzle.highlightCell, 'none', puzzle.highlighting);
                                $c.addClass('highlight '+puzzle.highlighting+'-path '+puzzle.highlighting);
                                puzzle.highlightCell = $c;
                                showToFrom($c, puzzle.highlighting, puzzle.highlighting);

                                if ($c.hasClass(opp+'-path-end')) {
                                    $c.removeClass(puzzle.highlighting);
                                    $c.addClass('locked');
                                    setState('done');
                                }

                            } else {
                                $c.removeClass(hlclass).data(opp, null);
                            }
                            return;
                        }
                        if (!$c.hasClass('locked')) { return; }
                        var highlighting = null;
                        if ($c.hasClass('from-path-end')) {
                            highlighting = 'from';
                        } else if ($c.hasClass('to-path-end')) {
                            highlighting = 'to';
                        } else {
                            return;
                        }
                        if (highlighting === 'bad') return;
                        if (puzzle.highlighting) { $c.removeClass('highlight '+puzzle.highlighting); }
                        if (highlighting) { $c.addClass('highlight '+highlighting); }

                        puzzle.highlighting = highlighting;
                        puzzle.highlightCell = (highlighting === null) ? null : $c;
                        showToFrom($c, puzzle.highlighting || 'all');
                    });
                }
            }
        }
    };

    var cellValueEntered = function(e) {
        var inp = $(e.target);
        var cell = inp.parents('.cell');
        var span = cell.find('span');
        var row = cell.data('row');
        var col = cell.data('col');

        if (e.which === 8) { // delete
            inp.val('');
            span.text('');
            puzzle.grid[row][col] = -1;
            if (cell.hasClass('tee')) {
                cell.removeClass('tee');
                puzzle.tee = [ -1, -1 ];
            }
            if (cell.hasClass('hole')) {
                cell.removeClass('hole');
                puzzle.hole = [ -1, -1 ];
            }
            col -= 1;
            if (col < 0) {
                col = puzzle.gridSize - 1;
                row -= 1;
            }
            if (row >= 0) {
                $('#cell-'+row+'-'+col+' input').focus();
            }
        } else {
            var key = String.fromCharCode(e.which).toUpperCase();
            var validKey = false;
            if (key === 'T' && !cell.hasClass('hole')) {
                $('#grid').find('.cell.tee').removeClass('tee locked');
                puzzle.tee = [row, col];
                var oldVal = puzzle.grid[row][col];
                if (oldVal >= 0) {
                    inp.val(puzzle.grid[row][col]);
                    validKey = true;
                } else {
                    inp.val('');
                }
                cell.addClass('tee locked');
            } else if (key === 'H' && !cell.hasClass('tee')) {
                $('#grid').find('.cell.hole').removeClass('hole locked');
                var holeCell = $('#grid').find('.cell.hole');
                if (holeCell.length > 0) {
                    holeCell.removeClass('hole');
                    holeCell.find('input').val('');
                    holeCell.find('span').text('');
                    var hr = holeCell.data('row');
                    var hc = holeCell.data('col');
                    puzzle.grid[hr][hc] = -1;
                }
                puzzle.hole = [row, col];
                puzzle.grid[row][col] = 0;
                inp.val('');
                span.text('0');
                cell.addClass('hole locked');
                validKey = true;
            } else {
                var num = parseInt(key);
                if (isNaN(num) || num < 0 || num >= puzzle.gridSize) {
                    inp.val('');
                } else {
                    puzzle.grid[row][col] = num;
                    span.text(num);
                    inp.val(num);
                    validKey = true;
                }
            }
            if (validKey) {
                col += 1;
                if (col >= puzzle.gridSize) {
                    col = 0;
                    row += 1;
                }
                if (row < puzzle.gridSize) {
                    $('#cell-' + row + '-' + col + ' input').focus();
                }
            }
        }
        e.preventDefault();
    };

    var createGrid = function(gridSize) {
        puzzle.highlighting = null;
        puzzle.highlightCell = null;

        if (testGrid) {
            puzzle.gridSize = testGrid.grid.length;
            puzzle.grid = testGrid.grid;
            puzzle.tee = testGrid.tee;
            puzzle.hole = testGrid.hole;
            puzzle.state = 'run';
        } else {
            puzzle.gridSize = gridSize;
            puzzle.grid = [];
            for (var r = 0; r < gridSize; r++) {
                puzzle.grid.push(_.fill(Array(gridSize), -1));
            }
            puzzle.tee = [ -1, -1 ];
            puzzle.hole = [ -1, -1 ];
            puzzle.state = 'new';
        }

        var $grid = $('#grid');
        $grid.html('');
        for (var r = 0; r < puzzle.gridSize; r++) {
            var $row = $('<div>').addClass('row');
            for (var c = 0; c < puzzle.gridSize; c++) {
                var $cell = $('<div>').addClass('cell').data({ row: r, col: c }).prop('id', 'cell-'+r+'-'+c);
                var $input = $('<input>').prop({ type: 'text' });
                $input.keyup(cellValueEntered);
                $cell.append($input);
                $cell.click(function(e) {
                    var $c = $(e.target);
                    if (!$c.hasClass('cell')) { $c = $c.parents('.cell'); }
                    $c.find('input').focus();
                });
                if (r === puzzle.tee[0] && c === puzzle.tee[1]) {
                    $cell.addClass('tee locked from-path-end from-path');
                } else if (r === puzzle.hole[0] && c === puzzle.hole[1]) {
                    $cell.addClass('hole locked to-path-end to-path');
                }
                $cell.append($('<span>').text(puzzle.grid[r][c]));
                $row.append($cell);
            }
            $grid.append($row);
        }
        if (testGrid) {
            testGrid = null;
            prepCells();
        }
        setState(puzzle.state);
    };

    var stateStrings = {
        'new': 'Defining Grid',
        'run': 'Running',
        'done': 'Solved!'
    };
    var setState = function(state) {
        if (puzzle.state !== state) {
            $('#grid').removeClass(puzzle.state);
            $('#actions').removeClass(puzzle.state);
        }
        puzzle.state = state;
        $('#grid').addClass(state);
        $('#actions').addClass(state);
        $('#state').text(stateStrings[state]);
        if (state === 'new') {
            $('#cell-0-0 input').focus();
            $('#errors').text('');
        }
    };

    var solveGrid = function(revPath) {
        var lastCell = _.last(revPath);
        if (_.isEqual(lastCell, puzzle.tee)) {
            revPath = _.reverse(revPath);
            for (var i = 0; i < revPath.length; i++) {
                var cell = revPath[i];
                var cellRow = cell[0];
                var cellCol = cell[1];

                var $c = $('#cell-'+cellRow+'-'+cellCol);
                $c.addClass('locked from-path');
                if (i > 0) {
                    var lastCell = revPath[i-1];
                    var lastRow = lastCell[0];
                    var lastCol = lastCell[1];
                    var dir = 'right';
                    if (lastRow < cellRow) {
                        dir = 'down';
                    } else if (lastRow > cellRow) {
                        dir = 'up';
                    } else if (lastCol > cellCol) {
                        dir = 'left';
                    }
                    $('#cell-'+lastRow+'-'+lastCol).addClass('to-'+dir);
                }
                setState('done');
            }
            return true;
        }
        // find the cells that lead to the last cell
        var cellRow = lastCell[0];
        var cellCol = lastCell[1];
        for (var r = 0; r < puzzle.gridSize; r++) {
            if (r === cellRow) continue;
            var dist = Math.abs(r - cellRow);
            if (dist === puzzle.grid[r][cellCol]) {
                var testCell = [ r, cellCol ];
                if (_.findIndex(revPath, function(o) { return _.isEqual(o, testCell); }) >= 0) continue;
                revPath.push(testCell);
                if (solveGrid(revPath)) return;
                revPath.pop();
            }
        }
        for (var c = 0; c < puzzle.gridSize; c++) {
            if (c === cellCol) continue;
            var dist = Math.abs(c - cellCol);
            if (dist === puzzle.grid[cellRow][c]) {
                var testCell = [ cellRow, c ];
                if (_.findIndex(revPath, function(o) { return _.isEqual(o, testCell); }) >= 0) continue;
                revPath.push(testCell);
                if (solveGrid(revPath)) return;
                revPath.pop();
            }
        }
        return false;
    };

    $('#save').click(function() {
        var cellsUndefined = _.filter(_.flatten(puzzle.grid), function(n) { return n === -1; }).length;
        var errors = [];
        if (cellsUndefined > 0) {
            errors.push(cellsUndefined + ' cells not defined');
        }
        if (puzzle.tee[0] < 0) {
            errors.push('Tee not defined');
        }
        if (puzzle.hole[0] < 0) {
            errors.push('Hole not defined');
        }
        if (errors.length > 0) {
            $('#errors').text(errors.join(', '));
            return;
        }
        prepCells();
        setState('run');
    });
    $('#cancel').click(function() {
        createGrid(puzzle.gridSize);
    });

    $('#new').click(function() {
        if (confirm('Clear grid?')) {
            setState('new');
            createGrid(puzzle.gridSize);
        }
    });
    $('#restart').click(function() {
        if (confirm('Reset grid?')) {
            testGrid = _.clone(puzzle);
            setState('run');
            createGrid();
        }
    });

    $('#solve').click(function() {
        testGrid = _.clone(puzzle);
        setState('run');
        createGrid();
        var revPath = [ puzzle.hole ];
        solveGrid(revPath)
    });

    createGrid(startGridSize);
});

