Puzzle Solvers
==============

A simple set of puzzle solvers for the "Puzzle-A-Day" calendar.

Anagrams
--------

Use the letters in a word to fill in the blanks of a one-or-more-word solution.
The solution may have additional letters inserted in it.
Each letter of the word can only be used once.

Define the puzzle with:

* *word* - the word providing the characters of the anagram
* *definition* - the definition of the solution
* *pattern* - the pattern of the solution, with `_` indicating where a letter will go, and spaces or letters as appropriate
* click *Create* to start the puzzle

Solve the puzzle by:

* clicking on a letter in the word and then click on a blank in the solution to put it there
* click on the red 'x' on a solution cell to remove the letter there

Options:

* *Solve* - attempt to solve the puzzle by doing an anagram analysis
* *Restart* - clear the current state and restore the starting state of the puzzle
* *New* - clear the current puzzle and go back to create a new one

Binairo
-------

Complete a 10x10 grid of cells where a cell can have a value of either `1` or `0`.
Every row and column must have 5 `1`s and 5 `0`s.
No more than two of the same value can be next to each other horizontally or vertically.
Rows or columns with exactly the same content are not allowed.

Define the puzzle by:

* clicking on either the `1` or `0` in a cell to set it to that value
* click on the small red 'x' on a cell to clear its value
* when all starting cell values are set, click *Start*
* click *Clear* to clear all set cells

Solve the puzzle by:

* selecting cell values by clicking on `1` or `0`
* some cells may only offer a single value because the other option would break the rules
* some cells may be red and offer no options because a cell has been incorrectly selected
* click on the small red 'x' for a set cell to clear its value

Options:

* *Process* - automatically fill in any cells that must be a certain value, 
              and repeat until no more such cells exist, or the puzzle is solved
* *Solve* - automatically solve the puzzle (if possible) from its current state
* *Restart* - return to puzzle definition with the starting state of the current puzzle
* *New* - return to a blank puzzle definition

Connect
-------

Link all nodes with straight horizontal or vertical bridges into a single connected group.
The number at each node indicates how many bridges connect to that node.
No more than two bridges can connect two nodes.
Bridges cannot cross one another or pass through a node.

Define the puzzle by:

* Highlight the cell and click on it to add a node
* Click on a node multiple times to increment the number in the node
* Click on a node with `8` in it to remove the node
* When all nodes are set, click *Start*
* click *Clear* to remove all nodes

Solve the puzzle by:

* Click on a node to select it
  * It will turn red to indicate it is "active"
  * All "connecting" nodes will turn green
* Click on an "active" node to deselect it
* Click on a "connecting" node to cycle the number of bridges between it and the "active" node
  * The cycle will show one, then two, then no bridges
* A node's number will be gray if it doesn't have enough bridges connected to it yet
* A node's number will be black if it has the correct number of bridges connected to it
* A node will turn red if it has too many bridges connected to it
* The puzzle will automatically be set to "Solved" when all the conditions are met

Options:

* *Restart* - remove all bridges and reset all nodes
* *New* - clear the grid and return to puzzle definition

Find the Word
-------------

In a grid of letters and arrows, each arrow points to only one letter of the solution word.
A solution letter cannot touch another solution letter horizontally, vertically, or diagonally.
The solution letters form a word in "reading direction" (left to right per row, top to bottom rows).
One solution letter is identified (circled) at the start.

Define the puzzle by:

* Enter a letter in each cell
* To add an arrow to a cell, press `^` (or `6`)
* Click on an arrow to rotate it by 45 degrees.
* To mark a cell as identified, press `*` (or `8`)
* When all cells are filled with letters or arrows, and the arrows are pointing in the right direction, click *Start*
* click *Clear* to reset the grid to all blanks

Solve the puzzle by:

* Click on a letter to select it
* Click on a selected letter to deselect it 
* Cells with gray backgrounds cannot be selected
* Hover over an arrow to show possible letters that can be selected for that arrow
* Watch the word form underneath the grid

Options:

* *Restart* - restore the puzzle to its starting state
* *New* - clear the grid and return to puzzle definition

Golf Maze
---------

Find the shortest route from the tee to the hole.
Movement is only possible vertically or horizontally.
The number in each cell indicates how far the next cell is away.

Define the puzzle by:

* Enter a number in each cell
* To set a cell as the tee, enter `T` in addition to the number
* To set a cell as the hole, enter `H` (no number allowed here)
* When all cells have numbers, and there is a tee and hole, click *Start*
* click *New* to clear the grid

Solve the puzzle by:

