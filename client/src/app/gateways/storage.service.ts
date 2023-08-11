import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class StorageService {
    private noClearKeys: string[] = [];

    public constructor(private localStorage: LocalStorage) {}

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
            const isSuccessfullyAdded = await lastValueFrom(this.localStorage.setItem(key, item));
            if (!isSuccessfullyAdded) {
                throw new Error(`Could not set the item.`);
            }
        }
    }

    /**
     * get a value from the store. You need to subscribe to the request to retrieve the value.
     *
     * @param key The key to get the value from
     * @returns The requested value to the key
     */
    public get<T>(key: string): Promise<T | undefined> {
        return lastValueFrom(this.localStorage.getItem<T>(key) as Observable<T>);
    }

    /**
     * Remove the key from the store.
     * @param key The key to remove the value from
     */
    public async remove(key: string): Promise<void> {
        if (!(await lastValueFrom(this.localStorage.removeItem(key)))) {
            throw new Error(`Could not delete the item.`);
        }
    }

    /**
     * Clear the whole cache except for keys given in `addNoClearKey`.
     */
    public async clear(): Promise<void> {
        const savedData: { [key: string]: any } = {};
        for (const key of this.noClearKeys) {
            savedData[key] = await this.get(key);
        }
        if (!(await lastValueFrom(this.localStorage.clear()))) {
            throw new Error(`Could not clear the storage.`);
        }
        for (const key of this.noClearKeys) {
            await this.set(key, savedData[key]);
        }
    }
}
