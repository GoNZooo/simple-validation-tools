export declare type ValidationResult<T> = Valid<T> | Invalid<T>;
export declare type ValidationSpecification = StringMap<Validator<unknown> | Literal>;
export declare type Validator<T> = (value: unknown) => ValidationResult<T>;
export declare type TypePredicate<T> = (value: unknown) => value is T;
export declare type ToJSON<T> = (value: T) => unknown;
export interface Valid<T> {
    type: "Valid";
    valid: true;
    value: T;
}
export declare const Valid: <T>(value: T) => Valid<T>;
export interface Invalid<T> {
    type: "Invalid";
    valid: false;
    errors: ErrorMap | string;
}
export declare const Invalid: <T>(errors: ErrorMap | string) => Invalid<T>;
export declare type ErrorMap = {
    [key: string]: string | ErrorMap;
};
export declare function runValidator<T>(value: unknown, validator: Validator<T> | Literal): ValidationResult<T>;
export declare function isValidator(value: unknown): value is Validator<unknown>;
export declare const validate: <T>(value: unknown, specification: ValidationSpecification) => ValidationResult<T>;
export declare function validateClass<T>(value: unknown, specification: ValidationSpecification, constructor: Constructor<T>): ValidationResult<T>;
export declare function validateClassWithTypeTag<T, TagField extends string>(value: unknown, specification: ValidationSpecification, tagField: TagField, typeTag: string, constructor: Constructor<T>): ValidationResult<T>;
export declare function validateOneOf<T>(value: unknown, validators: Validator<T>[]): ValidationResult<T>;
export declare function validateOneOfLiterals<T extends Literal>(value: unknown, values: readonly T[]): ValidationResult<T>;
export declare type ValidatorSpec<T> = {
    [key: string]: Validator<T> | undefined;
};
export declare type HasTypeTag<T extends string> = {
    [P in T]: string;
};
export declare const isInterface: <T>(value: unknown, specification: InterfaceSpecification) => value is T;
export declare function hasTypeTag<T extends string>(value: unknown, tagField: T): value is HasTypeTag<T>;
export declare function validateWithTypeTag<T>(value: unknown, spec: ValidatorSpec<T>, tagField: string): ValidationResult<T>;
export declare function validateConstant<T>(constant: T): Validator<T>;
export declare function isBoolean(value: unknown): value is boolean;
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isBigInt(value: unknown): value is bigint;
export declare function isObject(value: unknown): value is object;
export declare function validateBoolean(value: unknown): ValidationResult<boolean>;
export declare function validateString(value: unknown): ValidationResult<string>;
export declare function validateNumber(value: unknown): ValidationResult<number>;
export declare function validateBigInt(value: unknown): ValidationResult<bigint>;
export interface Constructor<T> {
    prototype: T;
    new (...args: any[]): T;
}
export declare function instanceOf<T>(constructor: Constructor<T>): TypePredicate<T>;
export declare function isInstanceOf<T>(value: unknown, constructor: Constructor<T>): value is T;
interface StringMap<T> {
    [key: string]: T;
}
export declare function isUnknown(_value: unknown): _value is unknown;
export declare function isStringMapOf<T>(value: unknown, predicate: TypePredicate<T>): value is StringMap<T>;
export declare type TypeChecker<T> = Literal | TypePredicate<Literal | T>;
export declare type Literal = number | string | boolean | bigint | undefined | null;
export declare type InterfaceSpecification = StringMap<TypeChecker<unknown>>;
export declare function optional<T>(predicate: TypePredicate<T>): TypePredicate<T | null | undefined>;
export declare function validateOptional<T>(validator: Validator<T>): Validator<T | null | undefined>;
export declare function arrayOf<T>(predicate: TypePredicate<T>): TypePredicate<T[]>;
export declare function validateArray<T>(validator: Validator<T>): Validator<T[]>;
export declare function arrayToJson<T>(tToJson: ToJSON<T>): ToJSON<T[]>;
export declare function optionalToJson<T>(tToJson: ToJSON<T>): ToJSON<T | null | undefined>;
export declare function basicToJson(value: string | number | bigint | boolean): unknown;
export {};
