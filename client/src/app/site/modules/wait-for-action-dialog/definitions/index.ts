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

export type WaitForActionReason = (typeof waitForActionReason)[WaitForActionReasonKeys];

export const titleVerbose: { [key: number]: string } = {
    [waitForActionReason.notWritten]: _(`The process will be started. Please wait!`),
    [waitForActionReason.slow]: _(`The process is still running. Please wait!`),
    [waitForActionReason.inactive]: _(`The process may have stopped running.`)
};

export const multiActionVerbose: { [key: number]: { wait: string; stop: string } } = {
    [waitForActionReason.notWritten]: {
        wait: `Await all unwritten actions`,
        stop: `Stop all unwritten actions`
    },
    [waitForActionReason.inactive]: {
        wait: `Await all inactive actions`,
        stop: `Stop all inactive actions`
    },
    [waitForActionReason.slow]: { wait: `Await all slow actions`, stop: `Stop all slow actions` }
};
