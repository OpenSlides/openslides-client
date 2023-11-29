import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Chess, EVENT_TYPE } from 'cm-chess/src/Chess';
import { BORDER_TYPE, Chessboard, COLOR, FEN, INPUT_EVENT_TYPE } from 'cm-chessboard/src/Chessboard';
import { PromotionDialog } from 'cm-chessboard/src/extensions/promotion-dialog/PromotionDialog';
import { Id } from 'src/app/domain/definitions/key-types';
import { NotifyResponse, NotifyService } from 'src/app/gateways/notify.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseGameDialogComponent, State } from '../../../../components/base-game-dialog/base-game-dialog';

interface ChessDialogConfig {
    userId?: Id;
    notify?: NotifyResponse<{ name: string }>;
}

@Component({
    selector: `os-chess-dialog`,
    templateUrl: `./chess-dialog.component.html`,
    styleUrls: [`./chess-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ChessDialogComponent extends BaseGameDialogComponent implements OnInit {
    protected prefix = `chess`;

    /**
     * The chess engine
     */
    private chess: Chess = new Chess();

    /**
     * The chess board
     */
    private board: Chessboard = null;

    /**
     * The HTML element for the chess board
     */
    @ViewChild(`chessboard`, { static: true })
    public boardContainer: ElementRef;

    /**
     * Color of this user
     */
    private ownColor: COLOR = COLOR.white;

    public constructor(
        activeMeetingService: ActiveMeetingService,
        notifyService: NotifyService,
        op: OperatorService,
        translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) private config: ChessDialogConfig
    ) {
        super(activeMeetingService, notifyService, op, translate);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.caption = this.translate.instant(`Chess`);
        if (this.inMeeting) {
            this.board = new Chessboard(this.boardContainer.nativeElement, {
                position: FEN.start,
                language: this.translate.currentLang == `de` ? `de` : `en`,
                assetsUrl: `./chess/`,
                style: {
                    borderType: BORDER_TYPE.frame
                },
                extensions: [{ class: PromotionDialog }]
            });
            this.chess.addObserver(({ type }) => {
                if (type === EVENT_TYPE.initialized || type === EVENT_TYPE.legalMove) {
                    this.board.setPosition(this.chess.fen(), true);
                }
            });
        }
        if (this.config?.userId) {
            this.state = `waitForResponse`;
            this.notifyService.sendToUsers(`chess_challenge`, { name: this.getPlayerName() }, this.config.userId);
            this.caption = this.translate.instant(`Waiting for response ...`);
            const handle = this.SM.waitForResponse.receivedACK.handle;
            this.SM.waitForResponse.receivedACK.handle = (notify: NotifyResponse<{ name: string }>) => {
                if (notify.sender_user_id === this.config.userId) {
                    this.replyChannel = notify.sender_channel_id;
                    return handle(notify);
                }
                return null;
            };
        } else if (this.config?.notify) {
            this.state = `search`;
            this.handleEvent(`receivedSearchResponse`, this.config.notify);
        }
    }

    protected override reset(): void {
        this.chess.load(FEN.start);
    }

    protected startGame(message?: any): [any, State] {
        let result: any = null;
        if (message !== undefined) {
            this.ownColor = message;
        } else {
            this.ownColor = Math.random() < 0.5 ? COLOR.white : COLOR.black;
            result = this.ownColor === COLOR.white ? COLOR.black : COLOR.white;
        }
        this.board.setOrientation(this.ownColor);
        return [result, this.ownColor == COLOR.white ? `ownMove` : `opponentMove`];
    }

    protected executeMove(move: any, ownMove?: boolean): State | null {
        let moveStr = move.piece + move.squareFrom + move.squareTo;
        if (move.promotion) {
            moveStr += move.promotion.charAt(1);
        }
        this.chess.move(moveStr);
        const nextState = this.getStateFromBoardStatus();
        return nextState === null ? (ownMove ? `opponentMove` : `ownMove`) : nextState;
    }

    private enableMoveInput(): void {
        this.board.enableMoveInput(event => {
            if (event.type == INPUT_EVENT_TYPE.moveInputStarted) {
                return true;
            } else if (event.type == INPUT_EVENT_TYPE.validateMoveInput) {
                const result = this.chess.validateMove(event.piece + event.squareFrom + event.squareTo);
                if (result) {
                    const move = { piece: event.piece, squareFrom: event.squareFrom, squareTo: event.squareTo };
                    if (this.isPromotionMove(event)) {
                        this.board.showPromotionDialog(event.squareTo, this.ownColor, result => {
                            if (result?.piece) {
                                this.handleEvent(`executedMove`, { ...move, promotion: result.piece });
                            } else {
                                this.board.setPosition(this.chess.fen(), true);
                            }
                        });
                    } else {
                        this.handleEvent(`executedMove`, move);
                    }
                }
                return result;
            }
        }, this.ownColor);
    }

    private isPromotionMove(event): boolean {
        return (event.squareTo.charAt(1) === `1` || event.squareTo.charAt(1) === `8`) && event.piece.charAt(1) === `p`;
    }

    /**
     * Returns null if the game is not finished.
     */
    private getStateFromBoardStatus(): State | null {
        if (this.chess.gameOver()) {
            if (this.chess.inCheckmate()) {
                if (this.chess.turn() === this.ownColor) {
                    this.caption = this.translate.instant(`Checkmate! You lost!`);
                } else {
                    this.caption = this.translate.instant(`Checkmate! You won!`);
                }
            } else if (this.chess.inStalemate()) {
                this.caption = this.translate.instant(`Stalemate! It's a draw!`);
            } else if (this.chess.inThreefoldRepetition()) {
                this.caption = this.translate.instant(`Threefold repetition! It's a draw!`);
            } else if (this.chess.insufficientMaterial()) {
                this.caption = this.translate.instant(`Insufficient material! It's a draw!`);
            } else if (this.chess.inDraw()) {
                this.caption = this.translate.instant(`It's a draw!`);
            }
            return `start`;
        } else {
            return null;
        }
    }

    // Enter state methods
    /**
     * Resets all attributes of the state machine.
     */
    public override enter_start(): void {
        super.enter_start();
        this.board.disableMoveInput();
    }

    /**
     * Sets the caption.
     */
    public override enter_ownMove(): void {
        super.enter_ownMove();
        this.enableMoveInput();
    }

    /**
     * Sets the caption.
     */
    public override enter_opponentMove(): void {
        super.enter_opponentMove();
        this.board.disableMoveInput();
    }
}
