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
  validateArray,
  validateBoolean,
  validateConstant,
  validateNumber,
  validateOneOf,
  validateOneOfLiterals,
  validateOptional,
  validateString,
  validateWithTypeTag,
  ValidationResult,
  ValidationSpecification,
  Validator,
  ValidatorSpec,
} from "./index";
import { Console } from "console";
import {
  BasicEnumeration,
  isBasicEnumeration,
  isOne,
  isTaggedUnion,
  isTwo,
  isUntaggedUnion,
  One,
  TaggedUnion,
  TaggedUnionTag,
  Two,
  UntaggedUnion,
  validateBasicEnumeration,
  validateOne,
  validateTaggedUnion,
  validateTwo,
  validateUntaggedOnePayload,
  validateUntaggedUnion,
} from "./typesForTests";

interface Company {
  name: string;
  ceo: Person;
  employees: Person[];
}

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

const personValidationSpecification: ValidationSpecification = {
  type: "Person",
  name: validateString,
  age: validateNumber,
  field: null,
  optionalField: validateOptional(validateString),
  arrayField: validateArray(validateNumber),
  booleanField: validateBoolean,
};

const isPerson = (value: unknown): value is Person => {
  return isInterface(value, personInterfaceSpecification);
};

const validatePerson: Validator<Person> = (value: unknown): ValidationResult<Person> => {
  return validate(value, personValidationSpecification);
};

const companyValidationSpecification: ValidationSpecification = {
  name: validateString,
  ceo: validatePerson,
  employees: validateArray(validatePerson),
};

