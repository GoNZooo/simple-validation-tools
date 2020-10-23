export type ValidationResult<T> = Valid<T> | Invalid;

export type Validator<T> = (value: unknown) => ValidationResult<T>;

export type TypePredicate<T> = (value: unknown) => value is T;

export interface Valid<T> {
  type: "Valid";
  value: T;
}

export const Valid = <T>(value: T): Valid<T> => {
  return { type: "Valid", value };
};

export interface Invalid {
  type: "Invalid";
  error: string;
}

export const Invalid = (error: string): Invalid => {
  return { type: "Invalid", error };
};

export const runChecker = <T>(
  value: unknown,
  typePredicate: TypePredicate<T>,
): ValidationResult<T> => {
  return typePredicate(value)
    ? Valid(value)
    : Invalid(`value ${value} does not match predicate ${typePredicate}`);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const isObject = (value: unknown): value is object => {
  return typeof value === "object";
};

export interface Constructor<T> {
  prototype: T;

  new (): T;
}

export const instanceOf = <T>(constructor: Constructor<T>): TypePredicate<T> => {
  return (value: unknown): value is T => {
    return value instanceof constructor;
  };
};

export const isInstanceOf = <T>(value: unknown, constructor: Constructor<T>): value is T => {
  return value instanceof constructor;
};

interface StringMap<T> {
  [key: string]: T;
}

export const isUnknown = (value: unknown): value is unknown => true;

export const isStringMapOf = <T>(
  value: unknown,
  predicate: TypePredicate<T>,
): value is StringMap<T> => {
  if (isObject(value)) {
    const v = value as StringMap<unknown>;

    return Object.keys(v).every(predicate);
  } else {
    return false;
  }
};

export type TypeChecker<T> = Literal | TypePredicate<Literal | T>;

const isLiteral = (value: unknown): value is Literal => {
  switch (typeof value) {
    case "number":
    case "string":
    case "boolean":
    case "bigint":
      return true;

    default:
      return value === null || value === undefined;
  }
};

const check = <T>(value: unknown, checker: TypeChecker<T>): value is T => {
  if (isLiteral(checker)) {
    return value === checker;
  } else if (typeof checker === "function") {
    return checker(value);
  } else {
    throw Error(`Invalid type for checker: ${typeof checker}`);
  }
};

export type Literal = number | string | boolean | bigint | undefined | null;

type InterfaceSpecification<T> = StringMap<TypeChecker<Literal | T>>;

export const isInterface = <T>(
  value: unknown,
  specification: InterfaceSpecification<T>,
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

export const optional = <T>(predicate: TypePredicate<T>): TypePredicate<T | null | undefined> => {
  return (value: unknown): value is T | null | undefined => {
    return value === null || value === undefined || predicate(value);
  };
};

export const arrayOf = <T>(predicate: TypePredicate<T>): TypePredicate<T[]> => {
  return (value: unknown): value is T[] => {
    return Array.isArray(value) && value.every(predicate);
  };
};
