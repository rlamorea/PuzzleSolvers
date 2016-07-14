$(function() {
    var testVals = null;
    //{
    //    tiles: [
    //        [ 'E', 'E' ],
    //        [ 'L', 'D' ],
    //        [ 'S', 'B' ],
    //        [ 'I', 'L' ],
    //        [ 'R', 'R' ],
    //        [ 'D', 'I' ],
    //        [ 'U', 'O' ]
    //    ],
    //    flippable: 1
    //};

    function tileString(tiles, tileOrder, flippedTiles, idx) {
        var str = '';
        for (var li = 0; li < tiles.length; li++) {
            var tileIdx = tileOrder[li];
            var tile = tiles[tileIdx];
            var posIdx = idx;
            if (flippedTiles[tileIdx]) {
                posIdx = 1 - posIdx; // flip it
            }
            str += tile[posIdx];
        }
        return str;
    }

    function topString() {
        return tileString(puzzle.tiles, puzzle.tileOrder, puzzle.flippedTiles, 0);
    }

    function bottomString() {
        return tileString(puzzle.tiles, puzzle.tileOrder, puzzle.flippedTiles, 1);
    }

    function init(top, bottom, flippable) {
        var puz = {
            state: 'create',
            letterCount: 0,
            tiles: [],
            tileOrder: [],
            maxFlippedTiles: 0,
            flippedTileCount: 0,
            flippedTiles: {},
            topString: '',
            bottomString: '',
            selectedTile: null,
            solved: false
        };

        if (top && bottom && flippable != null) {
            puz.state = 'run';
            puz.maxFlippedTiles = flippable;
            puz.letterCount = top.length;
            for (var i = 0; i < top.length; i++) {
                puz.tiles.push([ top[i], bottom[i] ]);
            }
            puz.tileOrder = _.range(puz.letterCount);
            puz.topString = top;
            puz.bottomString = bottom;
        } else if (testVals) {
            puz.state = 'run';
            puz.letterCount = testVals.tiles.length;
            puz.tiles = testVals.tiles;
            puz.tileOrder = _.range(puz.letterCount);
            puz.maxFlippedTiles = testVals.flippable;
            puz.topString = topString(puz);
            puz.bottomString = bottomString(puz);
            testVals = null;
        }

        return puz;
    }

    function setState(state) {
        if (state == null) state = puzzle.state;
        puzzle.state = state;
        $('#actions').attr({ 'class':state });
        if (puzzle.state == 'create') {
            puzzle = init();
        }
    }

    function showpuzzle(inTileOrder) {
        var $puzzle = $('#tiles');
        $puzzle.html('');

        if (puzzle.state == 'create') {
            return;
            //puzzle.letterCount = 1;
        }
        var atMaxFlip = (puzzle.maxFlippedTiles == puzzle.flippedTileCount);
        for (var i = 0; i < puzzle.letterCount; i++) {
            var idx = inTileOrder ? puzzle.tileOrder[i] : i;
            var tile = puzzle.tiles[idx];
            var flipped = puzzle.flippedTiles[idx];

            var $tile = $('<div class="tile" data-tile-index="'+i+'"></div>');
            var tLetter = tile[flipped ? 1 : 0];
            var bLetter = tile[flipped ? 0 : 1];
            $tile.append($('<div class="top">'+tLetter+'</div>'));
            $tile.append($('<hr/>'));
            $tile.append($('<div class="bottom">'+bLetter+'</div>'));
            if (tile[0] !== tile[1]) {
                var $flip = $('<div class="flip"></div>');
                $flip.append('<i class="fa fa-refresh"></i>');
                $tile.append($flip);
                if (flipped || !atMaxFlip) {
                    $tile.addClass('flippable');
                    $flip.click(flipTile);
                }
            }
            $tile.click(selectTile);
            $puzzle.append($tile);
        }
    }

    function flipTile(e) {
        if (puzzle.solved) return;
        e.stopPropagation();
        var $tile = $(e.target).parents('.tile');
        var tileIndex = $tile.data('tile-index');
        var flipped = puzzle.flippedTiles[tileIndex];
        if (flipped) {
            delete puzzle.flippedTiles[tileIndex];
        } else {
            puzzle.flippedTiles[tileIndex] = true;
        }
        flipped = !flipped;
        var topLetter = puzzle.tiles[tileIndex][flipped ? 1 : 0];
        var bottomLetter = puzzle.tiles[tileIndex][flipped ? 0 : 1];
        var letterDivs = $tile.find('div');
        $(letterDivs[0]).text(topLetter);
        $(letterDivs[1]).text(bottomLetter);
        puzzle.flippedTileCount += (flipped ? 1 : -1);
        var flipFull = (puzzle.flippedTileCount == puzzle.maxFlippedTiles);
        $tile.parent().find('.tile').each(function(i, e) {
            var ti = $(e).data('tile-index');
            var flippable = flipFull ? puzzle.flippedTiles[ti] : true;
            $(e).toggleClass('flippable', flippable);
        });
    }

    function selectTile(e) {
        if (puzzle.solved) return;
        e.stopPropagation();
        var $tile = $(e.target).parents('.tile');
        var tileIndex = $tile.data('tile-index');

        if (puzzle.selectedTile) {
            var selIndex = puzzle.selectedTile.data('tile-index');
            if (selIndex == tileIndex) {
                $tile.removeClass('selected');
                puzzle.selectedTile = null;
                return; // turn on, turn off
            }

            puzzle.selectedTile.removeClass('selected');
            swapIndex = [];
            for (var i = 0; i < puzzle.letterCount; i++) {
                if (puzzle.tileOrder[i] == selIndex) {
                    swapIndex.push(i);
                    puzzle.tileOrder[i] = tileIndex;
                } else if (puzzle.tileOrder[i] == tileIndex) {
                    swapIndex.push(i);
                    puzzle.tileOrder[i] = selIndex;
                }
            }
            var tiles = $tile.parent().find('.tile');
            var subject = $(tiles.get(swapIndex[0]));
            //var object = $(tiles.get(swapIndex[1]));
            subject.insertAfter($(tiles.get(swapIndex[1])));
            if(swapIndex[0] !== swapIndex[1]+1) {
                $(tiles.get(swapIndex[1])).insertBefore($(tiles.get(swapIndex[0] + 1)));
            }
            puzzle.selectedTile = null;
        } else {
            $tile.addClass('selected');
            puzzle.selectedTile = $tile;
        }
    }

    var metaStringIdx = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ*";
    function metaString(tileOrder, flippedTiles) {
        var ms = '';
        for (var i = 0; i < tileOrder.length; i++) ms += metaStringIdx[tileOrder[i]];
        var fl = Object.keys(flippedTiles || {});
        if (fl.length > 0) {
            ms += ':';
            for (var i = 0; i < fl.length; i++) ms += metaStringIdx[fl[i]];
        }
        return ms;
    }
    function demetaString(ms) {
        var to = [];
        var ft = {};
        var flipped = false;
        for (var i = 0; i < ms.length; i++) {
            var ch = ms[i];
            if (ch === ':') {
                flipped = true;
            } else if (flipped) {
                ft[metaStringIdx.indexOf(ch)] = true;
            } else {
                to.push(metaStringIdx.indexOf(ch));
            }
        }
        return {
            tileOrder: to,
            flippedTiles: ft
        };
    }

    function walkVariants(variants, tiles, tileOrder, flippedTiles, usedTiles, level) {
        if (level == (tiles.length)) {
            var topStr = tileString(tiles, tileOrder, flippedTiles, 0);
            var bottomStr = tileString(tiles, tileOrder, flippedTiles, 1);
            topStr = topStr.replace(/\*/g, ' ').trim();
            bottomStr = bottomStr.replace(/\*/g, ' ').trim();
            if (topStr.indexOf(' ') < 0 && bottomStr.indexOf(' ') < 0) {
                variants.push({
                    top: topStr,
                    bottom: bottomStr,
                    meta: metaString(tileOrder, flippedTiles)
                });
            }
        } else {
            for (var i = 0; i < tiles.length; i++) {
                if (usedTiles[i]) continue;
                tileOrder[level] = i;
                usedTiles[i] = true;
                walkVariants(variants, tiles, tileOrder, flippedTiles, usedTiles, level+1);
                delete usedTiles[i];
            }
        }
    }

    function testAnagrams(variants, pageSize, start, end) {
        if (start == variants.length) return;

        console.log('testing variants ' + start + ' to ' + (end - 1));
        var page = variants.slice(start, end);
        var data = {
            strings: page,
            test: [ 'top', 'bottom' ]
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

    function determineVariants(puzzle) {
        var variants = [];

        var tileOrder = [];
        var flippedTiles = {};
        var usedTiles = {};
        walkVariants(variants, puzzle.tiles, tileOrder, flippedTiles, usedTiles, 0);
        if (puzzle.maxFlippedTiles > 0) {
            for (var i = 0; i < puzzle.letterCount; i++) {
                if (puzzle.tiles[i][0] == puzzle.tiles[i][1]) continue; // don't bother flipping
                flippedTiles[i] = true;
                walkVariants(variants, puzzle.tiles, tileOrder, flippedTiles, usedTiles, 0);
                delete flippedTiles[i];
            }
        }
        if (puzzle.maxFlippedTiles > 1) {
            for (var i1 = 0; i1 < puzzle.letterCount; i1++) {
                if (puzzle.tiles[i1][0] == puzzle.tiles[i1][1]) continue;
                flippedTiles[i1] = true;
                for (var i2 = i1+1; i2 < puzzle.letterCount; i2++) {
                    if (puzzle.tiles[i2][0] == puzzle.tiles[i2][1]) continue;
                    flippedTiles[i2] = true;
                    walkVariants(variants, puzzle.tiles, tileOrder, flippedTiles, usedTiles, 0);
                    delete flippedTiles[i2];
                }
                delete flippedTiles[i1];
            }
        }
        if (puzzle.maxFlippedTiles > 2) {
            alert('not able to handle more than 2 flipped tiles at this time.');
        }

        for (var i = 0; i < variants.length; i++) {
            var variant = variants[i];
            variant.score = Anagram.wordScore(variant.top, true) + Anagram.wordScore(variant.bottom, true);
        }
        variants.sort(function(a, b) {
            var diff = b.score - a.score;
            diff = (diff == 0) ? a.top.localeCompare(b.top) : diff;
            return (diff == 0) ? a.bottom.localeCompare(b.bottom) : diff;
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
        var topLetters = $('#topletters').val().toUpperCase();
        var bottomLetters = $('#bottomletters').val().toUpperCase();
        var flippable = $('#flippable').val();
        if (flippable === "") { flippable = 0; }
        flippable = parseInt(flippable);

        var errors = [];
        if (!/^[A-Z\*]+$/.test(topLetters)) {
            errors.push('Invalid top letters');
        }
        if (!/^[A-Z\*]+$/.test(bottomLetters)) {
            errors.push('Invalid bottom letters');
        }
        if (topLetters.length != bottomLetters.length) {
            errors.push('Top and bottom letters not the same length');
        }
        if (isNaN(flippable)) {
            errors.push('Invalid flippable count');
        } else if (flippable < 0 || flippable > topLetters.length) {
            errors.push('Flippable count out of range.');
        }
        if (errors.length > 0) {
            var error = "Errors:\n" + errors.join('\n');
            alert(error);
            return;
        }

        puzzle = init(topLetters, bottomLetters, flippable);

        setState('run');
        showpuzzle();
    });
    $('#new').click(function(e) {
        if (confirm('Ok to clear current puzzle?')) {
            setState('create');
            showpuzzle();
        }
    });
    $('#restart').click(function(e) {
        if (confirm('Ok to clear current puzzle?')) {
            testVals = {
                tiles: puzzle.tiles,
                flippable: puzzle.maxFlippedTiles
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
        console.log('Solution: ' + anagram.top + ' | ' + anagram.bottom);
        var solution = demetaString(anagram.meta);
        puzzle.tileOrder = solution.tileOrder;
        puzzle.flippedTiles = solution.flippedTiles;
        showpuzzle(puzzle, true);
        $('#actions').attr({ 'class':'solved' });
        $('#tiles').attr({ 'class':'solved' });
        puzzle.solved = true;
    }
});
