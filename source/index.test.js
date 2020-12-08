"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var console_1 = require("console");
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
//# sourceMappingURL=index.test.js.map