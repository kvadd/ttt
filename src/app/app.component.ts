import { Component, ViewChild, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {

    // @ViewChildren('cell') private cellElements: ElementRef[];
    @ViewChild('board', { static: false }) private board: any;

    public showEndgame: boolean = false;
    public winningMessageText: string;
    public grid: any[] = [];
    public stats: any = {
        playerWins: 0,
        aiWins: 0,
        draw: 0
    };

    private usersTurn;
    private playerClass: string = 'x';
    private aiClass: string = 'circle';
    private WINNING_COMBINATIONS: any[] = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    public ngOnInit(): void {
        this.startGame();
    }

    private startGame() {
        this.usersTurn = false;
        this.grid = [];

        while (this.grid.length < 9) {
            this.grid.push({ selection: undefined });
        }

        this.showEndgame = false;
    }

    public handleClick(cell) {
        const cellTaken: boolean = this.isCellTaken(cell);

        if (!cellTaken) {
            this.handlePlay(cell);
        }
    }

    private handlePlay(cell) {
        const currentClass = this.usersTurn ? this.aiClass : this.playerClass;

        this.placeMark(cell, currentClass);

        const winningCombo = this.checkWin(currentClass);
        const isDraw = this.checkDraw();

        // check win
        if (winningCombo) {
            console.log('winner has been declared!');
            this.endGame(false);
        }
        else if (isDraw) {
            console.log('draw');
            this.endGame(true);
        }
        else {
            this.swapTurns();

            if (this.usersTurn) {
                console.log('AI turn');
                this.aiTurn();
            }
        }
    }

    private placeMark(cell, currentClass) {
        cell.selection = currentClass;
    }

    private swapTurns() {
        this.usersTurn = !this.usersTurn;
    }

    private aiTurn() {

        const userCombo = this.checkPotentialCombo(this.playerClass, 2);
        const aiCombo = this.checkPotentialCombo(this.aiClass, 2);
        const singleAiCombo = this.checkPotentialCombo(this.aiClass, 1);
        let selectedElement;

        if (aiCombo) {
            selectedElement = this.aiDecition(aiCombo);
        }
        else if (userCombo) {
            selectedElement = this.aiDecition(userCombo);
        }
        else if (singleAiCombo) {
            selectedElement = this.aiDecition(singleAiCombo);
        }
        else {
            const isMiddleFree = this.isCellTaken(this.grid[4]);

            if (!isMiddleFree) {
                selectedElement = this.grid[4];
            }
            else {
                while (!selectedElement) {
                    const randomNumber = Math.floor(Math.random() * (this.grid.length - 0)) + 0;
                    const takenElement = this.isCellTaken(this.grid[randomNumber]);

                    if (!takenElement) {
                        selectedElement = this.grid[randomNumber];
                    }
                }
            }
        }

        this.handlePlay(selectedElement);
    }

    private aiDecition(potentialMoves) {
        let selectedElement;
        while (!selectedElement) {
            const randomNumber = potentialMoves[Math.floor(Math.random() * (potentialMoves.length - 0)) + 0];
            const takenElement = this.isCellTaken(this.grid[randomNumber]);

            if (!takenElement) {
                selectedElement = this.grid[randomNumber];
            }
        }

        return selectedElement;
    }

    private checkPotentialCombo(classToCheck, combosToCheck) {
        return this.WINNING_COMBINATIONS.find(combination => {
            if (this.isRowFree(combination)) {
                return false;
            }

            const potentialCombo = combination.filter(index => {
                return this.grid[index].selection === classToCheck;
            });

            return potentialCombo.length === combosToCheck ? potentialCombo : false;
        });
    }

    private isRowFree(row) {
        return row.every(rowIndex => this.isCellTaken(this.grid[rowIndex]));
    }

    private isCellTaken(cell) {
        return !!cell.selection;
    }

    private checkWin(currentClass) {
        return this.WINNING_COMBINATIONS.some(combinaion => {
            return combinaion.every(index => {
                return this.grid[index].selection === currentClass;
            });
        });
    }

    private checkDraw() {
        const allCells = [];
        this.grid.forEach(element => allCells.push(element));

        return allCells.every(cell => {
            return (
                cell.selection === this.playerClass || cell.selection === this.aiClass
            );
        });
    }

    private endGame(draw) {
        if (draw) {
            this.winningMessageText = `It's a draw!`;
            this.stats.draw++;
        }
        else {
            if (!this.usersTurn) {
                this.winningMessageText = `Boom! You won!`;
                this.stats.playerWins++;
            }
            else {
                this.winningMessageText = `Uh oh, you lost.`;
                this.stats.aiWins++;
            }
        }

        this.showEndgame = true;
    }
}
