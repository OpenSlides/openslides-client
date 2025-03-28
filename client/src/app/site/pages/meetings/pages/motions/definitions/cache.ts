export class DiffCache {
    private _cache: Record<string, any> = {};
    public get = (key: string): any => (this._cache[key] === undefined ? null : this._cache[key]);
    public put = (key: string, val: any): void => {
        this._cache[key] = val;
    };
}
