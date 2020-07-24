declare global {
    /**
     * Enhance array with own functions
     * TODO: Remove once flatMap made its way into official JS/TS (ES 2019?)
     */
    interface Array<T> {
        flatMap(o: any): any[];
        intersect(a: T[]): T[];
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
    Object.defineProperty(Array.prototype, 'toString', {
        value: function (): string {
            let string = '';
            const iterations = Math.min(this.length, 3);

            for (let i = 0; i <= iterations; i++) {
                if (i < iterations) {
                    string += this[i];
                }

                if (i < iterations - 1) {
                    string += ', ';
                } else if (i === iterations && this.length > iterations) {
                    string += ', ...';
                }
            }
            return string;
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, 'flatMap', {
        value: function (o: any): any[] {
            const concatFunction = (x: any, y: any[]) => x.concat(y);
            const flatMapLogic = (f: any, xs: any) => xs.map(f).reduce(concatFunction, []);
            return flatMapLogic(o, this);
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, 'intersect', {
        value: function <T>(other: T[]): T[] {
            let a = this;
            let b = other;
            // indexOf to loop over shorter
            if (b.length > a.length) {
                [a, b] = [b, a];
            }
            return a.filter(e => b.indexOf(e) > -1);
        },
        enumerable: false
    });

    Object.defineProperty(Array.prototype, 'mapToObject', {
        value: function <T>(f: (item: T) => { [key: string]: any }): { [key: string]: any } {
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
}

/**
 * Adds some functions to Set.
 */
function overloadSetFunctions(): void {
    Object.defineProperty(Set.prototype, 'equals', {
        value: function <T>(other: Set<T>): boolean {
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
    Object.defineProperty(Number.prototype, 'modulo', {
        value: function (n: number): number {
            return ((this % n) + n) % n;
        },
        enumerable: false
    });
}
