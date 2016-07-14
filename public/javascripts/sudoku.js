$(function() {
    function blockIndexFor(r, c) {
        return parseInt((r - 1) / 3.0) * 3 + parseInt((c - 1)/3.0);
    }

    function blockCoords(block) {
        var minrow = parseInt(block / 3.0) * 3 + 1;
        var mincol = parseInt(block % 3.0) * 3 + 1;
        return [ minrow, mincol, minrow + 2, mincol + 2 ];
    }

    var testVals = null;
    //[
    //    null,
    //    [ null, 8, 0, 0, 0, 0, 0, 0, 0, 0 ],
    //    [ null, 0, 0, 3, 6, 0, 0, 0, 0, 0 ],
    //    [ null, 0, 7, 0, 0, 9, 0, 2, 0, 0 ],
    //    [ null, 0, 5, 0, 0, 0, 7, 0, 0, 0 ],
    //    [ null, 0, 0, 0, 0, 4, 5, 7, 0, 0 ],
    //    [ null, 0, 0, 0, 1, 0, 0, 0, 3, 0 ],
    //    [ null, 0, 0, 1, 0, 0, 0, 0, 6, 8 ],
    //    [ null, 0, 0, 8, 5, 0, 0, 0, 1, 0 ],
    //    [ null, 0, 9, 0, 0, 0, 0, 4, 0, 0 ],
    //];

    function init() {
        var grid = {
            state: 'new',
            runMode: 'check', // TODO: get from UI
            leftInRows: [ ],
            leftInCols: [ ],
            leftInBlocks: [ ],
            cells: {},
            depth: 0,
            newlyDefined: 0,
            openCells: 0,
            good: true,
            solved: false
        };
        var $grid = $('#grid');
        $grid.html('');
        for (var r = 1; r <= 9; r++) {
            grid.leftInRows.push([1,2,3,4,5,6,7,8,9]);
            grid.leftInCols.push([1,2,3,4,5,6,7,8,9]);
            grid.leftInBlocks.push([1,2,3,4,5,6,7,8,9]);

            var $tr = $('<tr></tr>');
            for (var c = 1; c <= 9; c++) {
                var b = blockIndexFor(r,c);

                grid.cells[r+','+c] = {
                    block: b,
                    value: null,
                    state: 'unset',
                    error: false,
                    possible: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
                };
                grid.openCells++;

                var $td = $('<td class="cell unset" id="r'+r+'c'+c+'" data-row="'+r+'" data-col="'+c+'"></td>');
                $td.append($('<span class="val"></span>'));
                var $reset = $('<div class="reset">x</span>');
                $td.append($reset);
                $reset.click(resetCell);
                for (var v = 1; v <= 9; v++) {
                    var $v = $('<span class="pos-val" data-pos-val="'+v+'">'+v+'</span>');
                    $td.append($v);
                    $v.click(defineCell);
                }
                $tr.append($td);
            }
            $grid.append($tr);
        }

        if (testVals) {
            for (var r = 1; r <= 9; r++) {
                for (var c = 1; c <= 9; c++) {
                    if (testVals[r][c] > 0) {
                        grid = setCell(grid, r, c, testVals[r][c], 'user');
                    }
                }
            }
        }

        return grid;
    }

    function showCell(grid, row, col) {
        var cell = grid.cells[row+','+col];
        var $cell = $('#r'+row+'c'+col);

        var cellClass = 'unset';
        if (cell.value) {
            cellClass = 'def ' + cell.state;
            $cell.find('.val').text(cell.value);
        }
        $cell.find('.pos-val').each(function(i, e) {
            var v = $(e).data().posVal;
            var hasV = (cell.value == null) && (_.indexOf(cell.possible, v) >= 0);
            $(e).css('display', hasV ? 'inline-block' : 'none');
        });
        if (cell.error) cellClass += ' error';
        $cell.attr('class', 'cell ' + cellClass);
    }

    function showGrid(grid) {
        for (var row = 1; row <= 9; row++) {
            for (var col = 1; col <= 9; col++) {
                showCell(grid, row, col);
            }
        }
    }

    function setCellPossibleValues(grid, row, col) {
        var cell = grid.cells[row+','+col];
        cell.possible = _.intersection(grid.leftInRows[row - 1], grid.leftInCols[col - 1], grid.leftInBlocks[cell.block]);
        showCell(grid, row, col);

        return cell;
    }

    function adjustCellPossibleValues(grid, row, col) {
        for (var r = 1; r <= 9; r++) {
            var cell = grid.cells[r+','+col];
            if (cell.value) continue;
            setCellPossibleValues(grid, r, col);
        }
        for (var c = 1; c <= 9; c++) {
            if (c == col) continue;
            var cell = grid.cells[row+','+c];
            if (cell.value) continue;
            setCellPossibleValues(grid, row, c);
        }
        var block = blockIndexFor(row, col);
        var brmin = parseInt(block / 3.0) * 3 + 1;
        var brmax = brmin + 2;
        var bcmin = (block - (brmin - 1)) * 3 + 1;
        var bcmax = bcmin + 2;
        for (var br = brmin; br <= brmax; br++) {
            for (var bc = bcmin; bc <= bcmax; bc++) {
                if (br == row && bc == col) continue;
                var cell = grid.cells[br+','+bc];
                if (cell.value) continue;
                setCellPossibleValues(grid, br, bc);
            }
        }

        return grid;
    }

    function setCell(grid, row, col, value, state) {
        var cell = grid.cells[row+','+col];
        cell.value = value;
        cell.state = state || 'user';
        cell.possible = [];

        grid.leftInRows[row-1] = _.without(grid.leftInRows[row-1], value);
        grid.leftInCols[col-1] = _.without(grid.leftInCols[col-1], value);
        grid.leftInBlocks[cell.block] = _.without(grid.leftInBlocks[cell.block], value);

        showCell(grid, row, col);

        grid.openCells -= 1;
        grid = adjustCellPossibleValues(grid, row, col);
        grid = checkAndProcess(grid);
        return grid;
    }

    function clearCell(grid, row, col) {
        var cell = grid.cells[row+','+col];
        var oldValue = cell.value;
        if (oldValue) {
            cell.value = null;
            cell.state = 'unset';
            grid.leftInRows[row-1].push(oldValue);
            grid.leftInCols[col-1].push(oldValue);
            grid.leftInBlocks[cell.block].push(oldValue);
        }

        grid.openCells += 1;
        showCell(grid, row, col);

        grid = adjustCellPossibleValues(grid, row, col);
        grid = checkAndProcess(grid);
        return grid;
    }

    function checkUnit(grid, minrow, mincol, maxrow, maxcol) {
        var unitLookup = {};
        var good = true;
        for (var r = minrow; r <= maxrow; r++) {
            for (var c = mincol; c <= maxcol; c++) {
                var cell = grid.cells[r+','+c];
                if (cell.value || cell.possible.length == 1) {
                    var testVal = cell.value || cell.possible[0];
                    if (unitLookup[testVal]) {
                        good = false;
                        cell.error = true;
                        var badCellInfo = unitLookup[testVal];
                        badCellInfo.cell.error = true;
                        showCell(grid, r, c)
                        showCell(grid, badCellInfo.row, badCellInfo.col);
                    } else {
                        unitLookup[testVal] = { cell:cell, row:r, col:c };
                    }
                } else if (cell.possible.length == 0) {
                    cell.error = true;
                    showCell(grid, r, c);
                    good = false;
                } else if (cell.error) {
                    cell.error = false;
                    showCell(grid, r, c);
                }
            }
        }
        if (!good) grid.good = false;
        return grid;
    }

    function runUnits(grid, func) {
        // run row units
        for (var r = 1; r <= 9; r++) {
            grid = func(grid, r, 1, r, 9);
        }
        // check col units
        for (var c = 1; c <= 9; c++) {
            grid = func(grid, 1, c, 9, c);
        }
        // check block units
        for (var b = 0; b < 9; b++) {
            var bc = blockCoords(b);
            grid = func(grid, bc[0], bc[1], bc[2], bc[3]);
        }
        return grid;
    }

    function check(grid) {
        grid.good = true;
        grid = runUnits(grid, checkUnit);
        setState(grid);
        return grid;
    }

    function reduceUnit(grid, minrow, mincol, maxrow, maxcol) {
        var oldRunMode = grid.runMode;
        grid.runMode = 'process';
        for (var r = minrow; r <= maxrow && grid.good; r++) {
            for (var c = mincol; c <= maxcol && grid.good; c++) {
                var cell = grid.cells[r+','+c];
                if (cell.possible.length == 1) {
                    grid = setCell(grid, r, c, cell.possible[0], 'reduce');
                }
            }
        }
        grid.runMode = oldRunMode;
        return grid;
    }

    function processReduce(grid) {
        if (grid.good) {
            grid = runUnits(grid, reduceUnit);
        }
        return grid;
    }

    function uniqueUnit(grid, minrow, mincol, maxrow, maxcol) {
        if (grid.good) {
            var oldRunMode = grid.runMode;
            grid.runMode = 'process';
            var cellsWithValue = [null, [], [], [], [], [], [], [], [], []];
            for (var r = minrow; r <= maxrow; r++) {
                for (var c = mincol; c <= maxcol; c++) {
                    var cell = grid.cells[r + ',' + c];
                    if (cell.possible.length > 1) {
                        for (var vi = 0; vi < cell.possible.length; vi++) {
                            cellsWithValue[cell.possible[vi]].push([r, c]);
                        }
                    }
                }
            }
            for (var v = 1; v <= 9 && grid.good; v++) {
                if (cellsWithValue[v].length == 1) {
                    var cc = cellsWithValue[v][0];
                    grid = setCell(grid, cc[0], cc[1], v, 'unique');
                }
            }
            grid.runMode = oldRunMode;
        }
        return grid;
    }

    function processUnique(grid) {
        if (grid.good) {
            grid = runUnits(grid, uniqueUnit);
        }
        return grid;
    }

    function process(grid) {
        if (grid.good) {
            grid = processReduce(grid);
            grid = processUnique(grid);
        }
        setState(grid);
        showGrid(grid);
        return grid;
    }

    function solve(grid) {
        if (grid.good && grid.openCells == 0) {
            return grid;
        }

        var mygrid = $.extend(true, {}, grid);
        if (mygrid.runMode != 'process') {
            mygrid = check(mygrid, true);
            if (mygrid.good) {
                mygrid = process(mygrid, true);
            } else {
                return mygrid;
            }
        }
        mygrid.runMode = 'process';
        mygrid.depth = (mygrid.depth || 0) + 1;
        var tryCell = null;
        for (var ct = 2; ct <= 9 && tryCell == null; ct++) {
            for (var r = 1; r <= 9 && tryCell == null; r++) {
                for (var c = 1; c <= 9 && tryCell == null; c++) {
                    var cell = mygrid.cells[r+','+c];
                    if (cell.possible.length == ct) {
                        tryCell = { possible: _.concat([], cell.possible), row: r, col: c };
                    }
                }
            }
        }
        if (tryCell) {
            for (var vi = 0; vi < tryCell.possible.length; vi++) {
                console.log('Depth ' + mygrid.depth + '. (' + mygrid.openCells + ' open) Trying ' + tryCell.possible[vi] + ' for cell (' + tryCell.row + ',' + tryCell.col + ') of ' + tryCell.possible.join(','));
                mygrid = setCell(mygrid, tryCell.row, tryCell.col, tryCell.possible[vi], 'guess', true);
                if (mygrid.good && mygrid.openCells == 0) {
                    return mygrid; // solved!
                } else if (mygrid.good) {
                    mygrid = solve(mygrid);
                }
                if (mygrid.good) {
                    return mygrid;
                } else {
                    // revert grid
                    console.log('Depth ' + mygrid.depth + '. (' + mygrid.openCells + ' open) Reverting ' + tryCell.possible[vi] + ' for cell (' + tryCell.row + ',' + tryCell.col + ') of ' + tryCell.possible.join(','));
                    mygrid = $.extend(true, {}, grid);
                    mygrid.depth = (mygrid.depth || 0) + 1; // fix the depth
                    showGrid(mygrid);
                }
            }
            mygrid.good = false; // couldn't find an answer to fit that cell
            tryCell.error = true;
        } else if (!mygrid.good || mygrid.openCells > 0) {
            mygrid.good = false;
        }
        return mygrid;
    }

    function checkAndProcess(grid) {
        if (grid.runMode == 'check' || grid.runMode == 'process') {
            grid = check(grid);
        }
        if (grid.runMode == 'process' && grid.good && grid.openCells > 0) {
            grid = process(grid);
        }
        return grid;
    }

    function setState(grid, state, mode, stateMessage, substate) {
        grid.state = state || grid.state;
        grid.runMode = mode || grid.runMode;
        $('#actions').attr('class', grid.state + ' ' + grid.runMode);
        if (substate == null && !grid.good) {
            substate = 'error';
            if (!stateMessage) stateMessage = 'ERROR';
        } else if (substate == null && grid.good && grid.openCells == 0) {
            substate = 'solved';
            grid.done = true;
            if (!stateMessage) stateMessage = 'SOLVED!';
        }
        if (stateMessage == null) {
            if (grid.state == 'new') {
                stateMessage = 'Define Starting Grid';
            } else if (grid.state == 'run') {
                stateMessage = 'Ok';
            }
        }
        $('#state').attr('class', substate || '');
        $('#state').text(stateMessage || 'Ok');
    }

    // set up starting state of grid
    var puzzle = init();
    testVals = null; // reset test vals
    puzzle.mode = $('#mode').val();
    setState(puzzle);
    showGrid(puzzle);
    $('#save').click(function() {
        puzzle = check(puzzle);
        if (puzzle.good) {
            setState(puzzle, 'run');
            // convert to fixed
            for (var r = 1; r <= 9; r++) {
                for (var c = 1; c <= 9; c++) {
                    var cell = puzzle.cells[r+','+c];
                    if (cell.state == 'user') {
                        cell.state = 'fixed';
                        showCell(puzzle, r, c);
                    }
                }
            }
            showGrid(puzzle);
        }
    });
    $('#cancel').click(function() {
        puzzle = init();
        showGrid(puzzle);
    });

    $('#new').click(function() {
        if (confirm('Ok to clear current grid and restart?')) {
            puzzle = init();
            showGrid(puzzle);
            setState(puzzle);
        }
    });
    $('#restart').click(function() {
        if (confirm('Ok to reset grid to starting state?')) {
            var initVals = [];
            for (var r = 1; r <= 9; r++) {
                for (var c = 1; c <= 9; c++) {
                    var cell = puzzle.cells[r+','+c];
                    if (cell.state == 'fixed') {
                        initVals.push({ row: r, col: c, value: cell.value });
                    }
                }
            }
            puzzle = init();
            for (var i = 0; i < initVals.length; i++) {
                var iv = initVals[i];
                setCell(puzzle, iv.row, iv.col, iv.value, 'user');
            }
            showGrid(puzzle);
            setState(puzzle);
        }
    });

    // running handlers
    $('#mode').change(function() {
        var oldMode = puzzle.runMode;
        var newMode = $('#mode').val();
        if (oldMode != newMode) {
            if (newMode == 'check' || newMode == 'process') {
                puzzle = check(puzzle);
            }
            if (newMode == 'process' && puzzle.good) {
                isDone(puzzle);
                puzzle = process(puzzle);
            }
        }
        puzzle.runMode = newMode;
        setState(puzzle);
    });

    function isDone() {
        if (puzzle.good && puzzle.openCells == 0) {
            setState(puzzle, 'done');
        }
    }

    function getCellFromEvent(ev) {
        var $cell = $(ev.target).parent('.cell');
        var row = parseInt($cell.data().row);
        var col = parseInt($cell.data().col);

        return [ $cell, row, col ];
    }

    function resetCell(event) {
        var cellInfo = getCellFromEvent(event);
        puzzle = clearCell(puzzle, cellInfo[1], cellInfo[2]);
    }
    function defineCell(event) {
        var cellInfo = getCellFromEvent(event);
        var v = parseInt($(event.target).data().posVal);

        puzzle = setCell(puzzle, cellInfo[1], cellInfo[2], v);
        isDone();
    }

    $('#check').click(function() {
        check(puzzle);
    });
    $('#process').click(function() {
        process(puzzle);
    });
    $('#solve').click(function() {
        console.log('\n\nSOLVING!\n\n');
        puzzle = solve(puzzle);
        if (!puzzle.good && puzzle.openCells > 0) {
            setState(puzzle, null, null, 'No Solution!');
        } else {
            isDone();
        }
    });
});
