export class Position {
    public position: number;
    public timestamp: number;
    public information: string[];
    public user: string;

    public constructor(input: Position) {
        if (input) {
            Object.assign(this, input);
        }
    }
}
