$(function() {
    var defaultGridSize = 10;
    var testData = null;
    //{
    //    grid: [
    //        [ 0, 2, 0, 5, 0, 0, 5, 0, 0, 3 ],
    //        [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
    //        [ 2, 0, 0, 2, 0, 0, 0, 2, 0, 3 ],
    //        [ 0, 4, 0, 0, 5, 0, 2, 0, 0, 0 ],
    //        [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2 ],
    //        [ 0, 3, 0, 0, 4, 0, 0, 2, 0, 0 ],
    //        [ 2, 0, 2, 0, 0, 0, 0, 0, 0, 0 ],
    //        [ 0, 0, 0, 0, 0, 0, 4, 0, 0, 4 ],
    //        [ 0, 0, 2, 0, 2, 0, 0, 0, 0, 0 ],
    //        [ 2, 0, 0, 3, 0, 0, 3, 0, 0, 1 ]
    //    ]
    //};

    var dirInfo = {
        'lt': { opposite: 'rt', line: 'horiz', blankVal: -1, rowInc: 0, colInc: -1 },
        'rt': { opposite: 'lt', line: 'horiz', blankVal: -1, rowInc: 0, colInc: +1 },
        'up': { opposite: 'dn', line: 'vert',  blankVal: -2, rowInc: -1, colInc: 0 },
        'dn': { opposite: 'up', line: 'vert',  blankVal: -2, rowInc: +1, colInc: 0 }
    };

    var targetCell = function(row, col, dir) {
        var r = row;
        var c = col;
        var info = dirInfo[dir];
        while (1 === 1) {
            r += info.rowInc;
            c += info.colInc;
            if (r < 0 || r >= puzzle.gridSize || c < 0 || c >= puzzle.gridSize) break;
            var v = puzzle.grid[r][c];
            if (v > 0) {
                $('#cell-'+r+'-'+c).addClass('tgt').data('dir', dir);
                break;
            } else if (v != info.blankVal && v != 0) {
                break; // hit a perpendicular connector, so stop looking that way
            }
        }
    };

    var renderLine = function(ct, dir, srow, scol, erow, ecol) {
        var r = srow;
        var c = scol;
        var info = dirInfo[dir];
        while (1 === 1) {
            r += info.rowInc;
            c += info.colInc;
            if (r === erow && c === ecol) break;
            var $c = $('#cell-'+r+'-'+c);
            if (ct === 0) {
                $c.removeClass(info.line + '-2');
            } else {
                $c.removeClass(info.line + '-1').addClass(info.line + '-' + ct);
            }
            puzzle.grid[r][c] = (ct === 0) ? 0 : info.blankVal;
        }
    };

    var checkSolved = function() {
        var nodes = _.values(puzzle.nodes);
        var solved = (_.reject(nodes, { state:'complete' }).length === 0);
        if (solved) {
            setState('done');
            $('.cell').removeClass('sel tgt');
        }
    };

    var setCellCount = function(r, c, dir, oldCt, ct) {
        var $c = $('#cell-'+r+'-'+c);
        var diff = ct - oldCt;
        var curCt = $c.data('count');
        curCt += diff;
        $c.data('count', curCt);
        var node = puzzle.nodes[r+','+c];
        node.connected = curCt;
        var st = 'incomplete';
        if (node.connected === node.value) {
            st = 'complete';
        } else if (node.connected > node.value) {
            st = 'overflow';
        }
        node.state = st;
        $c.removeClass('incomplete complete overflow').addClass(st);
        $c.data(dir, ct);
        if (st === 'complete') {
            checkSolved();
        }
    };

    var selectedCell = function(e) {
        if (puzzle.state === 'done') return;
        var $cell = $(e.target);
        if (!$cell.hasClass('cell')) { $cell = $cell.parents('.cell'); }
        var row = $cell.data('row');
        var col = $cell.data('col');
        if (puzzle.selectedCell) {
            if (row === puzzle.selectedCell[0] && col === puzzle.selectedCell[1]) {
                $cell.removeClass('sel');
                $('.cell.tgt').removeClass('tgt').data('dir', null);
                puzzle.selectedCell = null;
            } else if ($cell.hasClass('tgt')) {
                var $selCell = $('#cell-'+puzzle.selectedCell[0]+'-'+puzzle.selectedCell[1]);
                var dir = $cell.data('dir');
                var info = dirInfo[dir];
                var oldDirCt = $selCell.data(dir);
                var dirCt = oldDirCt + 1;
                if (dirCt > 2) dirCt = 0;
                renderLine(dirCt, dir, puzzle.selectedCell[0], puzzle.selectedCell[1], row, col);
                setCellCount(puzzle.selectedCell[0], puzzle.selectedCell[1], dir, oldDirCt, dirCt);
                setCellCount(row, col, info.opposite, oldDirCt, dirCt);
            }
            return;
        }
        $cell.addClass('sel');
        puzzle.selectedCell = [ row, col ];
        targetCell(row, col, 'lt');
        targetCell(row, col, 'rt');
        targetCell(row, col, 'up');
        targetCell(row, col, 'dn');
    };

    var renderCell = function(row, col, count, node) {
        var $cell = $('<div>')
            .addClass('cell')
            .attr('id', 'cell-'+row+'-'+col)
            .data({ row:row, col: col });
        $cell.append($('<div>').addClass('lt'));
        $cell.append($('<div>').addClass('rt'));
        $cell.append($('<div>').addClass('up'));
        $cell.append($('<div>').addClass('dn'));
        if (count > 0 && node) {
            var $node = $('<div>').addClass('nd').text(count);
            $cell.append($node).addClass('node ' + node.state).data({
                lt: 0,
                rt: 0,
                up: 0,
                dn: 0,
                count: 0
            });

            $cell.click(selectedCell);
        } else {
            $cell.addClass('blank');
            if (count === -1) {
                $node = $('<div>').addClass('nd').text('');
                $cell.append($node);
            }
        }
        return $cell;
    };

    var renderGrid = function() {
        var $grid = $('#grid');
        $grid.html('');
        for (var r = 0; r < puzzle.gridSize; r++) {
            var $row = $('<div>').addClass('row');
            for (var c = 0; c < puzzle.gridSize; c++) {
                var node = puzzle.nodes[r+','+c];
                var value = (puzzle.state === 'new') ? -1 : puzzle.grid[r][c];
                $row.append(renderCell(r, c, value, node));
            }
            $grid.append($row);
        }
    };

    var initPuzzle = function(gridSize) {
        var pzl = {
            gridSize: gridSize,
            grid: [],
            nodes: {},
            selectedNode: null,
            state: 'new'
        };
        if (testData) {
            pzl.gridSize = testData.grid.length;
            gridSize = pzl.gridSize;
            pzl.grid = testData.grid;
            pzl.state = 'run';
            // build nodes dictionary
            for (var r = 0; r < gridSize; r++) {
                for (var c = 0; c < gridSize; c++) {
                    var v = pzl.grid[r][c];
                    if (v > 0) {
                        pzl.nodes[r+','+c] = {
                            value: v,
                            connected: 0,
                            state: 'incomplete'
                        }
                    }
                }
            }
            testData = null;
        } else {
            pzl.grid = [];
            for (var r = 0; r < gridSize; r++) {
                pzl.grid.push(_.fill(Array(gridSize), 0));
            }
        }
        return pzl;
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

    var setupNew = function() {
        $('.cell').click(function(e) {
            var $cell = $(e.target);
            if (!$cell.hasClass('cell')) { $cell = $cell.parents('.cell'); }
            var r = $cell.data('row');
            var c = $cell.data('col');
            if ($cell.hasClass('node')) {
                var value = $cell.data('value') + 1;
                if (value > 8) {
                    $cell.data('value', null);
                    $cell.removeClass('node').addClass('blank');
                    $cell.find('.nd').text('');
                    delete puzzle.nodes[r+','+c];
                    puzzle.grid[r][c] = 0;
                } else {
                    $cell.data('value', value);
                    $cell.find('.nd').text(value);
                    puzzle.nodes[r+','+c].value = value;
                    puzzle.grid[r][c] = value;
                }
            } else {
                $cell.removeClass('blank').addClass('node').data({ value: 1 });
                $cell.find('.nd').text(1);
                puzzle.nodes[r+','+c] = {
                    value: 1,
                    connected: 0,
                    state: 'incomplete'
                };
                puzzle.grid[r][c] = 1;
            }
        });
    }

    var puzzle = initPuzzle(defaultGridSize);
    renderGrid();
    setState(puzzle.state);
    if (puzzle.state === 'new') setupNew();

    $('#restart').click(function(e) {
        for (var r = 0; r < puzzle.gridSize; r++) {
            for (var c = 0; c < puzzle.gridSize; c++) {
                var v = puzzle.grid[r][c];
                if (v > 0) {
                    var n = puzzle.nodes[r+','+c];
                    n.connected = 0;
                    n.state = 'incomplete';
                } else if (v < 0) {
                    puzzle.grid[r][c] = 0;
                }
            }
        }
        $('.cell.node')
            .removeClass('complete overflow sel tgt')
            .addClass('incomplete')
            .data({
                dir: null,
                lt: 0, rt: 0, up: 0, dn: 0,
                count: 0
            });
        $('.cell.blank').removeClass('vert-1 vert-2 horiz-1 horiz-2');
        setState('run');
    });

    $('#new').click(function(e) {
        setState('new');
        puzzle = initPuzzle(defaultGridSize);
        renderGrid();
        setupNew();
    });

    $('#cancel').click(function(e) {
        $('.cell').removeClass('node').addClass('blank').data('value', null);
        $('.cell .nd').text('');
    });

    $('#save').click(function(e) {
        testData = { grid: puzzle.grid };
        setState('run');
        puzzle = initPuzzle();
        renderGrid();
    });
});
