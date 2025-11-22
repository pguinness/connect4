class Player {
    name;
    score;

    constructor(name) {
        this.name = name;
        this.score = 0;
    }
}

class Theme {
    code;
    p1;
    p2;
}

class Game {
    player1;
    player2;

    #theme

    #turn;

    #thead;
    #tbody;

    // returns 1 if the cell is controlled by player1, 2 by player2 and null if the cell is empty
    #getCellOwner(row, col) {
        const rows = this.#tbody.rows;
        if (row < 0 || row >= rows.length || col < 0 || col >= rows[row].cells.length) return null;

        const cell = rows[row].cells[col];
        if (cell.children.length === 0) return null;
        
        const img = cell.children[0];
        if (!img || !img.alt) return null;
        if (img.alt.includes("A")) return 1;
        if (img.alt.includes("B")) return 2;
        return null;
    }

    // counts the consecutive pieces of the same owner starting from (r, c) exclusively in the (dr, dc) direction
    #countInDirection(r, c, dr, dc, owner) {
        let count = 0;
        let rr = r + dr;
        let cc = c + dc;

        let cellOwner = this.#getCellOwner(rr, cc);

        while (cellOwner === owner) {
            if (cellOwner === owner) {
                count++;
                rr += dr;
                cc += dc;
            }

            cellOwner = this.#getCellOwner(rr, cc);
        }

        return count;
    }

    // checks if the (row, col) play wins the game
    #checkWin(row, col) {
        const owner = this.#getCellOwner(row, col);
        if (owner === null) return false;

        // 4 possible directions
        const dirs = [
            [[0, -1], [0, 1]],  // horizontal
            [[-1, 0], [1, 0]],  // vertical
            [[-1, -1], [1, 1]], // diagonal \
            [[-1, 1], [1, -1]]  // diagonal /
        ];

        for (const [[dr1, dc1], [dr2, dc2]] of dirs) {
            const c1 = this.#countInDirection(row, col, dr1, dc1, owner);
            const c2 = this.#countInDirection(row, col, dr2, dc2, owner);
            // including the current piece
            if (1 + c1 + c2 >= 4) return true;
        }

        return false;
    }

    #updateScoresAndShowWinner(owner) {
        if (owner === 1) {
            this.player1.score++;
            document.getElementById("player1-score").innerText = this.player1.score;
            alert(`${this.player1.name} has won the game!`);
        } else if (owner === 2) {
            this.player2.score++;
            document.getElementById("player2-score").innerText = this.player2.score;
            alert(`${this.player2.name} has won the game!`);
        }
    }

    #handleKeyDown = (event) => {
        if (event.key >= '1' && event.key <= '7') {
            const num = parseInt(event.key);
            this.#throwPiece(num - 1);
        }
    };

    #updateInfo() {
        const current_name = document.getElementById("current-name");
        const current_piece = document.getElementById("current-piece");

        if (this.#turn) {
            current_name.innerText = this.player1.name;
            current_piece.src = "img/themes/" + this.#theme.code + "/a.png";
            current_piece.alt = "Piece A";
        } else {
            current_name.innerText = this.player2.name;
            current_piece.src = "img/themes/" + this.#theme.code + "/b.png";
            current_piece.alt = "Piece B";
        }
    }

    #boardIsFull() {
        const rows = this.#tbody.rows;

        for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < rows[r].cells.length; c++) {
                if (rows[r].cells[c].children.length === 0) {
                    return false; // at least one empty cell
                }
            }
        }

        return true; // everything is full
    }

    #throwPiece(col) {
        const rows = this.#tbody.rows;
        let row = 0;

        while (row < rows.length && rows[row].cells[col].children.length === 0) {
            row++;
        }

        const targetRow = Math.max(0, row - 1);
        if (rows[targetRow].cells[col].children.length != 0) return;

        // create piece
        const img = document.createElement("img");
        img.className = "piece";

        let owner;
        if (this.#turn) {
            img.src = "img/themes/" + this.#theme.code + "/a.png";
            img.alt = "Piece A";
            owner = 1;
        } else {
            img.src = "img/themes/" + this.#theme.code + "/b.png";
            img.alt = "Piece B";
            owner = 2;
        }

        // add animation class
        img.classList.add("piece-drop");

        // draw the piece
        rows[targetRow].cells[col].appendChild(img);

        // remove the animation after ending (so the next piece can animate as well)
        img.addEventListener("animationend", () => {
            img.classList.remove("piece-drop");
        });

        setTimeout(() => {
            // 1. win check
            if (this.#checkWin(targetRow, col)) {
                this.#updateScoresAndShowWinner(owner);
                this.resetBoard();
                return;
            }

            // 2. draw check
            if (this.#boardIsFull()) {
                alert("Empat! El tauler és ple.");
                this.resetBoard();
                return;
            }

            // 3. else, change turn
            this.#turn = !this.#turn;
            this.#updateInfo();
        }, 0);
    }

    #highlightColumn(col) {
        const rows = this.#tbody.rows;
        for (let r = 0; r < rows.length; r++) {
            rows[r].cells[col].classList.add("hover-col");
        }
    }

    #clearHighlight() {
        const rows = this.#tbody.rows;
        for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < rows[r].cells.length; c++) {
                rows[r].cells[c].classList.remove("hover-col");
            }
        }
    }

    initializeBoard() {
        const n = 7; // 7 x 7 board (1 x 7 buttons; 6 x 7 boxes)

        // create buttons
        const buttons_row = document.createElement("tr");

        for (let i = 0; i < n; i++) {
            const td = document.createElement("td");

            const button = document.createElement("button");
            button.innerHTML = "<i class=\"bi bi-caret-down-fill\"></i>"; // ▼ icon
            button.onclick = () => this.#throwPiece(i);

            // highlight column on hover
            button.addEventListener("mouseenter", () => this.#highlightColumn(i));
            button.addEventListener("mouseleave", () => this.#clearHighlight());

            td.appendChild(button);
            buttons_row.appendChild(td);
        }

        this.#thead.appendChild(buttons_row);

        // create boxes
        for (let i = 0; i < n - 1; i++) {
            const tr = document.createElement("tr");

            for (let j = 0; j < n; j++) {
                const td = document.createElement("td");
                tr.appendChild(td);
            }

            this.#tbody.appendChild(tr);
        }

        // set initial score
        document.getElementById("player1-name").innerText = this.player1.name;
        document.getElementById("player2-name").innerText = this.player2.name;
        document.getElementById("player1-score").innerText = this.player1.score;
        document.getElementById("player2-score").innerText = this.player2.score;
    }

    resetBoard() {
        const rows = this.#tbody.rows;
        for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < rows[r].cells.length; c++) {
                rows[r].cells[c].innerHTML = "";
            }
        }

        // each round starts a different player
        this.#turn = (this.player1.score + this.player2.score) % 2 === 0;
        this.#updateInfo();
    }

    finishGame() {
        const p1 = `${this.player1.name}: ${this.player1.score}`;
        const p2 = `${this.player2.name}: ${this.player2.score}`;

        let message = p1 + "\n" + p2;

        if (this.player1.score > this.player2.score) {
            message += `\n\nWinner: ${this.player1.name}`;
        } else if (this.player2.score > this.player1.score) {
            message += `\n\nWinner: ${this.player2.name}`;
        } else {
            message += "\n\nDraw!";
        }

        alert(message);

        document.querySelector("#board thead").innerHTML = "";
        document.querySelector("#board tbody").innerHTML = "";

        document.getElementById("game").style.display = "none";
        document.getElementById("settings").style.display = "block";

        document.removeEventListener("keydown", this.#handleKeyDown);
    };

    constructor(player1, player2, board_id, theme) {
        this.player1 = player1;
        this.player2 = player2;
        this.#theme = theme;

        this.#turn = true;
        
        // select board elements
        const table = document.getElementById(board_id);
        this.#thead = table.tHead; // buttons
        this.#tbody = table.tBodies[0]; // boxes

        this.initializeBoard();
        this.#updateInfo();

        this.#handleKeyDown = this.#handleKeyDown.bind(this);
        document.addEventListener("keydown", this.#handleKeyDown);
    }
}

function updatePlaceholders() {
    const theme_code = document.getElementById("theme-select").value;

    let theme;
    if (theme_code === "poker") {
        theme = { p1: "Black", p2: "Blue" };
    } 
    else if (theme_code === "stalker") {
        theme = { p1: "Duty", p2: "Freedom" };
    } 
    else if (theme_code === "cars") {
        theme = { p1: "Mercedes", p2: "BMW" };
    }
    else if (theme_code === "football") {
        theme = { p1: "Girona", p2: "PSG" };
    }
    else if (theme_code === "classic") {
        theme = { p1: "Red", p2: "Yellow" };
    }

    document.getElementById("p1-input-name").placeholder = theme.p1;
    document.getElementById("p2-input-name").placeholder = theme.p2;
}

function submitForm() {
    document.getElementById("settings").style = "display: none";

    const theme_code = document.getElementById("theme-select").value;
    let p1 = document.getElementById("p1-input-name");
    let p2 = document.getElementById("p2-input-name");
    
    const theme = new Theme();
    theme.code = theme_code;
    theme.p1 = p1.placeholder;
    theme.p2 = p2.placeholder;

    const game = new Game(
        new Player(p1.value == "" ? p1.placeholder : p1.value),
        new Player(p2.value == "" ? p2.placeholder : p2.value),
        "board",
        theme
    );
    
    document.getElementById("finish-button").onclick = () => game.finishGame();
    
    console.log(game);
    document.getElementById("game").style = "display: block";
}

window.onload = function() {
    updatePlaceholders();
    document.getElementById("game").style = "display: none";
}
