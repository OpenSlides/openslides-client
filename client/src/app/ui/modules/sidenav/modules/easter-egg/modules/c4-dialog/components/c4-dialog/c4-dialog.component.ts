import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'src/app/gateways/notify.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseGameDialogComponent, State } from '../../../../components/base-game-dialog/base-game-dialog';

/**
 * All player types.
 */
enum Player {
    noPlayer,
    thisPlayer,
    opponent
}

/**
 * All states the game board can have.
 */
enum BoardStatus {
    Draw = `draw`,
    thisPlayer = `thisPlayer`,
    opponent = `opponent`,
    NotDecided = `not decided`
}

@Component({
    selector: `os-c4-dialog`,
    templateUrl: `./c4-dialog.component.html`,
    styleUrls: [`./c4-dialog.component.scss`]
})
export class C4DialogComponent extends BaseGameDialogComponent implements OnInit {
    protected prefix = `c4`;

    /**
     * Saves if the board is disabled.
     */
    public disableBoard = false;

    /**
     * The board. First columns, then rows. Size is 7x6.
     */
    public board: Player[][] = [];

    public constructor(
    ) {
        super();
        this.reset();
    }

    public override ngOnInit(): void {
        // Setup initial values.
        super.ngOnInit();
        this.caption = this.translate.instant(`Connect 4`);
        this.disableBoard = true;
    }

    /**
     * Resets the board.
     */
    protected reset(): void {
        this.board = [];
        for (let i = 0; i < 7; i++) {
            const row = [];
            for (let j = 0; j < 6; j++) {
                row.push(Player.noPlayer);
            }
            this.board.push(row);
        }
    }

    protected startGame(message?: any): [any, State] {
        if (message !== undefined) {
            const state = message ? `ownMove` : `opponentMove`;
            return [null, state];
        } else {
            const startPlayer = Math.random() < 0.5 ? Player.thisPlayer : Player.opponent;
            const startOpponent: boolean = startPlayer === Player.opponent;
            const state = startPlayer === Player.thisPlayer ? `ownMove` : `opponentMove`;
            return [startOpponent, state];
        }
    }

    protected executeMove(move: any, ownMove?: boolean): State | null {
        this.setCoin(move.col, ownMove ? Player.thisPlayer : Player.opponent);
        const nextState = this.getStateFromBoardStatus();
        return nextState === null ? (ownMove ? `opponentMove` : `ownMove`) : nextState;
    }

    /**
     * Returns the class needed in the board.
     * @param row The row
     * @param col The column
     */
    public getCoinClass(row: number, col: number): string {
        switch (this.board[col][row]) {
            case Player.noPlayer:
                return `coin notSelected`;
            case Player.thisPlayer:
                return `coin thisPlayer`;
            case Player.opponent:
                return `coin opponent`;
        }
    }

    /**
     * Returns null, if the game is not finished.
     */
    private getStateFromBoardStatus(): State | null {
        switch (this.boardStatus()) {
            case BoardStatus.Draw:
                this.caption = this.translate.instant(`Game draw!`);
                return `start`;
            case BoardStatus.thisPlayer:
                this.caption = this.translate.instant(`You won!`);
                return `start`;
            case BoardStatus.opponent:
                this.caption = this.translate.instant(`Your opponent has won!`);
                return `start`;
            case BoardStatus.NotDecided:
                return null;
        }
    }

    /**
     * Handler for clicks on the field.
     * @param col the col clicked
     */
    public clickField(col: number): void {
        if (!this.disableBoard && this.colFree(col)) {
            this.handleEvent(`executedMove`, { col });
        }
    }

    public override enter_start(): void {
        super.enter_start();
        this.disableBoard = true;
    }

    public override enter_search(): void {
        super.enter_search();
        this.disableBoard = false;
    }

    // Board function
    /**
     * Places a coin on the board
     * @param col The col to place a coin
     * @param player The player who placed the coin
     */
    private setCoin(col: number, player: Player): void {
        for (let row = 0; row < 6; row++) {
            if (this.board[col][row] === Player.noPlayer) {
                this.board[col][row] = player;
                break;
            }
        }
    }

    /**
     * Returns true, if the given col is free to place a coin there
     * @param col the col
     */
    private colFree(col: number): boolean {
        return this.board[col][5] === Player.noPlayer;
    }

    /**
     * Returns the current state of the board
     */
    private boardStatus(): BoardStatus {
        // check if a player has won
        // vertical
        let won: Player;
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
                won = this.board[col][row];
                for (let i = 1; i < 4 && won !== Player.noPlayer; i++) {
                    if (this.board[col + i][row] !== won) {
                        won = Player.noPlayer;
                    }
                }
                if (won !== Player.noPlayer) {
                    return won === Player.thisPlayer ? BoardStatus.thisPlayer : BoardStatus.opponent;
                }
            }
        }
        // horizontal
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row < 3; row++) {
                won = this.board[col][row];
                for (let i = 1; i < 4 && won !== Player.noPlayer; i++) {
                    if (this.board[col][row + i] !== won) {
                        won = Player.noPlayer;
                    }
                }
                if (won !== Player.noPlayer) {
                    return won === Player.thisPlayer ? BoardStatus.thisPlayer : BoardStatus.opponent;
                }
            }
        }
        // diag 1
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 3; row++) {
                won = this.board[col][row];
                for (let i = 1; i < 4 && won !== Player.noPlayer; i++) {
                    if (this.board[col + i][row + i] !== won) {
                        won = Player.noPlayer;
                    }
                }
                if (won !== Player.noPlayer) {
                    return won === Player.thisPlayer ? BoardStatus.thisPlayer : BoardStatus.opponent;
                }
            }
        }
        // diag 1
        for (let col = 3; col < 7; col++) {
            for (let row = 0; row < 3; row++) {
                won = this.board[col][row];
                for (let i = 1; i < 4 && won !== Player.noPlayer; i++) {
                    if (this.board[col - i][row + i] !== won) {
                        won = Player.noPlayer;
                    }
                }
                if (won !== Player.noPlayer) {
                    return won === Player.thisPlayer ? BoardStatus.thisPlayer : BoardStatus.opponent;
                }
            }
        }
        // game draw?
        let draw = true;
        for (let col = 0; col < 7; col++) {
            if (this.board[col][5] === Player.noPlayer) {
                draw = false;
                break;
            }
        }
        return draw ? BoardStatus.Draw : BoardStatus.NotDecided;
    }
}
