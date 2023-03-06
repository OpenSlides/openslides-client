/**
 * An Interface extending this type will have ValueType properties for all string keys defined by the key type.
 */
export type HasProperties<KeyType extends string, ValueType> = { [property in KeyType]: ValueType };
