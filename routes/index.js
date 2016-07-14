var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Puzzle Solvers', solvers: {
        'anagrams': 'Anagrams',
        'binairo': 'Binairo',
        'connect': 'Connect',
        'findtheword': 'Find the Word',
        'golfmaze': 'Golf Maze',
        'letterblocks': 'Letter Blocks',
        'onelessmore': 'One Letter Less or More',
        'sudoku': 'Sudoku',
        'wordpyramid': 'Word Pyramid',
        'wordsearch': 'Word Search'
    } });
});

router.get('/sudoku', function(req, res, next) {
    res.render('sudoku', { title: 'Sudoku Solver' });
});

router.get('/binairo', function(req, res, next) {
    res.render('binairo', { title: 'Binairo Solver' });
});

router.get('/letterblocks', function(req, res, next) {
    res.render('letterblocks', { title: 'Letter Blocks Solver' });
});

router.get('/onelessmore', function(req, res, next) {
    res.render('onelessmore', { title: 'One Letter Less or More Solver' });
});

router.get('/anagrams', function(req, res, next) {
    res.render('anagrams', { title: 'Anagrams Solver' });
});

router.get('/wordpyramid', function(req, res, next) {
    res.render('wordpyramid', { title: 'Word Pyramid' });
});

router.get('/golfmaze', function(req, res, next) {
    res.render('golfmaze', { title: 'Golf Maze' });
});

router.get('/wordsearch', function(req, res, next) {
    res.render('wordsearch', { title: 'Word Search' });
});

router.get('/connect', function(req, res, next) {
    res.render('connect', { title: 'Connect' });
});

router.get('/findtheword', function(req, res, next) {
    res.render('findtheword', { title: 'Find the Word' });
});

module.exports = router;
