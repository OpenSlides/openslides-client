type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

declare global {
    /**
     * Enhance array with own functions
     */
    interface Array<T> {
        /**
         * Compares each element of two arrays, which element is included in both. It returns a new array containing all
         * elements, that are included in the arrays.
         *
         * @param other Another array, which elements are compared to the original ones.
         */
        intersect(other: T[]): T[];
        /**
         * Compares each element of two arrays to check, which elements are included in one array but not in the other.
         * It returns a new array, containing all elements, that are included only one of them. If `symmetric` is equals
         * to `false`, only the elements, that are included in the first array and not in the second one will be
         * returned.
         *
         * @param other Another array, which elements are compared to the original ones.
         * @param symmetric If all elements from both arrays, that are included only in one of them, should be returned.
         */
        difference(other: T[], symmetric?: boolean): T[];
        /**
         * Compares two arrays element-wise for object equality to determine if the arrays contain
         * the same items. Same functionality as `difference(other, true).length > 0`, but
         * potentially faster for large arrays.
         */
        equals(other: T[]): boolean;
        /**
         * A function to "tap" a whole array and take it to manipulate it or anything else.
         *
         * @param callbackFn A function that receives the whole array and has to return nothing.
         */
        tap(callbackFn: (self: T[]) => void): T[];
        naturalSort(currentLang: string, compareBy?: KeysMatching<T, string>[]): T[];
        mapToObject<V = any>(f: (item: T, index: number) => Record<string, V>): Record<string, V>;
        /**
         * TODO: Remove this, when ES2022 is the target for our tsconfig
         *
         * @param index The index of an element in the array one expects
         */
        at(index: number): T | undefined;
    }

    interface Set<T> {
        equals(other: Set<T>): boolean;
        difference(other: Set<T>): Set<T>;
        /**
         * Adds all elements of `other` to this set.
         */
        update(other: Set<T>): void;
    }

    /**
     * Enhances the number object to calculate real modulo operations.
     * (not remainder)
     */
    interface Number {
        modulo(n: number): number;
    }
}

export function overloadJsFunctions(): void {
    overloadArrayFunctions();
    overloadSetFunctions();
    overloadModulo();
}

function overloadArrayFunctions(): void {
    Object.defineProperty(Array.prototype, `toString`, {
        value(): string {
            let string = ``;
            const iterations = Math.min(this.length, 3);

            for (let i = 0; i <= iterations; i++) {
                if (i < iterations) {
                    string += this[i];
                }

                if (i < iterations - 1) {
                    string += `, `;
                } else if (i === iterations && this.length > iterations) {
                    string += `, ...`;
                }
            }
            return string;
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `intersect`, {
        value<T>(other: T[] = []): T[] {
            if (other.length < this.length) {
                const intersect = new Set<T>(this);
                return other.filter((element: T) => intersect.has(element));
            }
            const intersect = new Set<T>(other);
            return this.filter((element: T) => intersect.has(element));
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `difference`, {
        value<T>(other: T[], symmetric = false): T[] {
            const difference = new Set<T>(this);
            const otherSet = new Set<T>(other ?? []);
            for (const entry of Array.from(otherSet)) {
                if (difference.has(entry)) {
                    difference.delete(entry);
                } else if (symmetric) {
                    difference.add(entry);
                }
            }
            return Array.from(difference);
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `equals`, {
        value<T>(other: T[]): boolean {
            return this.length == other.length && this.every((val, idx) => val === other[idx]);
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `mapToObject`, {
        value<T, U extends Record<string, V>, V = any>(f: (item: T, index: number) => U): U {
            return this.reduce((aggr: U, item: T, index: number) => {
                const res = f(item, index);
                for (const key in res) {
                    if (Object.prototype.hasOwnProperty.call(res, key)) {
                        aggr[key] = res[key];
                    }
                }
                return aggr;
            }, {});
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `naturalSort`, {
        value<T>(currentLang: string, compareBy?: KeysMatching<T, string>[]): T[] {
            const intl = new Intl.Collator(currentLang, {
                numeric: true,
                ignorePunctuation: true,
                sensitivity: `base`
            });
            return this.sort((a: T, b: T) => {
                if (!compareBy || compareBy.length === 0) {
                    return intl.compare(JSON.stringify(a), JSON.stringify(b));
                }
                for (const property of compareBy) {
                    if (a[property] === b[property] || !(a[property] || b[property])) {
                        continue;
                    }
                    if (!a[property] || !b[property]) {
                        return !a[property] ? 1 : -1;
                    }
                    const value = intl.compare(a[property] as unknown as string, b[property] as unknown as string);
                    if (value) {
                        return value;
                    }
                }
                return 0;
            });
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `tap`, {
        value<T>(callbackFn: (self: T[]) => void): T[] {
            callbackFn(this);
            return this;
        },
        enumerable: false
    });
    Object.defineProperty(Array.prototype, `at`, {
        value<T>(index: number): T | undefined {
            if (index < 0) {
                index = index.modulo(this.length);
            }
            if (index > this.length) {
                return undefined;
            }
            return this[index];
        },
        enumerable: false
    });
}

/**
 * Adds some functions to Set.
 */
function overloadSetFunctions(): void {
    Object.defineProperty(Set.prototype, `equals`, {
        value<T>(other: Set<T>): boolean {
            const difference = new Set(this);
            for (const elem of other) {
                if (difference.has(elem)) {
                    difference.delete(elem);
                } else {
                    return false;
                }
            }
            return !difference.size;
        },
        enumerable: false
    });
    Object.defineProperty(Set.prototype, `difference`, {
        value<T>(other: Set<T>): Set<T> {
            const difference = new Set<T>(this);
            for (const elem of other) {
                difference.delete(elem);
            }
            return difference;
        },
        enumerable: false
    });
    Object.defineProperty(Set.prototype, `update`, {
        value<T>(other: Set<T>): void {
            for (const elem of other) {
                this.add(elem);
            }
        },
        enumerable: false
    });
}

/**
 * Enhances the number object with a real modulo operation (not remainder).
 * TODO: Remove this, if the remainder operation is changed to modulo.
 */
function overloadModulo(): void {
    Object.defineProperty(Number.prototype, `modulo`, {
        value(n: number): number {
            return ((this % n) + n) % n;
        },
        enumerable: false
    });
}
