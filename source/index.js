"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicToJson = exports.optionalToJson = exports.arrayToJson = exports.validateArray = exports.arrayOf = exports.validateOptional = exports.optional = exports.isStringMapOf = exports.isUnknown = exports.isInstanceOf = exports.instanceOf = exports.validateBigInt = exports.validateNumber = exports.validateString = exports.validateBoolean = exports.isObject = exports.isBigInt = exports.isNumber = exports.isString = exports.isBoolean = exports.validateConstant = exports.validateWithTypeTag = exports.hasTypeTag = exports.isInterface = exports.validateOneOfLiterals = exports.validateOneOf = exports.validateClassWithTypeTag = exports.validateClass = exports.validate = exports.isValidator = exports.runValidator = exports.Invalid = exports.Valid = void 0;
const Valid = (value) => {
    return { type: "Valid", value, valid: true };
};
exports.Valid = Valid;
const Invalid = (errors) => {
    return { type: "Invalid", errors, valid: false };
};
exports.Invalid = Invalid;
const JSON_SPACING = 4;
function runValidator(value, validator) {
    if (isLiteral(validator)) {
        return value === validator
            ? exports.Valid(value)
            : exports.Invalid(`Does not match literal '${validator}' (${typeof validator})`);
    }
    else if (isValidator(validator)) {
        return validator(value);
    }
    else {
        return assertUnreachable(validator);
    }
}
exports.runValidator = runValidator;
function isValidator(value) {
    return typeof value === "function";
}
exports.isValidator = isValidator;
const validate = (value, specification) => {
    const errors = {};
    let hasErrors = false;
    const newValue = {};
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
            ? exports.Invalid(errors)
            : // We know here that we should have a valid `T` as it has passed all checkers
                exports.Valid(newValue);
    }
    else {
        return exports.Invalid("is not a StringMap/object");
    }
};
exports.validate = validate;
function validateClass(value, specification, constructor) {
    const result = exports.validate(value, specification);
    return result.valid ? exports.Valid(new constructor(...Object.values(result.value))) : result;
}
exports.validateClass = validateClass;
function validateClassWithTypeTag(value, specification, tagField, typeTag, constructor) {
    if (!hasTypeTag(value, tagField)) {
        return exports.Invalid(`Does not have tag field '${tagField}'`);
    }
    if (value[tagField] !== typeTag) {
        return exports.Invalid(`Expected type tag '${typeTag}', got: '${value[tagField]}'`);
    }
    const result = exports.validate(value, specification);
    return result.valid ? exports.Valid(new constructor(...Object.values(result.value))) : result;
}
exports.validateClassWithTypeTag = validateClassWithTypeTag;
function validateOneOf(value, validators) {
    for (const validator of validators) {
        const result = validator(value);
        if (result.type === "Valid") {
            return exports.Valid(result.value);
        }
    }
    return exports.Invalid(`Expected to match one of ${printValidators(validators)}, found: ${JSON.stringify(value, null, 2)} (${typeof value})`);
}
exports.validateOneOf = validateOneOf;
function validateOneOfLiterals(value, values) {
    for (const v of values) {
        if (v === value) {
            return exports.Valid(value);
        }
    }
    const joinedValues = values.map((v) => JSON.stringify(v, null, JSON_SPACING)).join(", ");
    return exports.Invalid(`Expected to match one of ${joinedValues} but found ${value}`);
}
exports.validateOneOfLiterals = validateOneOfLiterals;
const isInterface = (value, specification) => {
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
    }
    else {
        return false;
    }
};
exports.isInterface = isInterface;
function hasTypeTag(value, tagField) {
    return exports.isInterface(value, { [tagField]: isString });
}
exports.hasTypeTag = hasTypeTag;
function validateWithTypeTag(value, spec, tagField) {
    if (hasTypeTag(value, tagField)) {
        const tagValue = value[tagField];
        const validator = spec[tagValue] ?? "NotFound";
        if (validator === "NotFound") {
            const validTypeTags = Object.keys(spec);
            return exports.Invalid(`Unknown type tag. Expected one of: ${validTypeTags.join(", ")} but found '${tagValue}'`);
        }
        return validator(value);
    }
    else {
        return exports.Invalid(`Expecting type tag but found none in: ${JSON.stringify(value, null, JSON_SPACING)}`);
    }
}
exports.validateWithTypeTag = validateWithTypeTag;
function validateConstant(constant) {
    return function validateConstantValue(value) {
        return value === constant
            ? exports.Valid(value)
            : exports.Invalid(`Expected ${constant} (${typeof constant}), got: ${value} (${typeof value})`);
    };
}
exports.validateConstant = validateConstant;
function printValidators(validators) {
    return validators.map((v) => "`" + v.name + "`").join(", ");
}
function isBoolean(value) {
    return typeof value === "boolean";
}
exports.isBoolean = isBoolean;
function isString(value) {
    return typeof value === "string";
}
exports.isString = isString;
function isNumber(value) {
    return typeof value === "number";
}
exports.isNumber = isNumber;
function isBigInt(value) {
    if (typeof value === "string") {
        try {
            BigInt(value);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    return typeof value === "bigint";
}
exports.isBigInt = isBigInt;
function isObject(value) {
    return typeof value === "object" && value !== null;
}
exports.isObject = isObject;
function validateBoolean(value) {
    return typeof value === "boolean" ? exports.Valid(value) : exports.Invalid("is not boolean");
}
exports.validateBoolean = validateBoolean;
function validateString(value) {
    return typeof value === "string" ? exports.Valid(value) : exports.Invalid("is not string");
}
exports.validateString = validateString;
function validateNumber(value) {
    return typeof value === "number"
        ? exports.Valid(value)
        : exports.Invalid(`Expected number, got: ${value} (${typeof value})`);
}
exports.validateNumber = validateNumber;
function validateBigInt(value) {
    if (typeof value === "string") {
        try {
            const bigIntValue = BigInt(value);
            return exports.Valid(bigIntValue);
        }
        catch (e) {
            return exports.Invalid(`Got string but could not parse it as bigint: ${value}`);
        }
    }
    return typeof value === "bigint"
        ? exports.Valid(value)
        : exports.Invalid(`Expected bigint, got: ${value} (${typeof value})`);
}
exports.validateBigInt = validateBigInt;
function instanceOf(constructor) {
    return (value) => {
        return isInstanceOf(value, constructor);
    };
}
exports.instanceOf = instanceOf;
function isInstanceOf(value, constructor) {
    return value instanceof constructor;
}
exports.isInstanceOf = isInstanceOf;
function isUnknown(_value) {
    return true;
}
exports.isUnknown = isUnknown;
function isStringMapOf(value, predicate) {
    if (isObject(value)) {
        const v = value;
        return Object.values(v).every(predicate);
    }
    else {
        return false;
    }
}
exports.isStringMapOf = isStringMapOf;
function isLiteral(value) {
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
function check(value, checker) {
    if (isLiteral(checker)) {
        return value === checker;
    }
    else if (typeof checker === "function") {
        return checker(value);
    }
    else {
        throw Error(`Invalid type for checker: ${typeof checker}`);
    }
}
function optional(predicate) {
    return function isOptionalOrT(value) {
        return value === null || value === undefined || predicate(value);
    };
}
exports.optional = optional;
function validateOptional(validator) {
    return function validateOptionalOrT(value) {
        if (value === null || value === undefined) {
            return exports.Valid(value);
        }
        else {
            const validationResult = validator(value);
            if (validationResult.type === "Valid") {
                return exports.Valid(validationResult.value);
            }
            else {
                return exports.Invalid(validationResult.errors + " or null/undefined");
            }
        }
    };
}
exports.validateOptional = validateOptional;
function arrayOf(predicate) {
    return function isArrayOfT(value) {
        return Array.isArray(value) && value.every(predicate);
    };
}
exports.arrayOf = arrayOf;
function validateArray(validator) {
    return function validateArrayOfT(value) {
        if (Array.isArray(value)) {
            let hasErrors = false;
            const { values: checkedValues, errors: errorMap } = value.reduce((accumulator, v, index) => {
                const { values, errors } = accumulator;
                const valueValidatorResult = validator(v);
                if (valueValidatorResult.type === "Valid") {
                    return { ...accumulator, values: [...values, valueValidatorResult.value] };
                }
                else {
                    hasErrors = true;
                    return { values: [], errors: { ...errors, [index]: valueValidatorResult.errors } };
                }
            }, { values: [], errors: {} });
            if (hasErrors) {
                return exports.Invalid(errorMap);
            }
            else {
                return exports.Valid(checkedValues);
            }
        }
        else {
            return exports.Invalid("is not an array");
        }
    };
}
exports.validateArray = validateArray;
function arrayToJson(tToJson) {
    return function arrayTToJson(value) {
        return value.map(tToJson);
    };
}
exports.arrayToJson = arrayToJson;
function optionalToJson(tToJson) {
    return function optionalTToJson(value) {
        if (value === null || value === undefined) {
            return null;
        }
        else {
            return tToJson(value);
        }
    };
}
exports.optionalToJson = optionalToJson;
function basicToJson(value) {
    return value;
}
exports.basicToJson = basicToJson;
function assertUnreachable(x) {
    throw new Error(`Reached unreachable case with value: ${x}`);
}
// @ts-ignore
BigInt.prototype.toJSON = function () {
    // tslint:disable-next-line: no-invalid-this
    return this.toString();
};
//# sourceMappingURL=index.js.map