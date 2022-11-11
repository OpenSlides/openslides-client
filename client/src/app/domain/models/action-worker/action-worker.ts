import { BaseModel } from '../base/base-model';

export enum ActionWorkerState {
    running = `running`,
    end = `end`,
    aborted = `aborted`
}

export class ActionWorker extends BaseModel {
    public static readonly COLLECTION = `action_worker`;

    public name!: string;
    public state!: ActionWorkerState;
    public created!: number;
    public timestamp!: number;
    public result?: any;

    public constructor(input?: Partial<ActionWorker>) {
        super(ActionWorker.COLLECTION, input);
    }
}

export interface ActionWorker {}
