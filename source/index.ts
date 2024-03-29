export type ValidationResult<T> = Valid<T> | Invalid<T>;

export type ValidationSpecification = StringMap<Validator<unknown> | Literal>;

export type Validator<T> = (value: unknown) => ValidationResult<T>;

export type TypePredicate<T> = (value: unknown) => value is T;

export type ToJSON<T> = (value: T) => unknown;

export interface Valid<T> {
  type: "Valid";
  valid: true;
  value: T;
}

export const Valid = <T>(value: T): Valid<T> => {
  return { type: "Valid", value, valid: true };
};

export interface Invalid<T> {
  type: "Invalid";
  valid: false;
  errors: ErrorMap | string;
}

export const Invalid = <T>(errors: ErrorMap | string): Invalid<T> => {
  return { type: "Invalid", errors, valid: false };
};

export type ErrorMap = {
  [key: string]: string | ErrorMap;
};

const JSON_SPACING = 4;

export function runValidator<T>(
  value: unknown,
  validator: Validator<T> | Literal,
): ValidationResult<T> {
  if (isLiteral(validator)) {
    return value === validator
      ? Valid(value as T)
      : Invalid(`Does not match literal '${validator}' (${typeof validator})`);
  } else if (isValidator(validator)) {
    return validator(value);
  } else {
    return assertUnreachable(validator);
  }
}

export function isValidator(value: unknown): value is Validator<unknown> {
  return typeof value === "function";
}

export const validate = <T>(
  value: unknown,
  specification: ValidationSpecification,
): ValidationResult<T> => {
  const errors: ErrorMap = {};
  let hasErrors = false;
  const newValue: StringMap<unknown> = {};

  if (isStringMapOf(value, isUnknown)) {
    for (const key in specification) {
      if (Object.prototype.hasOwnProperty.call(specification, key)) {
        const validator = specification[key];
        const valueToCheck = value[key];
        const validateResult = runValidator(valueToCheck, validator);

        switch (validateResult.type) {
          case "Valid": {
            newValue[key] = validateResult.value;
            break;
          }

          case "Invalid": {
            hasErrors = true;
            errors[key] = validateResult.errors;

            break;
          }

          default:
            assertUnreachable(validateResult);
        }
      }
    }

    return hasErrors
      ? Invalid(errors)
      : // We know here that we should have a valid `T` as it has passed all checkers
        Valid((newValue as unknown) as T);
  } else {
    return Invalid("is not a StringMap/object");
  }
};

export function validateClass<T>(
  value: unknown,
  specification: ValidationSpecification,
  constructor: Constructor<T>,
): ValidationResult<T> {
  const result = validate<T>(value, specification);

  return result.valid ? Valid(new constructor(...Object.values(result.value))) : result;
}

export function validateClassWithTypeTag<T, TagField extends string>(
  value: unknown,
  specification: ValidationSpecification,
  tagField: TagField,
  typeTag: string,
  constructor: Constructor<T>,
): ValidationResult<T> {
  if (!hasTypeTag<TagField>(value, tagField)) {
    return Invalid(`Does not have tag field '${tagField}'`);
  }

  if (value[tagField] !== typeTag) {
    return Invalid(`Expected type tag '${typeTag}', got: '${value[tagField]}'`);
  }

  const result = validate<T>(value, specification);

  return result.valid ? Valid(new constructor(...Object.values(result.value))) : result;
}

export function validateOneOf<T>(value: unknown, validators: Validator<T>[]): ValidationResult<T> {
  for (const validator of validators) {
    const result = validator(value);
    if (result.type === "Valid") {
      return Valid(result.value);
    }
  }

  return Invalid(
    `Expected to match one of ${printValidators(validators)}, found: ${JSON.stringify(
      value,
      null,
      2,
    )} (${typeof value})`,
  );
}

export function validateOneOfLiterals<T extends Literal>(
  value: unknown,
  values: readonly T[],
): ValidationResult<T> {
  for (const v of values) {
    if (v === value) {
      return Valid(value as T);
    }
  }

  const joinedValues = values.map((v) => JSON.stringify(v, null, JSON_SPACING)).join(", ");

  return Invalid(`Expected to match one of ${joinedValues} but found ${value}`);
}

export type ValidatorSpec<T> = {
  [key: string]: Validator<T> | undefined;
};

export type HasTypeTag<T extends string> = { [P in T]: string };

export const isInterface = <T>(
  value: unknown,
  specification: InterfaceSpecification,
): value is T => {
  if (isStringMapOf(value, isUnknown)) {
    for (const key in specification) {
      if (Object.prototype.hasOwnProperty.call(specification, key)) {
        const checker = specification[key];
        const valueToCheck = value[key];

        if (!check(valueToCheck, checker)) {
          return false;
        }
      }
    }

    return true;
  } else {
    return false;
  }
};

export function hasTypeTag<T extends string>(value: unknown, tagField: T): value is HasTypeTag<T> {
  return isInterface(value, { [tagField]: isString });
}

export function validateWithTypeTag<T>(
  value: unknown,
  spec: ValidatorSpec<T>,
  tagField: string,
): ValidationResult<T> {
  if (hasTypeTag(value, tagField)) {
    const tagValue = value[tagField];
    const validator = spec[tagValue] ?? "NotFound";

    if (validator === "NotFound") {
      const validTypeTags = Object.keys(spec);

      return Invalid(
        `Unknown type tag. Expected one of: ${validTypeTags.join(", ")} but found '${tagValue}'`,
      );
    }

    return validator(value);
  } else {
    return Invalid(
      `Expecting type tag but found none in: ${JSON.stringify(value, null, JSON_SPACING)}`,
    );
  }
}

