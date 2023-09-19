import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Chess, EVENT_TYPE } from 'cm-chess/src/Chess';
import { BORDER_TYPE, Chessboard, COLOR, FEN, INPUT_EVENT_TYPE } from 'cm-chessboard/src/Chessboard';
import { PromotionDialog } from 'cm-chessboard/src/extensions/promotion-dialog/PromotionDialog';
import { Subscription } from 'rxjs';
import { NotifyResponse, NotifyService } from 'src/app/gateways/notify.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

/**
 * All states for the statemachine
 */
type State = 'start' | 'search' | 'waitForResponse' | 'ownMove' | 'opponentMove';

/**
 * All events that can be handled by the statemachine.
 */
type StateEvent =
    | 'searchClicked'
    | 'receivedSearchRequest'
    | 'receivedSearchResponse'
    | 'receivedACK'
    | 'waitTimeout'
    | 'executedMove'
    | 'receivedMove'
    | 'receivedRagequit';

/**
 * An action in one state.
 */
interface SMAction {
    handle: (data?: any) => State | null;
}

/**
 * The statemachine. Mapps events in states to actions.
 */
type StateMachine = { [state in State]?: { [event in StateEvent]?: SMAction } };

type Move = { piece: string; squareFrom: string; squareTo: string; promotion?: string };