* Tee-first:
  * Click on the tee to select it (border will turn red)
  * Possible destination cells will show a red arrow
  * Click on a cell with an arrow to select it (cell will turn red)
  * Repeat until hole is reached
* Hole-first:
  * Click on the hole to select it (border will turn blue)
  * Possible detination cells will show a blue arrow
  * Click on a cell with an arrow to select it (cell will turn blue)
  * Repeat until tee is reached
  
Options:

* *Solve* - automatically find a path from the tee to the hole
* *Restart* - restore the grid to its starting state
* *New* - clear the grid and return to puzzle definition

Letter Blocks
-------------

Move the letter blocks around so that words are formed on top abd below.
These words will both fit a theme.
Some blocks are reversed (the letter on the top belongs on the bottom and vice versa).

Define the puzzle by:

* *top letters* - the letters at the top of all the blocks
* *bottom letters* - the letters at the bottom of all the blocks
* *flippable* - the number of blocks that can be flipped (0 or more)
* When done, click *Create*

Solve the puzzle by:

* Click on a block to select it
* Click on a selected block to deselect it
* With a block selected, click on a second block to swap positions
* Click on rotate icon in block to swap top and bottom

Options:

* *Solve* - automatically attempt to find the solution
* *Restart* - restore the blocks to their starting state
* *New* - return to puzzle definition

One Letter Less or More
-----------------------

A solution word contains all of the letters of the starting word, plus or minus one letter.

Define the puzzle by:

* *word* - the starting word
* *letter* - select `+` or `-` and the letter
* *start* - the starting state of the solution word, which can be spaces (indicating blanks) or a letter
  * the letter must be in the starting word +/- the letter
* click *Create* to start puzzle

Solve the puzzle by:

* clicking on a letter in the starting  word and then click on a blank in the solution to put it there
* if the letter is added (+), it can also be clicked on to insert in the solution
* click on the red 'x' on a solution cell to remove the letter there

Options:

* *Solve* - attempt to solve the puzzle using anagram analysis
* *Restart* - restore the puzzle to its starting state
* *New* - return to puzzle definition

Sudoku
------

Fill in the grid so that each row, column, and 3x3 frame contains every number from 1 to 9.

Define the puzzle by:

* Select a number for a cell by clicking on it.
* Click the small red 'x' on a defined cell to clear it
* When all starting numbers are set, click *Start*
* Click *Clear* to clear all set cells

Solve the puzzle by:

* Select a number for any cell from the numbers available
* Click the small red 'x' on a defined cell to clear it
* Cells will turn red if a condition occurs where no numbers can be placed in a cell

Options:

* *Mode* - select the solving mode:
  * *Check* - after each selection the grid will be checked for errors
  * *Manual* - no checks are made unless asked for
  * *Auto* - after each selection, any cells that are identified as having a definite value are filled in.
             This is repeated until no more definite cells are found, or the puzzle is solved
* *Check* - check the status of the grid
* *Process* - automatically fill in all cells with definite values, repeat until no more left or puzzle is solved
* *Solve* - solve the puzzle
* *Restart* - return to puzzle definition and keep the puzzle's starting state
* *New* - return to puzzle definition with a blank grid

Word Pyramid
------------

Starting with the letter at the top, solve each level of the pyramid by using the letters of the level
above plus one additiona letter.  A definition is provided for each level.

Define the puzzle by:

* Entering the letter in the top cell

Solve the puzzle by:

* Entering the word for each definition (definitions are not provided in the solver)
* Word cells may turn red if they break the rules.

Options:

* Click the `?` (if available) to get a list of possible words for the level.
  * These words appear below the pyramid
  * Select one of these words to insert it into the pyramid
* *New* - clear the pyramid

Word Search
-----------

Find all the words in the list in the grid by looking in all directions.
Cells in the grid not part of any word, read left to right, top to bottom rows, provide a theme word.

Define the puzzle by:

* Fill each cell in the grid with a letter
* Add words to find in the list to the right of the grid
  * Hitting enter to add the word and provide an entry for a new word
  * Clearing a word will remove it from the list

Solve the puzzle by:

* Hover over letters in the grid to highlight words in the list that start with that letter
* Hover over words in the list to highlight occurances of the first letter in the grid
* Click on a letter to start identifying a word
* Click on the last letter of the word to mark it as found
  * Letters of the word will turn green when it has been found
* Hover over a found word to highlight its letters on the grid
* When the last word in the list is found, the remaining letters will be displayed as the theme word below the grid

Options:

* *Restart* - mark all words as not found in the list and grid
* *New* - return to puzzle definition with a blank grid

