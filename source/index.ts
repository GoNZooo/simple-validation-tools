export type ValidationResult<T> = Valid<T> | Invalid<T>;

export type ValidationSpecification = StringMap<Validator<unknown> | Literal>;

export type Validator<T> = (value: unknown) => ValidationResult<T>;

export type TypePredicate<T> = (value: unknown) => value is T;

export interface Valid<T> {
  type: "Valid";
  value: T;
}

export const Valid = <T>(value: T): Valid<T> => {
  return { type: "Valid", value };
};

export interface Invalid<T> {
  type: "Invalid";
  errors: ErrorMap | string;
}

export const Invalid = <T>(errors: ErrorMap | string): Invalid<T> => {
  return { type: "Invalid", errors };
};

export type ErrorMap = {
  [key: string]: string | ErrorMap;
};

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

  if (isStringMapOf(value, isUnknown)) {
    for (const key in specification) {
      if (Object.prototype.hasOwnProperty.call(specification, key)) {
        const validator = specification[key];
        const valueToCheck = value[key];
        const validateResult = runValidator(valueToCheck, validator);

        switch (validateResult.type) {
          case "Valid": {
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
      ? { type: "Invalid", errors }
      : // We know here that we should have a valid `T` as it has passed all checkers
        { type: "Valid", value: (value as unknown) as T };
  } else {
    return { type: "Invalid", errors: "is not a StringMap/object" };
  }
};

export function validateOneOf<T>(value: unknown, validators: Validator<T>[]): ValidationResult<T> {
  for (const validator of validators) {
    const result = validator(value);
    if (result.type === "Valid") {
      return result;
    }
  }

  return { type: "Invalid", errors: `Expected to match one of ${printValidators(validators)}` };
}

export function validateConstant<T>(constant: T): Validator<T> {
  return function validateConstantValue(value: unknown): ValidationResult<T> {
    return value === constant
      ? { type: "Valid", value: value as T }
      : {
          type: "Invalid",
          errors: `Expected ${constant} (${typeof constant}), got: ${value} (${typeof value})`,
        };
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

export function isObject(value: unknown): value is object {
  return typeof value === "object";
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

export function isUnknown(value: unknown): value is unknown {
  return true;
}

export function isStringMapOf<T>(
  value: unknown,
  predicate: TypePredicate<T>,
): value is StringMap<T> {
  if (isObject(value)) {
    const v = value as StringMap<unknown>;

    return Object.keys(v).every(predicate);
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

export function optional<T>(predicate: TypePredicate<T>): TypePredicate<T | null | undefined> {
  return function isOptionalOrT(value: unknown): value is T | null | undefined {
    return value === null || value === undefined || predicate(value);
  };
}

export function validateOptional<T>(validator: Validator<T>): Validator<T | null | undefined> {
  return function validateOptionalOrT(value: unknown): ValidationResult<T | null | undefined> {
    const validationResult = validator(value);

    if (validationResult.type === "Valid") {
      return Valid(value as T);
    } else if (value === null || value === undefined) {
      return Valid(value);
    } else {
      return Invalid(validationResult.errors + " or null/undefined");
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
      const errorMap = value.reduce<ErrorMap>((errors, v, index) => {
        const valueValidatorResult = validator(v);
        if (valueValidatorResult.type === "Valid") {
          return errors;
        } else {
          hasErrors = true;

          return { ...errors, [index]: valueValidatorResult.errors };
        }
      }, {});

      if (hasErrors) {
        return Invalid(errorMap);
      } else {
        return Valid(value);
      }
    } else {
      return Invalid("is not an array");
    }
  };
}

const assertUnreachable = (x: never): never => {
  throw new Error(`Reached unreachable case with value: ${x}`);
};