@Component({
    selector: `os-chess-dialog`,
    templateUrl: `./chess-dialog.component.html`,
    styleUrls: [`./chess-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ChessDialogComponent implements OnInit, OnDestroy {
    /**
     * Contains if the user is currently within a meeting
     */
    public inMeeting = false;

    /**
     * The dialogs caption
     */
    public caption = ``;

    /**
     * Saves if the board is disabled.
     */
    public disableBoard = false;

    /**
     * The chess engine
     */
    private chess: Chess = new Chess();

    /**
     * The chess board
     */
    private board: Chessboard = null;

    @ViewChild(`chessboard`, { static: true })
    public boardContainer: ElementRef;

    /**
     * The channel of the partner.
     */
    private replyChannel: string | null = null;

    /**
     * The partners name.
     */
    public partnerName: string | null = null;

    private ownColor: COLOR = COLOR.white;

    /**
     * A timeout to go from waiting to search state.
     */
    private waitTimout: number | null = null;

    /**
     * A list of all subscriptions, so they can b unsubscribed on desroy.
     */
    private subscriptions: Subscription[] = [];

    /**
     * The current state of the state machine.
     */
    public state: State = `waitForResponse`;

    /**
     * This is the state machine for this game :)
     */
    public SM: StateMachine = {
        start: {
            searchClicked: {
                handle: () => {
                    this.disableBoard = false;
                    this.resetBoard();
                    return `search`;
                }
            }
        },
        search: {
            receivedSearchRequest: {
                handle: (notify: NotifyResponse<{ name: string }>) => {
                    this.replyChannel = notify.sender_channel_id;
                    this.partnerName = notify.message.name;
                    return `waitForResponse`;
                }
            },
            receivedSearchResponse: {
                handle: (notify: NotifyResponse<{ name: string }>) => {
                    this.replyChannel = notify.sender_channel_id;
                    this.partnerName = notify.message.name;
                    // who starts?
                    this.ownColor = Math.random() < 0.5 ? COLOR.white : COLOR.black;
                    this.board.setOrientation(this.ownColor);
                    const opponentColor = this.ownColor === COLOR.white ? COLOR.black : COLOR.white;
                    // send ACK
                    this.notifyService.sendToChannels(`chess_ACK`, opponentColor, this.replyChannel);
                    return this.ownColor == COLOR.white ? `ownMove` : `opponentMove`;
                }
            }
        },
        waitForResponse: {
            receivedACK: {
                handle: (notify: NotifyResponse<string>) => {
                    if (notify.sender_channel_id !== this.replyChannel) {
                        return null;
                    }
                    this.ownColor = notify.message;
                    this.board.setOrientation(this.ownColor);
                    return this.ownColor == COLOR.white ? `ownMove` : `opponentMove`;
                }
            },
            waitTimeout: {
                handle: () => `search`
            },
            receivedRagequit: {
                handle: (notify: NotifyResponse<{}>) =>
                    notify.sender_channel_id === this.replyChannel ? `search` : null
            }
        },
        ownMove: {
            executedMove: {
                handle: (move: Move) => {
                    this.notifyService.sendToChannels(`chess_move`, move, this.replyChannel!);
                    let moveStr = move.piece + move.squareFrom + move.squareTo;
                    if (move.promotion) {
                        moveStr += move.promotion.charAt(1);
                    }
                    this.chess.move(moveStr);
                    const nextState = this.getStateFromBoardStatus();
                    return nextState === null ? `opponentMove` : nextState;
                }
            },
            receivedRagequit: {
                handle: () => {
                    this.caption = this.translate.instant(
                        `Your partner couldn't stand it anymore... You are the winner!`
                    );
                    return `start`;
                }
            }
        },
        opponentMove: {
            receivedMove: {
                handle: (notify: NotifyResponse<Move>) => {
                    if (notify.sender_channel_id !== this.replyChannel) {
                        return null;
                    }
                    const m = notify.message;
                    let moveStr = m.piece + m.squareFrom + m.squareTo;
                    if (m.promotion) {
                        moveStr += m.promotion.charAt(1);
                    }
                    this.chess.move(moveStr);
                    const nextState = this.getStateFromBoardStatus();
                    return nextState === null ? `ownMove` : nextState;
                }
            },
            receivedRagequit: {
                handle: () => {
                    this.caption = this.translate.instant(
                        `Your partner couldn't stand it anymore... You are the winner!`
                    );
                    return `start`;
                }
            }
        }
    };

    public constructor(
        private activeMeetingService: ActiveMeetingService,
        public dialogRef: MatDialogRef<ChessDialogComponent>,
        private notifyService: NotifyService,
        private op: OperatorService,
        private translate: TranslateService
    ) {
        this.inMeeting = !!this.activeMeetingService.meetingId;
    }

    public ngOnInit(): void {
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
        this.state = `start`;
        this.caption = this.translate.instant(`Chess`);
        this.disableBoard = true;

        // Setup all subscription for needed notify messages
        this.subscriptions = [
            this.notifyService.getMessageObservable(`chess_ACK`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedACK`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`chess_ragequit`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedRagequit`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`chess_search_request`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedSearchRequest`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`chess_search_response`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedSearchResponse`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`chess_move`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedMove`, notify);
                }
            })
        ];
    }

    public ngOnDestroy(): void {
        // send ragequit and unsubscribe all subscriptions.
        if (this.replyChannel) {
            this.notifyService.sendToChannels(`chess_ragequit`, null, this.replyChannel);
        }
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    /**
     * Returns the operators name.
     */
    public getPlayerName(): string {
        return this.op.shortName;
    }

    public resetBoard(): void {
        this.chess.load(FEN.start);
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

    /**
     * Main state machine handler. The current state handler will be called with
     * the given event. If the handler returns a state (and not null), this will be
     * the next state. The state enter method will be called.
     * @param e The event for the statemachine.
     * @param data Additional data for the handler.
     */
    public handleEvent(e: StateEvent, data?: any): void {
        let action: SMAction | null = null;
        if (this.SM[this.state] && this.SM[this.state]![e]) {
            action = this.SM[this.state]![e] as SMAction;
            const nextState = action.handle(data);
            if (nextState !== null) {
                this.state = nextState;
                if (this[`enter_${nextState}`]) {
                    this[`enter_${nextState}`]();
                }
            }
        }
    }

    // Enter state methods
    /**
     * Resets all attributes of the state machine.
     */
    public enter_start(): void {
        this.board.disableMoveInput();
        this.disableBoard = true;
        this.replyChannel = null;
        this.partnerName = null;
    }

    /**
     * Sends a search request for other players.
     */
    public enter_search(): void {
        this.caption = this.translate.instant(`Searching for players ...`);
        this.notifyService.sendToMeeting(`chess_search_request`, { name: this.getPlayerName() });
    }

    /**
     * Sends a search response for a previous request.
     * Also sets up a timeout to go back into the search state.
     */
    public enter_waitForResponse(): void {
        this.caption = this.translate.instant(`Wait for response ...`);
        this.notifyService.sendToChannels(`chess_search_response`, { name: this.getPlayerName() }, this.replyChannel!);
        if (this.waitTimout) {
            clearTimeout(<any>this.waitTimout);
        }
        this.waitTimout = <any>setTimeout(() => {
            this.handleEvent(`waitTimeout`);
        }, 5000);
    }

    /**
     * Sets the caption.
     */
    public enter_ownMove(): void {
        this.caption = this.translate.instant(`It's your turn!`);
        this.enableMoveInput();
    }

    /**
     * Sets the caption.
     */
    public enter_opponentMove(): void {
        this.caption = this.translate.instant(`It's your partners turn`);
        this.board.disableMoveInput();
    }
}
