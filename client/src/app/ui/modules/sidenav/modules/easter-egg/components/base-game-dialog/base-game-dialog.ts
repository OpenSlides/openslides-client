import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NotifyResponse, NotifyService } from 'src/app/gateways/notify.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

/**
 * All states for the statemachine
 */
export type State = 'start' | 'search' | 'waitForResponse' | 'ownMove' | 'opponentMove';

/**
 * All events that can be handled by the statemachine.
 */
export type StateEvent =
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
export interface SMAction {
    handle: (data?: any) => State | null;
}

/**
 * The statemachine. Mapps events in states to actions.
 */
export type StateMachine = { [state in State]?: { [event in StateEvent]?: SMAction } };

/**
 * A base class for two-player game dialogs, implementing all relevant functionality to synchronize
 * the start and progress of the game via ICC.
 */
@Directive()
export abstract class BaseGameDialogComponent implements OnInit, OnDestroy {
    /**
     * Prefix to use for all ICC messages. Must be set by the subclass.
     */
    protected abstract prefix: string;

    /**
     * Contains if the user is currently within a meeting
     */
    public inMeeting = false;

    public caption: string;

    /**
     * The channel of the opponent.
     */
    protected replyChannel: string | null = null;

    /**
     * The opponents name.
     */
    public opponentName: string | null = null;

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
    public state: State = `search`;

    /**
     * This is the state machine for this game :)
     */
    public SM: StateMachine = {
        start: {
            searchClicked: {
                handle: () => {
                    this.reset();
                    return `search`;
                }
            }
        },
        search: {
            receivedSearchRequest: {
                handle: (notify: NotifyResponse<{ name: string }>) => {
                    this.replyChannel = notify.sender_channel_id;
                    this.opponentName = notify.message.name;
                    return `waitForResponse`;
                }
            },
            receivedSearchResponse: {
                handle: (notify: NotifyResponse<{ name: string }>) => {
                    this.replyChannel = notify.sender_channel_id;
                    this.opponentName = notify.message.name;
                    const [message, nextState] = this.startGame();
                    // send ACK
                    this.notifyService.sendToChannels(`${this.prefix}_ACK`, message, this.replyChannel);
                    return nextState;
                }
            }
        },
        waitForResponse: {
            receivedACK: {
                handle: (notify: NotifyResponse<{ name: string }>) => {
                    if (notify.sender_channel_id !== this.replyChannel) {
                        return null;
                    }
                    const [_, nextState] = this.startGame(notify.message);
                    return nextState;
                }
            },
            waitTimeout: {
                handle: () => `search`
            },
            receivedRagequit: {
                handle: (notify: NotifyResponse<{ name: string }>) =>
                    notify.sender_channel_id === this.replyChannel ? `search` : null
            }
        },
        ownMove: {
            executedMove: {
                handle: (move: any) => {
                    const nextState = this.executeMove(move, true);
                    this.notifyService.sendToChannels(`${this.prefix}_move`, move, this.replyChannel!);
                    return nextState;
                }
            },
            receivedRagequit: {
                handle: () => {
                    this.caption = this.translate.instant(
                        `Your opponent couldn't stand it anymore... You are the winner!`
                    );
                    return `start`;
                }
            }
        },
        opponentMove: {
            receivedMove: {
                handle: (notify: NotifyResponse<any>) => {
                    if (notify.sender_channel_id !== this.replyChannel) {
                        return null;
                    }
                    return this.executeMove(notify.message);
                }
            },
            receivedRagequit: {
                handle: () => {
                    this.caption = this.translate.instant(
                        `Your opponent couldn't stand it anymore... You are the winner!`
                    );
                    return `start`;
                }
            }
        }
    };

    private activeMeetingService = inject(ActiveMeetingService);
    protected notifyService = inject(NotifyService);
    private op = inject(OperatorService);
    protected translate = inject(TranslateService);

    public constructor(
    ) {
        this.inMeeting = !!this.activeMeetingService.meetingId;
    }

    public ngOnInit(): void {
        this.state = `start`;

        // Setup all subscription for needed notify messages
        this.subscriptions = [
            this.notifyService.getMessageObservable(`${this.prefix}_ACK`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedACK`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`${this.prefix}_ragequit`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedRagequit`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`${this.prefix}_search_request`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedSearchRequest`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`${this.prefix}_search_response`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedSearchResponse`, notify);
                }
            }),
            this.notifyService.getMessageObservable(`${this.prefix}_move`).subscribe(notify => {
                if (!notify.sendByThisUser) {
                    this.handleEvent(`receivedMove`, notify);
                }
            })
        ];
    }

    public ngOnDestroy(): void {
        // send ragequit and unsubscribe all subscriptions.
        if (this.replyChannel) {
            this.notifyService.sendToChannels(`${this.prefix}_ragequit`, null, this.replyChannel);
        }
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    protected abstract reset(): void;

    protected abstract startGame(message?: any): [any, State];

    protected abstract executeMove(move: any, ownMove?: boolean): State | null;

    /**
     * Returns the operators name.
     */
    public getPlayerName(): string {
        return this.op.shortName;
    }

    protected setTimeout(): void {
        if (this.waitTimout) {
            clearTimeout(<any>this.waitTimout);
        }
        this.waitTimout = <any>setTimeout(() => {
            this.handleEvent(`waitTimeout`);
        }, 5000);
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
        this.replyChannel = null;
        this.opponentName = null;
    }

    /**
     * Sends a search request for other players.
     */
    public enter_search(): void {
        this.caption = this.translate.instant(`Searching for players ...`);
        this.notifyService.sendToMeeting(`${this.prefix}_search_request`, { name: this.getPlayerName() });
    }

    /**
     * Sends a search response for a previous request.
     * Also sets up a timeout to go back into the search state.
     */
    public enter_waitForResponse(): void {
        this.caption = this.translate.instant(`Wait for response ...`);
        this.notifyService.sendToChannels(
            `${this.prefix}_search_response`,
            { name: this.getPlayerName() },
            this.replyChannel!
        );
        this.setTimeout();
    }

    /**
     * Sets the caption.
     */
    public enter_ownMove(): void {
        this.caption = this.translate.instant(`It's your turn!`);
    }

    /**
     * Sets the caption.
     */
    public enter_opponentMove(): void {
        this.caption = this.translate.instant(`It's your opponent's turn`);
    }
}
