declare global {
    /**
     * Enhance array with own functions
     * TODO: Remove once flatMap made its way into official JS/TS (ES 2019?)
     */
    interface Array<T> {
        flatMap<U>(callbackFn: (currentValue: T, index: number, array: T[]) => U, thisArg?: any): U;
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
         * A function to "tap" a whole array and take it to manipulate it or anything else.
         *
         * @param callbackFn A function that receives the whole array and has to return nothing.
         */
        tap(callbackFn: (self: T[]) => void): T[];
        mapToObject(f: (item: T) => { [key: string]: any }): { [key: string]: any };
    }

    interface Set<T> {
        equals(other: Set<T>): boolean;
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

    Object.defineProperty(Array.prototype, `flatMap`, {
        value(o: any): any[] {
            const concatFunction = (x: any, y: any[]) => x.concat(y);
            const flatMapLogic = (f: any, xs: any) => xs.map(f).reduce(concatFunction, []);
            return flatMapLogic(o, this);
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `intersect`, {
        value<T>(other: T[] = []): T[] {
            let a = this;
            let b = other;
            if (b.length < a.length) {
                [a, b] = [b, a];
            }
            const intersect = new Set<T>(b);
            return a.filter((element: T) => intersect.has(element));
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, `difference`, {
        value<T>(other: T[], symmetric: boolean = false): T[] {
            const difference = new Set<T>(this);
            for (const entry of other ?? []) {
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

    Object.defineProperty(Array.prototype, `mapToObject`, {
        value<T>(f: (item: T) => { [key: string]: any }): { [key: string]: any } {
            return this.reduce((aggr, item) => {
                const res = f(item);
                for (const key in res) {
                    if (res.hasOwnProperty(key)) {
                        aggr[key] = res[key];
                    }
                }
                return aggr;
            }, {});
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
