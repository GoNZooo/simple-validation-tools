"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var console_1 = require("console");
var typesForTests_1 = require("./typesForTests");
var personInterfaceSpecification = {
    type: "Person",
    name: index_1.isString,
    age: index_1.isNumber,
    field: null,
    optionalField: index_1.optional(index_1.isString),
    arrayField: index_1.arrayOf(index_1.isNumber),
    booleanField: index_1.isBoolean,
};
var personValidationSpecification = {
    type: "Person",
    name: index_1.validateString,
    age: index_1.validateNumber,
    field: null,
    optionalField: index_1.validateOptional(index_1.validateString),
    arrayField: index_1.validateArray(index_1.validateNumber),
    booleanField: index_1.validateBoolean,
};
var isPerson = function (value) {
    return index_1.isInterface(value, personInterfaceSpecification);
};
var validatePerson = function (value) {
    return index_1.validate(value, personValidationSpecification);
};
var companyValidationSpecification = {
    name: index_1.validateString,
    ceo: validatePerson,
    employees: index_1.validateArray(validatePerson),
};
var validateCompany = function (value) {
    return index_1.validate(value, companyValidationSpecification);
};
var personData = JSON.stringify({
    type: "Person",
    name: "Rickard",
    age: 33,
    field: null,
    arrayField: [1, 2, 3],
    optionalField: "hello",
    booleanField: true,
});
var notPersonData = JSON.stringify({
    type: "Person",
    name: "Rickard",
    age: "33",
    arrayField: [1, 2, 3],
    optionalField: 42,
    booleanField: false,
});
var notEvenAStringMap = 1;
test("`isPerson` works", function () {
    var personObject = JSON.parse(personData);
    var notPersonObject = JSON.parse(notPersonData);
    expect(isPerson(personObject)).toBe(true);
    expect(isPerson(notPersonObject)).toBe(false);
    expect(validatePerson(personObject).type).toEqual("Valid");
    var invalidPersonValidateResult = validatePerson(notPersonObject);
    expect(invalidPersonValidateResult.type).toEqual("Invalid");
    if (invalidPersonValidateResult.type === "Invalid" &&
        typeof invalidPersonValidateResult.errors === "object") {
        expect(invalidPersonValidateResult.errors.age).toEqual("Expected number, got: 33 (string)");
        expect(invalidPersonValidateResult.errors.field).toEqual("Does not match literal 'null' (object)");
        expect(invalidPersonValidateResult.errors.optionalField).toEqual("is not string or null/undefined");
    }
    expect(isPerson(notEvenAStringMap)).toBe(false);
    var notAStringMapValidationResult = validatePerson(notEvenAStringMap);
    expect(notAStringMapValidationResult.type).toBe("Invalid");
    if (notAStringMapValidationResult.type === "Invalid") {
        expect(notAStringMapValidationResult.errors).toBe("is not a StringMap/object");
    }
});
test("Basic `isInstanceOf` works", function () {
    var console = new console_1.Console({ stdout: process.stdout });
    var bufferSize = 32;
    var buffer = Buffer.alloc(bufferSize);
    var isBuffer = index_1.instanceOf(Buffer);
    var isConsole = index_1.instanceOf(console_1.Console);
    expect(isConsole(console)).toBe(true);
    expect(isBuffer(buffer)).toBe(true);
    expect(isConsole(buffer)).toBe(false);
    expect(isBuffer(console)).toBe(false);
});
test("Nested validators work as expected", function () {
    var validPerson = JSON.parse(personData);
    var invalidPerson = JSON.parse(notPersonData);
    var validCompany = JSON.parse(JSON.stringify({
        name: "Testing EOOD",
        ceo: validPerson,
        employees: [validPerson, validPerson],
    }));
    var invalidCompany = JSON.parse(JSON.stringify({
        name: "Testing EOOD",
        ceo: invalidPerson,
        employees: [validPerson, invalidPerson],
    }));
    expect(validateCompany(validCompany).type).toEqual("Valid");
    var invalidResult = validateCompany(invalidCompany);
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
test("`validateOneOf` works with untagged union", function () {
    var successOne = { value: "Hello" };
    var successTwo = "Eyy!";
    var failure = false;
    var validators = [typesForTests_1.validateUntaggedOnePayload, index_1.validateString];
    var successResultOne = index_1.validateOneOf(successOne, validators);
    expect(successResultOne.type).toEqual("Valid");
    expect(typesForTests_1.validateUntaggedUnion(successOne)).toEqual(successResultOne);
    expect(typesForTests_1.isUntaggedUnion(successOne)).toBe(true);
    var successResultTwo = index_1.validateOneOf(successTwo, validators);
    expect(successResultTwo.type).toEqual("Valid");
    expect(typesForTests_1.validateUntaggedUnion(successTwo)).toEqual(successResultTwo);
    expect(typesForTests_1.isUntaggedUnion(successTwo)).toBe(true);
    var failureResult = index_1.validateOneOf(failure, validators);
    expect(failureResult.type).toEqual("Invalid");
    if (failureResult.type === "Invalid") {
        expect(failureResult.errors).toEqual("Expected to match one of `validateUntaggedOnePayload`, `validateString`, found: false (boolean)");
    }
    expect(typesForTests_1.validateUntaggedUnion(failure)).toEqual(failureResult);
    expect(typesForTests_1.isUntaggedUnion(failure)).toBe(false);
});
test("`validateConstant` works", function () {
    var success = 1;
    var failure = false;
    var validator = index_1.validateConstant(1);
    var successResult = validator(success);
    expect(successResult.type).toEqual("Valid");
    var failureResult = validator(failure);
    expect(failureResult.type).toEqual("Invalid");
    if (failureResult.type === "Invalid") {
        expect(failureResult.errors).toEqual("Expected 1 (number), got: false (boolean)");
    }
});
test("`validateOneOf` works with enumeration", function () {
    var success = typesForTests_1.BasicEnumeration.size1;
    var failure = false;
    var validators = [
        typesForTests_1.BasicEnumeration.size1,
        typesForTests_1.BasicEnumeration.size2,
        typesForTests_1.BasicEnumeration.other,
    ];
    var successResult = index_1.validateOneOfLiterals(success, validators);
    expect(successResult.type).toEqual("Valid");
    expect(typesForTests_1.validateBasicEnumeration(success)).toEqual(successResult);
    expect(typesForTests_1.isBasicEnumeration(success)).toBe(true);
    var failureResult = index_1.validateOneOfLiterals(failure, validators);
    expect(failureResult.type).toEqual("Invalid");
    if (failureResult.type === "Invalid") {
        expect(failureResult.errors).toEqual('Expected to match one of "SizeOne", "SizeTwo", "OtherSize" but found false');
    }
    expect(typesForTests_1.validateBasicEnumeration(failure)).toEqual(failureResult);
    expect(typesForTests_1.isBasicEnumeration(failure)).toBe(false);
});
test("`validateWithTypeTag` works with basic types", function () {
    var _a;
    var successOne = typesForTests_1.One({ field: 42 });
    var successTwo = typesForTests_1.Two({ value: "StringConstant" });
    var failureWithUnknownTypeTag = {
        type: "DoesNotExist",
        data: { doesNotMatter: "Hello" },
    };
    var failureWithBadPayload = {
        type: "One",
        data: { field: "string instead of number" },
    };
    var validatorSpec = (_a = {},
        _a[typesForTests_1.TaggedUnionTag.One] = typesForTests_1.validateOne,
        _a[typesForTests_1.TaggedUnionTag.Two] = typesForTests_1.validateTwo,
        _a);
    var successResultOne = index_1.validateWithTypeTag(successOne, validatorSpec, "type");
    var successResultTwo = index_1.validateWithTypeTag(successTwo, validatorSpec, "type");
    expect(successResultOne.type).toEqual("Valid");
    if (successResultOne.type === "Valid") {
        expect(typesForTests_1.isOne(successResultOne.value)).toBe(true);
        expect(typesForTests_1.isTwo(successResultOne.value)).toBe(false);
    }
    expect(successResultOne).toEqual(typesForTests_1.validateTaggedUnion(successOne));
    expect(typesForTests_1.isTaggedUnion(successOne)).toBe(true);
    expect(successResultTwo.type).toEqual("Valid");
    if (successResultTwo.type === "Valid") {
        expect(typesForTests_1.isOne(successResultTwo.value)).toBe(false);
        expect(typesForTests_1.isTwo(successResultTwo.value)).toBe(true);
    }
    expect(successResultTwo).toEqual(typesForTests_1.validateTaggedUnion(successTwo));
    expect(typesForTests_1.isTaggedUnion(successTwo)).toBe(true);
    var failureResultWithUnknownTypeTag = index_1.validateWithTypeTag(failureWithUnknownTypeTag, validatorSpec, "type");
    expect(failureResultWithUnknownTypeTag.type).toEqual("Invalid");
    if (failureResultWithUnknownTypeTag.type === "Invalid") {
        expect(failureResultWithUnknownTypeTag.errors).toEqual("Unknown type tag. Expected one of: One, Two but found 'DoesNotExist'");
    }
    expect(failureResultWithUnknownTypeTag).toEqual(typesForTests_1.validateTaggedUnion(failureWithUnknownTypeTag));
    expect(typesForTests_1.isTaggedUnion(failureWithUnknownTypeTag)).toBe(false);
    var failureResultWithBadPayload = index_1.validateWithTypeTag(failureWithBadPayload, validatorSpec, "type");
    expect(failureResultWithBadPayload.type).toEqual("Invalid");
    if (failureResultWithBadPayload.type === "Invalid") {
        expect(failureResultWithBadPayload.errors).toEqual({
            data: { field: "Expected number, got: string instead of number (string)" },
        });
    }
    expect(failureResultWithBadPayload).toEqual(typesForTests_1.validateTaggedUnion(failureWithBadPayload));
    expect(typesForTests_1.isTaggedUnion(failureWithBadPayload)).toBe(false);
});
//# sourceMappingURL=index.test.js.map