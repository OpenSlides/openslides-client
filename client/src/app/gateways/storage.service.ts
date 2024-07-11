import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class StorageService {
    private noClearKeys: string[] = [];

    public constructor(private storage: StorageMap) {}

    public addNoClearKey(key: string): void {
        this.noClearKeys.push(key);
    }

    /**
     * Sets the item into the store asynchronously.
     * @param key
     * @param item
     */
    public async set(key: string, item: any): Promise<void> {
        if (item === null || item === undefined) {
            await this.remove(key); // You cannot do a setItem with null or undefined...
        } else {
            await lastValueFrom(this.storage.set(key, item));
        }
    }

    /**
     * get a value from the store. You need to subscribe to the request to retrieve the value.
     *
     * @param key The key to get the value from
     * @returns The requested value to the key
     */
    public get<T>(key: string): Promise<T | undefined> {
        return lastValueFrom(this.storage.get(key) as Observable<T>);
    }

    /**
     * Remove the key from the store.
     * @param key The key to remove the value from
     */
    public async remove(key: string): Promise<void> {
        await lastValueFrom(this.storage.delete(key));
    }

    /**
     * Clear the whole cache except for keys given in `addNoClearKey`.
     */
    public async clear(): Promise<void> {
        const savedData: { [key: string]: any } = {};
        for (const key of this.noClearKeys) {
            savedData[key] = await this.get(key);
        }
        await lastValueFrom(this.storage.clear());
        for (const key of this.noClearKeys) {
            await this.set(key, savedData[key]);
        }
    }
}
