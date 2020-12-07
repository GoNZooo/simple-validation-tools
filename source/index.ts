export type ValidationResult<T> = Valid<T> | Invalid<T>;

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
  errors: ErrorMap;
}

export const Invalid = <T>(errors: ErrorMap): Invalid<T> => {
  return { type: "Invalid", errors };
};

export type ErrorMap = {
  [key: string]: string;
};

export const validate = <T>(
  value: unknown,
  specification: InterfaceSpecification,
): ValidationResult<T> => {
  const errors: ErrorMap = {};
  let hasErrors = false;

  if (isStringMapOf(value, isUnknown)) {
    for (const key in specification) {
      if (Object.prototype.hasOwnProperty.call(specification, key)) {
        const checker = specification[key];
        const valueToCheck = value[key];

        if (!check(valueToCheck, checker)) {
          hasErrors = true;
          switch (typeof checker) {
            case "bigint":
            case "string":
            case "number":
            case "boolean": {
              errors[
                key
              ] = `Expected value to match literal checker ${checker}, got: ${valueToCheck} (${typeof valueToCheck})`;
              break;
            }
            case "function": {
              errors[key] = `Expected value to match type predicate \`${
                checker.name
              }\`, got: ${valueToCheck} (${typeof valueToCheck})`;
              break;
            }
            case "undefined": {
              break;
            }

            default: {
              if (checker === null) {
                errors[key] = `Expected value to be null, got: ${valueToCheck}`;
                break;
              }

              assertUnreachable(checker);
            }
          }
        }
      }
    }

    return hasErrors
      ? { type: "Invalid", errors }
      : // We know here that we should have a valid `T` as it has passed all checkers
        { type: "Valid", value: (value as unknown) as T };
  } else {
    return { type: "Invalid", errors: { _value: "is not a StringMap/object" } };
  }
};

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

export function arrayOf<T>(predicate: TypePredicate<T>): TypePredicate<T[]> {
  return function isArrayOfT(value: unknown): value is T[] {
    return Array.isArray(value) && value.every(predicate);
  };
}

const assertUnreachable = (x: never): never => {
  throw new Error(`Reached unreachable case with value: ${x}`);
};
