export abstract class BasePollResult<T = any> {
    public total_ballots: number;
    public invalid?: number;

    public constructor(input: Partial<T>) {
        Object.assign(this, input);
    }
}
