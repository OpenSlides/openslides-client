import {
    collectionFromFqid,
    collectionIdFieldFromFqfield,
    collectionIdFromFqid,
    copy,
    deepCopy,
    fqfieldFromCollectionIdField,
    fqidFromCollectionAndId,
    idFromFqid,
    isFqid
} from './transform-functions';

interface MixedNuts {
    pecans: string;
    hazelnuts: string;
    walnuts: string;
}

interface ShoppingCart {
    pineapple: number;
    chocolate: string[];
    mixedNuts: MixedNuts;
    juice: Map<string, string>;
}

function getMixedNuts(): MixedNuts {
    return {
        pecans: `100g`,
        hazelnuts: `150g`,
        walnuts: `About 5`
    };
}

function getShoppingCart(mixedNuts: MixedNuts): ShoppingCart {
    return {
        pineapple: 3,
        chocolate: [`white`, `dark`, `vegan`],
        mixedNuts: mixedNuts,
        juice: new Map<string, string>([
            [`apple`, `4 liter`],
            [`grape`, `2 bags`],
            [`orange`, `all they had`]
        ])
    };
}

function changeShoppingCart(shoppingCart: ShoppingCart): void {
    shoppingCart.mixedNuts.pecans = `50g`;
    shoppingCart.pineapple = 2;
    shoppingCart.chocolate.push(`milk`);
    shoppingCart.juice.set(`cherry`, `A veritable ocean`);
}

