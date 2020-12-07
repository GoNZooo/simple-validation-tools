import {
  arrayOf,
  instanceOf,
  InterfaceSpecification,
  isBoolean,
  isInterface,
  isNumber,
  isString,
  optional,
  validate,
  ValidationResult,
  Validator,
} from "./index";
import { Console } from "console";

interface Person {
  type: "Person";
  name: string;
  age: number;
  field: null;
  optionalField: string | null;
  arrayField: number[];
  booleanField: boolean;
}

const personInterfaceSpecification: InterfaceSpecification = {
  type: "Person",
  name: isString,
  age: isNumber,
  field: null,
  optionalField: optional(isString),
  arrayField: arrayOf(isNumber),
  booleanField: isBoolean,
};

const isPerson = (value: unknown): value is Person => {
  return isInterface(value, personInterfaceSpecification);
};

const validatePerson: Validator<Person> = (value: unknown): ValidationResult<Person> => {
  return validate(value, personInterfaceSpecification);
};

const personData = JSON.stringify({
  type: "Person",
  name: "Rickard",
  age: 33,
  field: null,
  arrayField: [1, 2, 3],
  optionalField: "hello",
  booleanField: true,
});

const notPersonData = JSON.stringify({
  type: "Person",
  name: "Rickard",
  age: "33",
  arrayField: [1, 2, 3],
  optionalField: 42,
  booleanField: false,
});

const notEvenAStringMap = 1 as unknown;

test("`isPerson` works", () => {
  const personObject = JSON.parse(personData);
  const notPersonObject = JSON.parse(notPersonData);

  expect(isPerson(personObject)).toBe(true);
  expect(isPerson(notPersonObject)).toBe(false);

  expect(validatePerson(personObject).type).toEqual("Valid");

  const invalidPersonValidateResult = validatePerson(notPersonObject);
  expect(invalidPersonValidateResult.type).toEqual("Invalid");
  if (invalidPersonValidateResult.type === "Invalid") {
    expect(invalidPersonValidateResult.errors.age).toEqual(
      "Expected value to match type predicate `isNumber`, got: 33 (string)",
    );
    expect(invalidPersonValidateResult.errors.field).toEqual(
      "Expected value to be null, got: undefined",
    );
    expect(invalidPersonValidateResult.errors.optionalField).toEqual(
      "Expected value to match type predicate `isOptionalOrT`, got: 42 (number)",
    );
  }

  expect(isPerson(notEvenAStringMap)).toBe(false);

  const notAStringMapValidationResult = validatePerson(notEvenAStringMap);
  expect(notAStringMapValidationResult.type).toBe("Invalid");
  if (notAStringMapValidationResult.type === "Invalid") {
    expect(notAStringMapValidationResult.errors._value).toBe("is not a StringMap/object");
  }
});

test("Basic `isInstanceOf` works", () => {
  const console = new Console({ stdout: process.stdout });
  const bufferSize = 32;
  const buffer = Buffer.alloc(bufferSize);

  const isBuffer = instanceOf(Buffer);
  const isConsole = instanceOf(Console);

  expect(isConsole(console)).toBe(true);
  expect(isBuffer(buffer)).toBe(true);
  expect(isConsole(buffer)).toBe(false);
  expect(isBuffer(console)).toBe(false);
});
