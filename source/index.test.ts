import {
  arrayOf,
  isBoolean,
  isInterface,
  isNumber,
  isString,
  optional,
  runChecker,
  ValidationResult,
} from "./index";

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

test("`isPerson` works", () => {
  const personObject = JSON.parse(personData);
  const notPersonObject = JSON.parse(notPersonData);

  expect(isPerson(personObject)).toBe(true);
  expect(isPerson(notPersonObject)).toBe(false);

  expect(validatePerson(personObject).type).toEqual("Valid");
  expect(validatePerson(notPersonObject).type).toEqual("Invalid");
});
