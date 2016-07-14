$(function() {
    var testVals = null;
    //[
    //    [ -1, -1, -1, -1, -1,  1, -1, -1, -1,  0 ],
    //    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
    //    [ -1, -1,  0, -1, -1, -1,  1, -1, -1, -1 ],
    //    [ -1, -1, -1,  0,  0, -1, -1, -1, -1, -1 ],
    //    [ -1,  0, -1, -1, -1, -1, -1, -1, -1, -1 ],
    //    [ -1, -1, -1, -1, -1, -1,  0,  0, -1,  0 ],
    //    [ -1, -1, -1, -1, -1, -1, -1,  0,  0, -1 ],
    //    [  1, -1,  0, -1,  0, -1, -1, -1,  0,  0 ],
    //    [ -1, -1, -1, -1, -1,  1,  1, -1, -1,  0 ],
    //    [  1,  0, -1,  1, -1, -1, -1,  0, -1, -1 ],
    //];

    function init() {
        var grid = {
            state: 'new',
            runMode: 'check', // TODO: get from UI
            cells: [],
            depth: 0,
            openCells: 0,
            good: true,
        };
        var $grid = $('#grid');
        $grid.html('');
        for (var r = 0; r < 10; r++) {
            var $tr = $('<tr></tr>');
            grid.cells.push( [] );
            for (var c = 0; c < 10; c++) {
                grid.cells[r].push({
                    value: null,
                    state: 'unset',
                    error: false,
                    possible: [ 0, 1 ]
                });
                grid.openCells++;

                var $td = $('<td class="cell unset" id="r'+r+'c'+c+'" data-row="'+r+'" data-col="'+c+'"></td>');
                $td.append($('<span class="val"></span>'));
                var $reset = $('<div class="reset">x</span>');
                $td.append($reset);
                $reset.click(resetCell);
                for (var v = 0; v <= 1; v++) {
                    var $v = $('<span class="pos-val" data-pos-val="'+v+'">'+v+'</span>');
                    $td.append($v);
                    $v.click(defineCell);
                }
                $tr.append($td);
            }
            $grid.append($tr);
        }

        if (testVals) {
            for (var r = 0; r < 10; r++) {
                for (var c = 0; c <= 10; c++) {
                    if (testVals[r][c] >= 0) {
                        grid = setCell(grid, r, c, testVals[r][c], 'user');
                    }
                }
            }
        }

        return grid;
    }

    function showCell(grid, row, col) {
        var cell = grid.cells[row][col];
        var $cell = $('#r'+row+'c'+col);

        var cellClass = 'unset';
        if (cell.value != null) {
            cellClass = 'def ' + cell.state;
            $cell.find('.val').text(cell.value);
        }
        $cell.find('.pos-val').each(function(i, e) {
            var v = $(e).data().posVal;
            var hasV = (cell.value == null) && (_.indexOf(cell.possible, v) >= 0);
            $(e).css('display', hasV ? 'block' : 'none');
        });
        if (cell.error) cellClass += ' error';
        $cell.attr('class', 'cell ' + cellClass);
    }

    function showGrid(grid) {
        for (var row = 0; row < 10; row++) {
            for (var col = 0; col < 10; col++) {
                showCell(grid, row, col);
            }
        }
    }

    function checkTwo(grid, reqVal, r1,c1, r2,c2) {
        if ((reqVal != null && reqVal < 0) || r1 < 0 || r2 < 0 || c1 < 0 || c2 < 0 || r1 >= 10 || r2 >= 10 || c1 >= 10 || c2 >= 10) return reqVal;
        var c1 = grid.cells[r1][c1], c2 = grid.cells[r2][c2];
        if (c1.value == null || c2.value == null) return reqVal;
        var tot = c1.value + c2.value;
        var needs = (tot == 0) ? 1 : (tot == 2) ? 0 : null;
        if (reqVal == null && needs != null) {
            reqVal = needs;
        } else if (reqVal != null && needs != null && needs != reqVal) {
            reqVal = -1; // -1 means we have a conflict somewhere!
        }
        return reqVal;
    }

    function setCellPossibleValues(grid, row, col) {
        if (grid.cells[row][col].value != null) return grid;
        var reqVal = null;
        // if two-in-a-row, then this cell cannot be same
        reqVal = checkTwo(grid, reqVal, row,col-1, row,col-2);
        reqVal = checkTwo(grid, reqVal, row,col+1, row,col+2);
        reqVal = checkTwo(grid, reqVal, row-1,col, row-2,col);
        reqVal = checkTwo(grid, reqVal, row+1,col, row+2,col);
        // if surrounded by the same, must be different
        reqVal = checkTwo(grid, reqVal, row,col-1, row,col+1);
        reqVal = checkTwo(grid, reqVal, row-1,col, row+1,col);

        if (reqVal < 0) {
            grid.cells[row][col].error = true;
            grid.cells[row][col].possible = [];
        } else if (reqVal == null) {
            grid.cells[row][col].error = false;
            grid.cells[row][col].possible = [ 0, 1 ];
        } else {
            grid.cells[row][col].error = false;
            grid.cells[row][col].possible = [ reqVal ];
        }

        showCell(grid, row, col);

        return grid;
    }

    function adjustCellPossibleValues(grid, row, col) {
        var rowCts = [];
        for (var r = 0; r < 10; r++) {
            grid = setCellPossibleValues(grid, r, col);
            rowCts[r] = { zero: 0, one: 0 };
            for (var c = 0; c < 10; c++) {
                rowCts[r].zero += (grid.cells[r][c].value === 0) ? 1 : 0;
                rowCts[r].one += (grid.cells[r][c].value === 1) ? 1 : 0;
            }
        }
        var colCts = [];
        for (var c = 0; c < 10; c++) {
            grid = setCellPossibleValues(grid, row, c);
            colCts[c] = { zero: 0, one: 0 };
            for (var r = 0; r < 10; r++) {
                colCts[c].zero += (grid.cells[r][c].value === 0) ? 1 : 0;
                colCts[c].one += (grid.cells[r][c].value === 1) ? 1 : 0;
            }
        }
        for (var r = 0; r < 10; r++) {
            var fillVal = null;
            if (rowCts[r].zero == 5 && rowCts[r].one < 5) {
                fillVal = 1;
            } else if (rowCts[r].one == 5 && rowCts[r].zero < 5) {
                fillVal = 0;
            }
            if (fillVal != null) {
                for (var c = 0; c < 10; c++) {
                    var cell = grid.cells[r][c];
                    if (cell.value == null) {
                        if (cell.possible.length == 1 && cell.possible[0] != fillVal) {
                            cell.error = true;
                        } else {
                            cell.possible = [ fillVal ];
                        }
                        showCell(grid, r, c);
                    }
                }
            }
        }
        for (var c = 0; c < 10; c++) {
            var fillVal = null;
            if (colCts[c].zero == 5 && colCts[c].one < 5) {
                fillVal = 1;
            } else if (colCts[c].one == 5 && colCts[c].zero < 5) {
                fillVal = 0;
            }
            if (fillVal != null) {
                for (var r = 0; r < 10; r++) {
                    var cell = grid.cells[r][c];
                    if (cell.value == null) {
                        if (cell.possible.length == 1 && cell.possible[0] != fillVal) {
                            cell.error = true;
                        } else {
                            cell.possible = [ fillVal ];
                        }
                        showCell(grid, r, c);
                    }
                }
            }
        }

        return grid;
    }

    function setCell(grid, row, col, value, state) {
        var cell = grid.cells[row][col];
        cell.value = value;
        cell.state = state || 'user';
        cell.possible = [];

        showCell(grid, row, col);

        grid.openCells -= 1;
        grid = adjustCellPossibleValues(grid, row, col);
        grid = checkAndProcess(grid);
        return grid;
    }

    function clearCell(grid, row, col) {
        var cell = grid.cells[row][col];
        var oldValue = cell.value;
        if (oldValue != null) {
            cell.value = null;
            cell.state = 'unset';
            cell.possible = [ 0, 1 ];
        }

        grid.openCells += 1;
        showCell(grid, row, col);

        grid = adjustCellPossibleValues(grid, row, col);
        grid = checkAndProcess(grid);
        return grid;
    }

    function deErrorGrid(grid) {
        for (var r = 0; r < 10; r++) {
            for (var c = 0; c < 10; c++) {
                grid.cells[r][c].error = false;
            }
        }
        return grid;
    }

    function check(grid) {
        grid.good = true;
        grid = deErrorGrid(grid);
        // check for duplicate rows
        var rowStrs = [], colStrs = [], rowCts = [], colCts = [];
        for (var r = 0; r < 10; r++) {
            rowCts[r] = { zero: 0, one: 0 };
            for (var c = 0; c < 10; c++) {
                colCts[c] = colCts[c] || { zero: 0, one: 0 };
                var cv = grid.cells[r][c].value;
                var cStr = (cv == null) ? ' ' : cv.toString();
                rowStrs[r] = (rowStrs[r] || '') + cStr;
                colStrs[c] = (colStrs[c] || '') + cStr;
                rowCts[r].zero += (cv == 0) ? 1 : 0;
                rowCts[r].one += (cv == 1) ? 1 : 0;
                colCts[c].zero += (cv == 0) ? 1 : 0;
                colCts[c].one += (cv == 1) ? 1 : 0;
                grid = adjustCellPossibleValues(grid, r, c);
                if (grid.cells[r][c].error) grid.good = false;
            }
        }
        var rowKeys = {}, colKeys = {};
        for (var i = 0; i < 10; i++) {
            if (rowCts[i].zero > 5) {
                grid.good = false;
                for (var c = 0; c < 10; c++) {
                    if (grid.cells[i][c].value == 0) {} grid.cells[i][c].error = true;
                }
            } else if (rowCts[i].one > 5) {
                grid.good = false;
                for (var c = 0; c < 10; c++) {
                    if (grid.cells[i][c].value == 1) grid.cells[i][c].error = true;
                }
            }
            var rowStr = rowStrs[i];
            if (rowStr.indexOf(' ') < 0) {
                var dupRow = rowKeys[rowStr];
                if (dupRow != null) {
                    grid.good = false;
                    for (var c = 0; c < 10; c++) {
                        grid.cells[i][c].error = true;
                        grid.cells[dupRow][c].error = true;
                    }
                } else {
                    rowKeys[rowStr] = i;
                }
            }
            if (colCts[i].zero > 5) {
                grid.good = false;
                for (var r = 0; r < 10; r++) {
                    if (grid.cells[r][i].value == 0) grid.cells[r][i].error = true;
                }
            } else if (colCts[i].one > 5) {
                grid.good = false;
                for (var r = 0; r < 10; r++) {
                    if (grid.cells[r][i].value == 1) grid.cells[r][i].error = true;
                }
            }
            var colStr = colStrs[i];
            if (colStr.indexOf(' ') < 0) {
                var dupCol = colKeys[colStr];
                if (dupCol != null) {
                    grid.good = false;
                    for (var r = 0; r < 10; r++) {
                        grid.cells[r][i].error = true;
                        grid.cells[r][dupCol].error = true;
                    }
                } else {
                    colKeys[colStr] = i;
                }
            }
        }

        setState(grid);
        showGrid(grid);
        return grid;
    }

    function process(grid) {
        if (grid.good) {
            var keepGoing = true;
            while (keepGoing) {
                var assigned = 0;
                for (var r = 0; r < 10; r++) {
                    for (var c = 0; c < 10; c++) {
                        var cell = grid.cells[r][c];
                        if (cell.value == null && cell.possible.length == 1) {
                            grid = setCell(grid, r, c, cell.possible[0], 'unique');
                            assigned += 1;
                        }
                    }
                }
                if (assigned == 0) keepGoing = false;
            }
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
        for (var r = 0; r < 10 && tryCell == null; r++) {
            for (var c = 0; c < 10 && tryCell == null; c++) {
                var cell = mygrid.cells[r][c];
                if (cell.value == null) {
                    tryCell = { possible: _.concat([], cell.possible), row: r, col: c };
                }
            }
        }
        if (tryCell) {
            for (var vi = 0; vi < tryCell.possible.length; vi++) {
                console.log('Depth ' + mygrid.depth + '. (' + mygrid.openCells + ' open) Trying ' + tryCell.possible[vi] + ' for cell (' + tryCell.row + ',' + tryCell.col + ')');
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
    puzzle.mode = 'check';
    setState(puzzle);
    showGrid(puzzle);
    $('#save').click(function() {
        puzzle = check(puzzle);
        if (puzzle.good) {
            setState(puzzle, 'run');
            // convert to fixed
            for (var r = 0; r < 10; r++) {
                for (var c = 0; c < 10; c++) {
                    var cell = puzzle.cells[r][c];
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
            for (var r = 0; r < 10; r++) {
                for (var c = 0; c < 10; c++) {
                    var cell = puzzle.cells[r][c];
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
