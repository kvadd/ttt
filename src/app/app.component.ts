import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {

    public showEndgame: boolean = false;
    public winningMessageText: string;
    public grid: Cell[];
    public stats: Stats = {
        user: 0,
        ai: 0,
        draw: 0
    };

    private usersTurn: boolean;
    private playerClass: string = 'x';
    private aiClass: string = 'circle';
    private WINNING_COMBINATIONS: number[][] = [
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
        const storage = localStorage.getItem('statsStash');

        if (storage) {
            this.stats = JSON.parse(storage);
        }

        this.startGame();
    }

    private startGame(): void {
        this.usersTurn = !!(Math.round(Math.random()));

        this.grid = [];

        while (this.grid.length < 9) {
            this.grid.push({ selection: undefined });
        }

        this.showEndgame = false;

        if (this.usersTurn) {
            this.aiTurn(true);
        }
    }

    public handleClick(cell): void {
        const cellTaken: boolean = this.isCellTaken(cell);

        if (!cellTaken && !this.showEndgame) {
            this.handlePlay(cell);
        }
    }

    private handlePlay(cell: Cell): void {
        const currentClass = this.usersTurn ? this.aiClass : this.playerClass;

        this.placeMark(cell, currentClass);

        const hasWinningCombo = this.checkWin(currentClass);
        const isDraw = this.checkDraw();

        if (hasWinningCombo) {
            this.endGame(false);
        }
        else if (isDraw) {
            this.endGame(true);
        }
        else {
            this.swapTurns();

            if (this.usersTurn) {
                this.aiTurn(false);
            }
        }
    }

    private placeMark(cell: Cell, currentClass: string): void {
        cell.selection = currentClass;
    }

    private swapTurns(): void {
        this.usersTurn = !this.usersTurn;
    }

    private aiTurn(firstRun: boolean): void {
        const userCombo = this.checkPotentialCombo(this.playerClass, 2);
        const aiCombo = this.checkPotentialCombo(this.aiClass, 2);
        const singleAiCombo = this.checkPotentialCombo(this.aiClass, 1);
        let chosenCell: Cell;

        if (aiCombo) {
            chosenCell = this.aiDecition(aiCombo);
        }
        else if (userCombo) {
            chosenCell = this.aiDecition(userCombo);
        }
        else if (singleAiCombo) {
            chosenCell = this.aiDecition(singleAiCombo);
        }
        else {
            const isMiddleFree = this.isCellTaken(this.grid[4]);

            if (!isMiddleFree && !firstRun) {
                chosenCell = this.grid[4];
            }
            else {
                while (!chosenCell) {
                    const randomNumber = Math.floor(Math.random() * (this.grid.length - 0)) + 0;
                    const takenElement = this.isCellTaken(this.grid[randomNumber]);

                    if (!takenElement) {
                        chosenCell = this.grid[randomNumber];
                    }
                }
            }
        }

        this.handlePlay(chosenCell);
    }

    private aiDecition(potentialMoves: number[]): Cell {
        let selectedElement: Cell;

        while (!selectedElement) {
            const randomNumber = potentialMoves[Math.floor(Math.random() * (potentialMoves.length - 0)) + 0];
            const takenElement = this.isCellTaken(this.grid[randomNumber]);

            if (!takenElement) {
                selectedElement = this.grid[randomNumber];
            }
        }

        return selectedElement;
    }

    private checkPotentialCombo(classToCheck: string, combosToCheck: number): number[] {
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

    private isRowFree(row: number[]): boolean {
        return row.every(rowIndex => this.isCellTaken(this.grid[rowIndex]));
    }

    private isCellTaken(cell: Cell): boolean {
        return !!cell.selection;
    }

    private checkWin(currentClass: string): boolean {
        return this.WINNING_COMBINATIONS.some(combinaion => {
            return combinaion.every(index => {
                return this.grid[index].selection === currentClass;
            });
        });
    }

    private checkDraw(): boolean {
        const allCells = [];
        this.grid.forEach(element => allCells.push(element));

        return allCells.every(cell => {
            return (
                cell.selection === this.playerClass || cell.selection === this.aiClass
            );
        });
    }

    private endGame(isDraw: boolean): void {
        if (isDraw) {
            this.winningMessageText = `It's a draw!`;
            this.stats.draw++;
        }
        else {
            if (!this.usersTurn) {
                this.winningMessageText = `Boom! You won!`;
                this.stats.user++;
            }
            else {
                this.winningMessageText = `Uh oh, you lost.`;
                this.stats.ai++;
            }
        }

        localStorage.setItem('statsStash', JSON.stringify(this.stats));
        this.showEndgame = true;
    }

}

interface Cell {
    selection: string | undefined;
}

interface Stats {
    user: number;
    ai: number;
    draw: number;
}
