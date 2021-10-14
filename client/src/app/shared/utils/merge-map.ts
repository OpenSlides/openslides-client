export class MergeMap<V> {
    private _map: { [index: number]: V } = {};
    private _nextFreeSlot = 0;

    public set(index: number, value: V): void {
        this._map[index] = value;
        if (this._nextFreeSlot === index) {
            this.searchNextFreeSlot();
        }
    }

    public get(index: number): V {
        return this._map[index];
    }

    public getNextFreeSlot(): number {
        return this._nextFreeSlot;
    }

    public getValues(): V[] {
        return Object.values(this._map);
    }

    private searchNextFreeSlot(): void {
        do {
            this._nextFreeSlot = this._nextFreeSlot + 1;
        } while (!!this._map[this._nextFreeSlot]);
    }
}