export function validateConstant<T>(constant: T): Validator<T> {
  return function validateConstantValue(value: unknown): ValidationResult<T> {
    return value === constant
      ? Valid(value as T)
      : Invalid(`Expected ${constant} (${typeof constant}), got: ${value} (${typeof value})`);
  };
}

function printValidators<T>(validators: Validator<T>[]): string {
  return validators.map((v) => "`" + v.name + "`").join(", ");
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBigInt(value: unknown): value is bigint {
  if (typeof value === "string") {
    try {
      BigInt(value);

      return true;
    } catch (e) {
      return false;
    }
  }

  return typeof value === "bigint";
}

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function validateBoolean(value: unknown): ValidationResult<boolean> {
  return typeof value === "boolean" ? Valid(value) : Invalid("is not boolean");
}

export function validateString(value: unknown): ValidationResult<string> {
  return typeof value === "string" ? Valid(value) : Invalid("is not string");
}

export function validateNumber(value: unknown): ValidationResult<number> {
  return typeof value === "number"
    ? Valid(value)
    : Invalid(`Expected number, got: ${value} (${typeof value})`);
}

export function validateBigInt(value: unknown): ValidationResult<bigint> {
  if (typeof value === "string") {
    try {
      const bigIntValue = BigInt(value);

      return Valid(bigIntValue);
    } catch (e) {
      return Invalid(`Got string but could not parse it as bigint: ${value}`);
    }
  }

  return typeof value === "bigint"
    ? Valid(value)
    : Invalid(`Expected bigint, got: ${value} (${typeof value})`);
}

export interface Constructor<T> {
  prototype: T;

  // tslint:disable-next-line:no-any
  new (...args: any[]): T;
}

export function instanceOf<T>(constructor: Constructor<T>): TypePredicate<T> {
  return (value: unknown): value is T => {
    return isInstanceOf(value, constructor);
  };
}

export function isInstanceOf<T>(value: unknown, constructor: Constructor<T>): value is T {
  return value instanceof constructor;
}

interface StringMap<T> {
  [key: string]: T;
}

export function isUnknown(_value: unknown): _value is unknown {
  return true;
}

export function isStringMapOf<T>(
  value: unknown,
  predicate: TypePredicate<T>,
): value is StringMap<T> {
  if (isObject(value)) {
    const v = value as StringMap<unknown>;

    return Object.values(v).every(predicate);
  } else {
    return false;
  }
}

export type TypeChecker<T> = Literal | TypePredicate<Literal | T>;

function isLiteral(value: unknown): value is Literal {
  switch (typeof value) {
    case "number":
    case "string":
    case "boolean":
    case "bigint":
      return true;

    default:
      return value === null || value === undefined;
  }
}

function check<T>(value: unknown, checker: TypeChecker<T>): value is T {
  if (isLiteral(checker)) {
    return value === checker;
  } else if (typeof checker === "function") {
    return checker(value);
  } else {
    throw Error(`Invalid type for checker: ${typeof checker}`);
  }
}

export type Literal = number | string | boolean | bigint | undefined | null;

export type InterfaceSpecification = StringMap<TypeChecker<unknown>>;

export function optional<T>(predicate: TypePredicate<T>): TypePredicate<T | null | undefined> {
  return function isOptionalOrT(value: unknown): value is T | null | undefined {
    return value === null || value === undefined || predicate(value);
  };
}

export function validateOptional<T>(validator: Validator<T>): Validator<T | null | undefined> {
  return function validateOptionalOrT(value: unknown): ValidationResult<T | null | undefined> {
    if (value === null || value === undefined) {
      return Valid(undefined);
    } else {
      const validationResult = validator(value);

      if (validationResult.type === "Valid") {
        return Valid(validationResult.value);
      } else {
        return Invalid(validationResult.errors + " or null/undefined");
      }
    }
  };
}

export function arrayOf<T>(predicate: TypePredicate<T>): TypePredicate<T[]> {
  return function isArrayOfT(value: unknown): value is T[] {
    return Array.isArray(value) && value.every(predicate);
  };
}

export function validateArray<T>(validator: Validator<T>): Validator<T[]> {
  return function validateArrayOfT(value: unknown): ValidationResult<T[]> {
    if (Array.isArray(value)) {
      let hasErrors = false;
      const { values: checkedValues, errors: errorMap } = value.reduce<{
        values: T[];
        errors: ErrorMap;
      }>(
        (accumulator: { values: T[]; errors: ErrorMap }, v, index) => {
          const { values, errors } = accumulator;
          const valueValidatorResult = validator(v);
          if (valueValidatorResult.type === "Valid") {
            return { ...accumulator, values: [...values, valueValidatorResult.value] };
          } else {
            hasErrors = true;

            return { values: [], errors: { ...errors, [index]: valueValidatorResult.errors } };
          }
        },
        { values: [], errors: {} },
      );

      if (hasErrors) {
        return Invalid(errorMap);
      } else {
        return Valid(checkedValues);
      }
    } else {
      return Invalid("is not an array");
    }
  };
}

export function arrayToJson<T>(tToJson: ToJSON<T>): ToJSON<T[]> {
  return function arrayTToJson(value: T[]): unknown {
    return value.map(tToJson);
  };
}

export function optionalToJson<T>(tToJson: ToJSON<T>): ToJSON<T | null | undefined> {
  return function optionalTToJson(value: T | null | undefined): unknown {
    if (value === null || value === undefined) {
      return null;
    } else {
      return tToJson(value);
    }
  };
}

export function basicToJson(value: string | number | bigint | boolean): unknown {
  return value;
}

function assertUnreachable(x: never): never {
  throw new Error(`Reached unreachable case with value: ${x}`);
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  // tslint:disable-next-line: no-invalid-this
  return this.toString();
};