const validateCompany: Validator<Company> = (value: unknown): ValidationResult<Company> => {
  return validate(value, companyValidationSpecification);
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
  if (
    invalidPersonValidateResult.type === "Invalid" &&
    typeof invalidPersonValidateResult.errors === "object"
  ) {
    expect(invalidPersonValidateResult.errors.age).toEqual("Expected number, got: 33 (string)");
    expect(invalidPersonValidateResult.errors.field).toEqual(
      "Does not match literal 'null' (object)",
    );
    expect(invalidPersonValidateResult.errors.optionalField).toEqual(
      "is not string or null/undefined",
    );
  }

  expect(isPerson(notEvenAStringMap)).toBe(false);

  const notAStringMapValidationResult = validatePerson(notEvenAStringMap);
  expect(notAStringMapValidationResult.type).toBe("Invalid");
  if (notAStringMapValidationResult.type === "Invalid") {
    expect(notAStringMapValidationResult.errors).toBe("is not a StringMap/object");
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

test("Nested validators work as expected", () => {
  const validPerson = JSON.parse(personData);
  const invalidPerson = JSON.parse(notPersonData);
  const validCompany = JSON.parse(
    JSON.stringify({
      name: "Testing EOOD",
      ceo: validPerson,
      employees: [validPerson, validPerson],
    }),
  );
  const invalidCompany = JSON.parse(
    JSON.stringify({
      name: "Testing EOOD",
      ceo: invalidPerson,
      employees: [validPerson, invalidPerson],
    }),
  );

  expect(validateCompany(validCompany).type).toEqual("Valid");

  const invalidResult = validateCompany(invalidCompany);
  expect(invalidResult.type).toEqual("Invalid");
  if (invalidResult.type === "Invalid") {
    expect(typeof invalidResult.errors).toEqual("object");
    if (typeof invalidResult.errors === "object") {
      expect(invalidResult.errors.ceo).toEqual({
        age: "Expected number, got: 33 (string)",
        field: "Does not match literal 'null' (object)",
        optionalField: "is not string or null/undefined",
      });
      expect(invalidResult.errors.employees).toEqual({
        1: {
          age: "Expected number, got: 33 (string)",
          field: "Does not match literal 'null' (object)",
          optionalField: "is not string or null/undefined",
        },
      });
    }
  }
});

test("`validateOneOf` works with untagged union", () => {
  const successOne = { value: "Hello" } as unknown;
  const successTwo = "Eyy!" as unknown;
  const failure = false as unknown;
  const validators = [validateUntaggedOnePayload, validateString];

  const successResultOne = validateOneOf<UntaggedUnion>(successOne, validators);
  expect(successResultOne.type).toEqual("Valid");
  expect(validateUntaggedUnion(successOne)).toEqual(successResultOne);
  expect(isUntaggedUnion(successOne)).toBe(true);

  const successResultTwo = validateOneOf<UntaggedUnion>(successTwo, validators);
  expect(successResultTwo.type).toEqual("Valid");
  expect(validateUntaggedUnion(successTwo)).toEqual(successResultTwo);
  expect(isUntaggedUnion(successTwo)).toBe(true);

  const failureResult = validateOneOf<UntaggedUnion>(failure, validators);
  expect(failureResult.type).toEqual("Invalid");
  if (failureResult.type === "Invalid") {
    expect(failureResult.errors).toEqual(
      "Expected to match one of `validateUntaggedOnePayload`, `validateString`, found: false (boolean)",
    );
  }
  expect(validateUntaggedUnion(failure)).toEqual(failureResult);
  expect(isUntaggedUnion(failure)).toBe(false);
});

test("`validateConstant` works", () => {
  const success = 1 as unknown;
  const failure = false as unknown;
  const validator = validateConstant<1>(1);

  const successResult = validator(success);
  expect(successResult.type).toEqual("Valid");

  const failureResult = validator(failure);
  expect(failureResult.type).toEqual("Invalid");
  if (failureResult.type === "Invalid") {
    expect(failureResult.errors).toEqual("Expected 1 (number), got: false (boolean)");
  }
});

test("`validateOneOf` works with enumeration", () => {
  const success = BasicEnumeration.size1 as unknown;
  const failure = false as unknown;
  const validators = [
    BasicEnumeration.size1,
    BasicEnumeration.size2,
    BasicEnumeration.other,
  ] as const;

  const successResult = validateOneOfLiterals(success, validators);
  expect(successResult.type).toEqual("Valid");
  expect(validateBasicEnumeration(success)).toEqual(successResult);
  expect(isBasicEnumeration(success)).toBe(true);

  const failureResult = validateOneOfLiterals(failure, validators);
  expect(failureResult.type).toEqual("Invalid");
  if (failureResult.type === "Invalid") {
    expect(failureResult.errors).toEqual(
      'Expected to match one of "SizeOne", "SizeTwo", "OtherSize" but found false',
    );
  }
  expect(validateBasicEnumeration(failure)).toEqual(failureResult);
  expect(isBasicEnumeration(failure)).toBe(false);
});

test("`validateWithTypeTag` works with basic types", () => {
  const successOne = One({ field: 42 }) as unknown;
  const successTwo = Two({ value: "StringConstant" }) as unknown;

  const failureWithUnknownTypeTag = {
    type: "DoesNotExist",
    data: { doesNotMatter: "Hello" },
  } as unknown;

  const failureWithBadPayload = {
    type: "One",
    data: { field: "string instead of number" },
  } as unknown;

  const validatorSpec: ValidatorSpec<TaggedUnion> = {
    [TaggedUnionTag.One]: validateOne,
    [TaggedUnionTag.Two]: validateTwo,
  };

  const successResultOne = validateWithTypeTag(successOne, validatorSpec, "type");
  const successResultTwo = validateWithTypeTag(successTwo, validatorSpec, "type");
  expect(successResultOne.type).toEqual("Valid");
  if (successResultOne.type === "Valid") {
    expect(isOne(successResultOne.value)).toBe(true);
    expect(isTwo(successResultOne.value)).toBe(false);
  }
  expect(successResultOne).toEqual(validateTaggedUnion(successOne));
  expect(isTaggedUnion(successOne)).toBe(true);

  expect(successResultTwo.type).toEqual("Valid");
  if (successResultTwo.type === "Valid") {
    expect(isOne(successResultTwo.value)).toBe(false);
    expect(isTwo(successResultTwo.value)).toBe(true);
  }
  expect(successResultTwo).toEqual(validateTaggedUnion(successTwo));
  expect(isTaggedUnion(successTwo)).toBe(true);

  const failureResultWithUnknownTypeTag = validateWithTypeTag(
    failureWithUnknownTypeTag,
    validatorSpec,
    "type",
  );
  expect(failureResultWithUnknownTypeTag.type).toEqual("Invalid");
  if (failureResultWithUnknownTypeTag.type === "Invalid") {
    expect(failureResultWithUnknownTypeTag.errors).toEqual(
      "Unknown type tag. Expected one of: One, Two but found 'DoesNotExist'",
    );
  }
  expect(failureResultWithUnknownTypeTag).toEqual(validateTaggedUnion(failureWithUnknownTypeTag));
  expect(isTaggedUnion(failureWithUnknownTypeTag)).toBe(false);

  const failureResultWithBadPayload = validateWithTypeTag(
    failureWithBadPayload,
    validatorSpec,
    "type",
  );
  expect(failureResultWithBadPayload.type).toEqual("Invalid");
  if (failureResultWithBadPayload.type === "Invalid") {
    expect(failureResultWithBadPayload.errors).toEqual({
      data: { field: "Expected number, got: string instead of number (string)" },
    });
  }
  expect(failureResultWithBadPayload).toEqual(validateTaggedUnion(failureWithBadPayload));
  expect(isTaggedUnion(failureWithBadPayload)).toBe(false);
});