describe(`utils: transform-functions`, () => {
    describe(`copy function`, () => {
        it(`copy an object without pre-determined model headers`, () => {
            const mixedNuts = getMixedNuts();
            const shoppingCart = getShoppingCart(mixedNuts);
            const copied = copy(shoppingCart);

            expect(copied.pineapple).toBe(shoppingCart.pineapple);
            expect(copied.chocolate).toBe(shoppingCart.chocolate);
            expect(copied.chocolate.length).toEqual(shoppingCart.chocolate.length);
            expect(copied.mixedNuts).toBe(shoppingCart.mixedNuts);
            expect(copied.juice).toBe(shoppingCart.juice);
            expect(Object.keys(copied).length).toEqual(4);

            changeShoppingCart(shoppingCart);

            expect(copied.pineapple).not.toEqual(shoppingCart.pineapple);
            expect(copied.mixedNuts).toEqual(shoppingCart.mixedNuts);
            expect(copied.mixedNuts.pecans).toEqual(`50g`);
            expect(copied.juice).toEqual(shoppingCart.juice);
            expect(copied.chocolate).toEqual(shoppingCart.chocolate);
        });

        it(`copy an object with pre-determined model headers`, () => {
            const mixedNuts = getMixedNuts();
            const shoppingCart = getShoppingCart(mixedNuts);
            const headers: (keyof typeof shoppingCart)[] = [`pineapple`, `mixedNuts`];
            const copied = copy(shoppingCart, headers);

            expect(copied.pineapple).toBe(shoppingCart.pineapple);
            expect(copied.mixedNuts).toBe(shoppingCart.mixedNuts);
            expect(copied.chocolate).toBe(undefined);
            expect(copied.juice).toBe(undefined);
            expect(Object.keys(copied).length).toEqual(2);

            changeShoppingCart(shoppingCart);

            expect(copied.pineapple).toEqual(3);
            expect(copied.pineapple).not.toEqual(shoppingCart.pineapple);
            expect(copied.mixedNuts).toEqual(shoppingCart.mixedNuts);
            expect(copied.mixedNuts.pecans).toEqual(`50g`);
            expect(copied.chocolate).toEqual(undefined);
            expect(copied.juice).toEqual(undefined);
        });
    });

    describe(`deepCopy function`, () => {
        it(`deepCopy an object`, () => {
            const mixedNuts = getMixedNuts();
            const shoppingCart = getShoppingCart(mixedNuts);
            const copied = deepCopy(shoppingCart);

            expect(copied.pineapple).toEqual(shoppingCart.pineapple);
            expect(copied.chocolate).toEqual(shoppingCart.chocolate);
            expect(copied.mixedNuts.pecans).toEqual(shoppingCart.mixedNuts.pecans);
            expect(copied.mixedNuts.hazelnuts).toEqual(shoppingCart.mixedNuts.hazelnuts);
            expect(copied.mixedNuts.walnuts).toEqual(shoppingCart.mixedNuts.walnuts);
            expect(copied.mixedNuts).toEqual(shoppingCart.mixedNuts);
            expect(copied.juice).toEqual(shoppingCart.juice);

            expect(copied.chocolate).not.toBe(shoppingCart.chocolate);
            expect(copied.mixedNuts).not.toBe(shoppingCart.mixedNuts);
            expect(copied.juice).not.toBe(shoppingCart.juice);
            expect(Object.keys(copied).length).toEqual(4);

            changeShoppingCart(shoppingCart);

            expect(copied.pineapple).toEqual(3);
            expect(copied.pineapple).not.toEqual(shoppingCart.pineapple);
            expect(copied.mixedNuts).not.toEqual(shoppingCart.mixedNuts);
            expect(copied.chocolate).not.toEqual(shoppingCart.chocolate);
            expect(copied.juice).not.toEqual(shoppingCart.juice);
            expect(copied.mixedNuts.pecans).toEqual(`100g`);
            expect(copied.chocolate.length).toEqual(3);
        });

        it(`deepCopy falsy values`, () => {
            expect(deepCopy(null)).toEqual(null);
            expect(deepCopy(undefined)).toEqual(undefined);
            expect(deepCopy(0)).toEqual(0);
            expect(deepCopy(false)).toEqual(false);
            expect(deepCopy(``)).toEqual(``);
        });
    });

    describe(`fqidFromCollectionAndId function`, () => {
        it(`test with expected data format`, () => {
            expect(fqidFromCollectionAndId(`motion`, 42)).toBe(`motion/42`);
            expect(fqidFromCollectionAndId(`topic`, 63)).toBe(`topic/63`);
            expect(fqidFromCollectionAndId(`assignment`, 4)).toBe(`assignment/4`);
        });
    });

    describe(`fqfieldFromCollectionIdField function`, () => {
        it(`test with expected data format`, () => {
            expect(fqfieldFromCollectionIdField(`motion`, 42, `title`)).toBe(`motion/42/title`);
            expect(fqfieldFromCollectionIdField(`topic`, 63, `text`)).toBe(`topic/63/text`);
            expect(fqfieldFromCollectionIdField(`assignment`, 4, `poll_ids`)).toBe(`assignment/4/poll_ids`);
        });
    });

    describe(`collectionIdFromFqid function`, () => {
        it(`test with expected data format`, () => {
            expect(collectionIdFromFqid(`motion/42`)).toEqual([`motion`, 42]);
            expect(collectionIdFromFqid(`topic/63`)).toEqual([`topic`, 63]);
            expect(collectionIdFromFqid(`assignment/4`)).toEqual([`assignment`, 4]);
        });

        it(`test with wrong data format`, () => {
            expect(() => collectionIdFromFqid(`motion`)).toThrowError(`The given fqid "motion" is not valid.`);
            expect(() => collectionIdFromFqid(`motion/42/text`)).toThrowError(
                `The given fqid "motion/42/text" is not valid.`
            );
        });
    });

    describe(`idFromFqid function`, () => {
        it(`test with expected data format`, () => {
            expect(idFromFqid(`motion/42`)).toBe(42);
            expect(idFromFqid(`topic/63`)).toBe(63);
            expect(idFromFqid(`assignment/4`)).toBe(4);
        });

        it(`test with wrong data format`, () => {
            expect(() => idFromFqid(`motion`)).toThrowError(`The given fqid "motion" is not valid.`);
            expect(() => idFromFqid(`motion/42/text`)).toThrowError(`The given fqid "motion/42/text" is not valid.`);
        });
    });

    describe(`collectionIdFieldFromFqfield function`, () => {
        it(`test with expected data format`, () => {
            expect(collectionIdFieldFromFqfield(`motion/42/title`)).toEqual([`motion`, 42, `title`]);
            expect(collectionIdFieldFromFqfield(`topic/63/text`)).toEqual([`topic`, 63, `text`]);
            expect(collectionIdFieldFromFqfield(`assignment/4/poll_ids`)).toEqual([`assignment`, 4, `poll_ids`]);
        });

        it(`test with wrong data format`, () => {
            expect(() => collectionIdFieldFromFqfield(`motion/text`)).toThrowError(
                `The given fqfield "motion/text" is not valid.`
            );
            expect(() => collectionIdFieldFromFqfield(`motion/42/text/3`)).toThrowError(
                `The given fqfield "motion/42/text/3" is not valid.`
            );
        });
    });

    describe(`collectionFromFqid function`, () => {
        it(`test with expected data format`, () => {
            expect(collectionFromFqid(`motion/42`)).toEqual(`motion`);
            expect(collectionFromFqid(`topic/63`)).toEqual(`topic`);
            expect(collectionFromFqid(`assignment/4`)).toEqual(`assignment`);
        });

        it(`test with wrong data format`, () => {
            expect(() => collectionFromFqid(`motion`)).toThrowError(`The given fqid "motion" is not valid.`);
            expect(() => collectionFromFqid(`motion/42/text`)).toThrowError(
                `The given fqid "motion/42/text" is not valid.`
            );
        });
    });

    describe(`isFqid function`, () => {
        it(`test with expected data format`, () => {
            expect(isFqid(`motion/42`)).toBe(true);
            expect(isFqid(`topic/63`)).toBe(true);
            expect(isFqid(`assignment/4`)).toBe(true);
        });

        it(`test with wrong data format`, () => {
            expect(isFqid(`motion`)).toBe(false);
            expect(isFqid(`topic/63/text`)).toBe(false);
            expect(isFqid(`assignment/poll_ids`)).toBe(false);
        });
    });
});
