export class Position {
    public position: number;
    public timestamp: number;
    public information: string[];
    public user: string;

    public get date(): Date {
        return new Date(this.timestamp * 1000);
    }

    public constructor(input: Position) {
        if (input) {
            Object.assign(this, input);
        }
    }

    /**
     * Converts the date (this.now) to a time and date string.
     *
     * @param locale locale indicator, i.e 'de-DE'
     * @returns a human readable kind of time and date representation
     */
    public getLocaleString(locale: string): string {
        return this.date.toLocaleString(locale);
    }
}
