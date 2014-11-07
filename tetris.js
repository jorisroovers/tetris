//"use strict";
////////// UTILITIES ///////////
function _(querySelector) {
    var self = {};

    (function init() {
        if (querySelector[0] === "<" && querySelector[querySelector.length - 1] === ">" && querySelector.length >= 3) {
            // element -> strip the opening and closing angular brackets
            element = querySelector.substr(1, querySelector.length - 2);
            self._element = document.createElement(element);
        } else {
            self._element = document.querySelector(querySelector);
        }
    })();

    self.addClass = function (clazz) {
        self._element.classList.add(clazz);
        return self;
    };

    self.html = function (newHtml) {
        if (typeof (newHtml) != "undefined") {
            self._element.innerHTML = newHtml;
            return self;
        } else {
            return self._element.innerHTML;
        }

    };

    self.append = function (el) {
        if (typeof (el) === "string") {
            var textEl = document.createTextNode(el);
            self._element.appendChild(textEl);
            // FUTURE: support adding new elements defined as string, eg.: "<div>"
        } else if (typeof (el._element) != "undefined") {
            self._element.appendChild(el._element);
        }
        return self;
    };

    self.show = function () {
        self._element.style.display = "block";
    };

    self.hide = function () {
        self._element.style.display = "none";
    };

    return self;
}

function UTILS() {
    var self = {};

    self.extend = function (obj1, obj2) {
        if (typeof (obj2) !== "undefined") {
            for (key in obj2) {
                if (!obj1.hasOwnProperty(key)) {
                    obj1[key] = obj2[key];
                }
            }
        }
        return obj1;
    };

    self.each = function (obj, callback) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                returnVal = callback(obj[i], i);
                if (returnVal === false) {
                    return;
                }
            }
        }
    };

    return self;
};

var _u = UTILS();

////////////////////// TETRIS ////////////////////

