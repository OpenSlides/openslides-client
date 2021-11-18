const VERBOSE_TRUE_FIELDS = [`1`, `y`, `yes`, `true`, `on`];

export function toBoolean(value: string): boolean {
    return VERBOSE_TRUE_FIELDS.includes(value.toLowerCase());
}
