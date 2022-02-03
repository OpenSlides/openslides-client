export function isSequentialNumberHaving(instance: any): instance is HasSequentialNumber {
    if (!instance) {
        return false;
    }
    return !!instance.sequential_number && typeof instance.sequential_number === `number`;
}

export interface HasSequentialNumber {
    sequential_number: number;
}