function Tetris(parent) {

    var self = parent || {};

    var BLOCKS = {
        "T": {
            // each array in patterns contains one of the possible rotations of the block
            // each rotation consists of an array of rows, where each row is again an array
            // the elements in a row indicate whether the respective cell is opaque (1) or transparent (0).
            patterns: [[[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                        [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
                        [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
                       [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
                      ],
            clazz: "T"
        },
        "O": {
            patterns: [[[1, 1], [1, 1]]],
            clazz: "O"
        },
        "J": {
            patterns: [[[0, 0, 0], [1, 1, 1], [0, 0, 1]],
                        [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
                        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
                       [[0, 1, 1], [0, 1, 0], [0, 1, 0]]
                      ],
            clazz: "J"
        },
        "I": {
            patterns: [[[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
                      ],
            clazz: "I"
        },
        "S": {
            patterns: [[[0, 1, 1], [1, 1, 0], [0, 0, 0]],
                        [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
                      ],
            clazz: "S"
        },
    };

    function Cell(y, x, filled, clazz) {
        var self = {
            filled: filled,
            clazz: clazz,
            y: y,
            x: x
        };

        self.isEmpty = function () {
            return self.filled !== true;
        };

        return self;
    };

    function ActiveBlock(blockName, gridWidth) {

        var self = {
            blockName: blockName,
            block: BLOCKS[blockName],
            currentPatternIndex: 0,
            x: 1,
            y: 0,
            _done: false
        };

        self.done = function () {
            self._done = true;
        };

        self.isDone = function () {
            return self._done;
        };

        self.pattern = function () {
            return self.block.patterns[self.currentPatternIndex];
        };

        self.width = function () {
            return self.pattern()[0].length;
        };

        self.height = function () {
            return self.pattern().length;
        };

        self.realHeight = function () {
            var height = 0;
            _u.each(self.pattern(), function (row) {
                _u.each(row, function (col) {
                    if (col === 1) {
                        height += 1;
                        return false;
                    }
                });
            });
            return height;
        };

        self.realWidth = function () {
            var pattern = self.pattern()
            var width = 0;
            for (var i = 0; i < self.width(); i++) {
                for (var j = 0; j < self.height(); j++) {
                    if (pattern[j][i] === 1) {
                        width += 1;
                        break;
                    }
                }
            }
            return width;
        };

        self.rotate = function () {
            if (self.isDone()) return;
            // set index to next block
            self.currentPatternIndex = (self.currentPatternIndex + 1) % self.block.patterns.length;

//            var adjacentCells = determineAdjacentCells(self);
//            console.log("ADJ". adjacentCells);
//            _.each(adjacentCells.left, function (cell) {
//                console.log(cell);
////                if (!cell.isEmpty()) {
////                    self.x = cell.x + 1;
////                    return false;
////
////
//                    //                    allEmpty = false;
////                    //                    return false;
////                }
//            });

            // cases where we rotate the block while it's resting against the wall -> move the block's position
            // right wall
            console.log("REAL WIDTH:" + self.realWidth());
            if (self.x + self.realWidth() >= gridWidth) { // right border
                self.x = gridWidth - self.width() - 1;
            } else if (self.x < self.realWidth() - 1) { // left border
                self.x = 1;
            }
        };

        return self;
    };

    var generateRow = function (rowNr, width, borders) {
        var row = new Array(width);
        for (j = 0; j < width; j++) {
            if (borders) {
                if (j == 0 || j == width - 1) {
                    row[j] = Cell(rowNr, j, true, "border-cell");
                } else {
                    row[j] = Cell(rowNr, j, false);
                }
            } else {
                row[j] = Cell(rowNr, j, false);
            }
        }
        return row;
    };

    var generateGrid = function (width, height, borders) {
        var grid = [];
        for (var i = 0; i < height; i++) {
            grid.push(generateRow(i, width, borders));
        }
        var bottomRow = generateRow(i, width, borders);
        if (borders) {
            _u.each(bottomRow, function (cell) {
                cell.filled = true;
                cell.clazz = "border-cell";
            });
        }
        grid.push(bottomRow);
        return grid;
    };

    var updateBlockOnGrid = function (block, grid, erase) {
        var pattern = block.pattern();
        // iterate over rows of the block pattern
        for (var i = 0; i < block.height(); i++) {
            for (var j = 0; j < block.width(); j++) {
                if (pattern[i][j] == 1) {
                    if (erase) {
                        grid[block.y + i][block.x + j].filled = false;
                        delete grid[block.y + i][block.x + j].clazz;
                    } else {
                        grid[block.y + i][block.x + j].filled = true;
                        grid[block.y + i][block.x + j].clazz = block.block.clazz;
                    }
                }
            }
        }
    };

    var addBlockToGrid = function (block) {
        updateBlockOnGrid(block, self.grid, false);
    };

    var removeBlockFromGrid = function (block) {
        updateBlockOnGrid(block, self.grid, true);
    };

    var determineAdjacentCells = function (block) {
        var blockPattern = block.pattern();

        var adjacentCells = {
            left: [],
            right: [],
            bottom: []
        };

        // iterate over each row of the block we are trying to move
        for (var i = 0; i < block.height(); i++) {
            // iterate over each subblock in the current row, until we find one that is colored (block value=1)
            var filledColLeft = 0;
            while (blockPattern[i][filledColLeft] != 1 && filledColLeft < block.width()) {
                filledColLeft++;
            }
            var filledColRight = block.width() - 1;
            while (blockPattern[i][filledColRight] != 1 && filledColRight > 0) {
                filledColRight--;
            }

            var adjacentCellRowIndex = block.y + i;

            filledColLeftAbsOffset = block.x + filledColLeft;
            if (blockPattern[i][filledColLeft] == 1 && filledColLeftAbsOffset > 0) {
                var adjacentCellColIndex = filledColLeftAbsOffset - 1;
                adjacentCells.left.push(self.grid[adjacentCellRowIndex][adjacentCellColIndex]);
            }

            filledColRightAbsOffset = block.x + filledColRight;
            if (blockPattern[i][filledColRight] == 1 && filledColRightAbsOffset < self.options.gridWidth - 1) {
                var adjacentCellColIndex = filledColRightAbsOffset + 1;
                adjacentCells.right.push(self.grid[adjacentCellRowIndex][adjacentCellColIndex]);
            }

        }

        // DETERMINE BOTTOM ADJACENT CELLS

        // iterate over the columns
        for (var i = 0; i < block.width(); i++) {
            var filledRowBottom = block.height() - 1;
            while (blockPattern[filledRowBottom][i] != 1 && filledRowBottom > 0) {
                filledRowBottom--;
            }

            var adjacentCellColIndex = block.x + i;

            filledRowBottomAbsOffset = block.y + filledRowBottom;
            if (blockPattern[filledRowBottom][i] == 1 && filledRowBottomAbsOffset < self.options.gridHeight) {
                var adjacentCellRowIndex = filledRowBottomAbsOffset + 1;
                adjacentCells.bottom.push(self.grid[adjacentCellRowIndex][adjacentCellColIndex]);
            }

        }

        return adjacentCells;

    };

    var moveAllowed = function (direction) {
        var adjCellsToCheck = direction == "down" ? "bottom" : direction;

        var adjacentCells = determineAdjacentCells(self.currentBlock);
        for (i = 0; i < adjacentCells[adjCellsToCheck].length; i++) {
            if (!adjacentCells[adjCellsToCheck][i].isEmpty()) {
                return false;
            }
        }
        return true;
    };

    var gameOver = function () {
        // BUG: if the user pauses and unpauses the game, he can move blocks again
        clearTimeout(self.timeOut);
        unbindGameControls();
        showOverlay("GAME OVER");
    };

    var moveBlockDown = function () {
        if (moveAllowed("down")) {
            removeBlockFromGrid(self.currentBlock); //remove current block from grid
            self.currentBlock.y += 1;
            addBlockToGrid(self.currentBlock); // add newly positioned block to grid
            if (!moveAllowed("down")) {
                // if we cannot move the block further down, it's done.
                self.currentBlock.done();
            }
        }
        if (self.currentBlock.y == 0) {
            gameOver();
        }
        // we can no longer move the block down, temporary stop the gameloop and process any full rows
        //            unbindGameControls();
        //            clearTimeout(self.timeOut);
        //            processFullRows(function () {
        //                console.log("RUNNING CALLBACK");
        //                bindGameControls();
        ////                gameLoop();
        //            });
    };

    var moveBlockRight = function () {
        if (moveAllowed("right")) {
            removeBlockFromGrid(self.currentBlock);
            self.currentBlock.x += 1;
            addBlockToGrid(self.currentBlock);
        }
    };

    var moveBlockLeft = function () {
        if (moveAllowed("left")) {
            removeBlockFromGrid(self.currentBlock);
            self.currentBlock.x -= 1;
            addBlockToGrid(self.currentBlock);
        }
    };

    self.renderGrid = function (grid, container) {
        for (var i = 0; i < grid.length; i++) {
            row = grid[i];
            var rowEl = _("<div>").addClass("row");
            for (j = 0; j < row.length; j++) {
                col = row[j];
                var cell = grid[i][j];
                var cellEl = _("<div>").addClass("cell");
                // if we're debugging -> render cell coordinates + color cells adjacent to dropping block
                if (self.options.debug) {
                    cellEl.append("(" + i + "," + j + ")");
                }
                if (typeof (cell.clazz) !== "undefined") {
                    cellEl.addClass(cell.clazz);
                }
                rowEl.append(cellEl);
            }
            container.append(rowEl);
        }
    };

    self.render = function () {
        self.canvas.html("");
        self.nextBlockEl.html("");

        self.scoreEl.html(self.score);
        self.levelEl.html(self.level);

        var adjacentCells = determineAdjacentCells(self.currentBlock);

        // color any adjacent cells
        if (self.options.debug) {
            for (key in adjacentCells) {
                for (i in adjacentCells[key]) {
                    if (!adjacentCells[key][i].clazz) {
                        adjacentCells[key][i].clazz = "adjacent-cell";
                    }
                }
            }
        }

        self.renderGrid(self.grid, self.canvas);
        self.renderGrid(self.nextBlockGrid, self.nextBlockEl);

        // remove adjacent cell coloring in the next round
        if (self.options.debug) {
            for (key in adjacentCells) {
                for (i in adjacentCells[key]) {
                    if (adjacentCells[key][i].clazz == "adjacent-cell") {
                        delete adjacentCells[key][i].clazz;
                    }
                }
            }
        }
    };

    var findFullRows = function () {
        // Find full rows by iterating over all rows and for every row, checking every column
        // if all cols in are not empty, then the row is full.
        // We return an array containing the indices of the full rows.
        var fullRows = [];
        for (var i = 0; i < self.options.gridHeight; i++) {
            var fullRow = true;
            for (j = 0; j < self.options.gridWidth; j++) {
                if (self.grid[i][j].isEmpty()) {
                    fullRow = false;
                }
            }
            if (fullRow) {
                fullRows.push(i);
            }
        }
        return fullRows;
    };

    var processFullRows = function (callback) {
        //        unbindGameControls(); // don't allow the user to do anything while we are processing rows
        var fullRows = findFullRows();
        if (fullRows.length === 0) {
            //            bindGameControls();
            return callback();
        }

        // highlight full rows
        _u.each(fullRows, function (rowIndex) {
            for (var i = 1; i < self.grid[rowIndex].length - 1; i++) {
                self.grid[rowIndex][i].clazz = "full";
            }
        });
        self.render();

        // remove full rows; we do this by iterating over the current grid and adding the rows that we want
        // to keep to a new grid. For each row that we don't add to the new grid (i.e. a row that is removed), 
        // we add an empty row to the top of the grid.
        setTimeout(function () {
            var newGrid = [];
            _u.each(self.grid, function (row, rowIndex) {
                if (fullRows.indexOf(rowIndex) == -1) {
                    newGrid.push(row);
                } else {
                    newGrid.unshift(generateRow(0, self.options.gridWidth, true /* borders */ ));
                }
            });
            self.grid = newGrid;
            // increase score, render the thing and fire callback that the game can continue
            self.score += fullRows.length;
            self.render();
            //            bindGameControls();
            return callback();
        }, 3000);

    };

    // Returns a random new block from the available blocks
    var randomBlock = function () {
        var blockTypes = Object.keys(BLOCKS);
        var randomBlockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        return ActiveBlock("I", self.options.gridWidth);
    };

    var nextBlock = function () {
        if (typeof (self.nextBlock) === "undefined") { // first block
            self.nextBlock = randomBlock();
        }
        // create a copy of the next block and draw it on the nextBlockGrid
        // the copy is needed so that it can have different x, y coordinates from the block on the actual play grid
        updateBlockOnGrid(self.nextBlock, self.nextBlockGrid, true);
        self.currentBlock = self.nextBlock;
        self.currentBlock.x = Math.floor((self.options.gridWidth - self.currentBlock.realWidth()) / 2); // put the block in the middle of the grid
        self.nextBlock = randomBlock();
        updateBlockOnGrid(self.nextBlock, self.nextBlockGrid, false);
    };

    // Main game loop, this is where the magic happens.
    // This method is executed on each tick (method calls itself using setTimeout).
    var gameLoop = function () {
        // if first block or if we can't move the currently active block any further, create a new block
        if (typeof (self.currentBlock) == "undefined" || self.currentBlock.isDone()) {
            nextBlock();
            addBlockToGrid(self.currentBlock);
        } else {
            moveBlockDown();
        }
        self.render();
        processFullRows(function () {
            self.timeOut = setTimeout(function () {
                gameLoop();
            }, self.options.tick);
        });


    };

    var processOptions = function (options) {
        var defaultOptions = {
            debug: false,
            tick: 1000,
            gridHeight: 15,
            gridWidth: 12
        };
        self.options = _u.extend(options || {}, defaultOptions);

        if (self.options.debug) {
            console.log("DEBUGGING ENABLED");
            console.log("options", self.options);
        }
    };

    var keyDownEventListener = function (e) {
        // if the current block is already done moving, stop moving it
        if (self.currentBlock.isDone()) {
            return;
        }
        if (e.keyCode == 39) { // right arrow
            moveBlockRight();
        } else if (e.keyCode == 37) { // left arrow
            moveBlockLeft();
        } else if (e.keyCode == 40) { // down arrow
            moveBlockDown();
        }
        self.render();
    };

    // keypress events only exist for special keys: e.g. SPACE
    var keyPressEventListener = function (e) {
        if (e.keyCode == 32) {
            removeBlockFromGrid(self.currentBlock);
            self.currentBlock.rotate();
            addBlockToGrid(self.currentBlock);
            self.render();
        }
    };

    var bindGameControls = function () {
        document.addEventListener("keydown", keyDownEventListener);
        document.addEventListener("keypress", keyPressEventListener);
    };

    var unbindGameControls = function () {
        document.removeEventListener("keydown", keyDownEventListener);
        document.removeEventListener("keypress", keyPressEventListener);
    };

    // the global controls include keypresses such as 'Pause'.
    var bindGlobalControls = function () {
        document.addEventListener("keypress", function (e) {
            if (e.keyCode == 112 /* P */ ) {
                pauseResume();
            }
        });
    };

    var pauseResume = function () {
        if (self.paused) { // RESUME
            hideOverlay();
            self.paused = false;
            gameLoop();
            bindGameControls();
        } else { // PAUSE
            clearTimeout(self.timeOut);
            unbindGameControls();
            self.paused = true;
            showOverlay("GAME PAUSED");
        }
    };

    var showOverlay = function (text) {
        self.overlayEl.show();
        self.overlayTextEl.html(text);
    };

    var hideOverlay = function () {
        self.overlayEl.hide();
    };


    self.init = function (canvasSelector, options) {
        processOptions(options);
        self.grid = generateGrid(self.options.gridWidth, self.options.gridHeight, true /* borders */ );
        self.nextBlockGrid = generateGrid(6, 3);
        self.canvas = _(canvasSelector);
        self.scoreEl = _("#score");
        self.levelEl = _("#level");
        self.overlayEl = _("#canvasOverlay");
        self.overlayTextEl = _("#canvasOverlayText");
        self.nextBlockEl = _("#nextBlock");
        self.score = 0;
        self.level = 1;
        self.paused = false;
        self.timeOut = null;
        self.keyControlListeners = [];

        gameLoop();
        bindGlobalControls();
        bindGameControls();
    };

    return self;
}

(function init() {
    var tetris = Tetris();
    tetris.init("#canvas", {
        //        debug: false,
//        debug: true,
        //                        gridHeight: 8,
        //        gridWidth: 4
    });
    tetris.render();



})();