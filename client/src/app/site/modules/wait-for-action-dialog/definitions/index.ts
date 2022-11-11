import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export interface WaitForActionData {
    workerId: number;
    workerName: string;
}

export const waitForActionReason = {
    notWritten: 1,
    inactive: 2,
    slow: 3
} as const;

export type WaitForActionReasonKeys = keyof typeof waitForActionReason;

export type WaitForActionReason = typeof waitForActionReason[WaitForActionReasonKeys];

export const titleVerbose: { [key: number]: string } = {
    [waitForActionReason.notWritten]: _(`A server action could not be written to the database`),
    [waitForActionReason.inactive]: _(`A server action may have stopped working`),
    [waitForActionReason.slow]: _(`A server action seems to be slow`)
};

export const multiActionVerbose: { [key: number]: { wait: string; stop: string } } = {
    [waitForActionReason.notWritten]: {
        wait: _(`Await all unwritten actions`),
        stop: _(`Stop all unwritten actions`)
    },
    [waitForActionReason.inactive]: {
        wait: _(`Await all inactive actions`),
        stop: _(`Stop all inactive actions`)
    },
    [waitForActionReason.slow]: { wait: _(`Await all slow actions`), stop: _(`Stop all slow actions`) }
};
