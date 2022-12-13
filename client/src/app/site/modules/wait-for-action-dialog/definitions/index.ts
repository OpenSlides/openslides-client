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
    [waitForActionReason.notWritten]: `A server action could not be written to the database`,
    [waitForActionReason.inactive]: `A server action may have stopped working`,
    [waitForActionReason.slow]: `A server action seems to be slow`
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
