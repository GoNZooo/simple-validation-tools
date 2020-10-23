import {
  arrayOf,
  instanceOf,
  isBoolean,
  isInterface,
  isNumber,
  isString,
  optional,
  runChecker,
  ValidationResult,
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

export const isPerson = (value: unknown): value is Person => {
  return isInterface(value, {
    type: "Person",
    name: isString,
    age: isNumber,
    field: null,
    optionalField: optional(isString),
    arrayField: arrayOf(isNumber),
    booleanField: isBoolean,
  });
};

export const validatePerson = (value: unknown): ValidationResult<Person> => {
  return runChecker(value, isPerson);
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
  expect(validatePerson(notPersonObject).type).toEqual("Invalid");

  expect(isPerson(notEvenAStringMap)).toBe(false);
  expect(validatePerson(notEvenAStringMap).type).toBe("Invalid");
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
