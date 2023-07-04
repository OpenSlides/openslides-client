import { copy, deepCopy } from './transform-functions';

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
            let mixedNuts = getMixedNuts();
            let shoppingCart = getShoppingCart(mixedNuts);
            let copied = copy(shoppingCart);

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
            let mixedNuts = getMixedNuts();
            let shoppingCart = getShoppingCart(mixedNuts);
            let headers: (keyof typeof shoppingCart)[] = [`pineapple`, `mixedNuts`];
            let copied = copy(shoppingCart, headers);

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
            let mixedNuts = getMixedNuts();
            let shoppingCart = getShoppingCart(mixedNuts);
            let copied = deepCopy(shoppingCart);

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
    });
});
