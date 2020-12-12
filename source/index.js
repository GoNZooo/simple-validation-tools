"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArray = exports.arrayOf = exports.validateOptional = exports.optional = exports.isInterface = exports.isStringMapOf = exports.isUnknown = exports.isInstanceOf = exports.instanceOf = exports.validateNumber = exports.validateString = exports.validateBoolean = exports.isObject = exports.isNumber = exports.isString = exports.isBoolean = exports.validateOneOf = exports.validate = exports.isValidator = exports.runValidator = exports.Invalid = exports.Valid = void 0;
exports.Valid = function (value) {
    return { type: "Valid", value: value };
};
exports.Invalid = function (errors) {
    return { type: "Invalid", errors: errors };
};
function runValidator(value, validator) {
    if (isLiteral(validator)) {
        return value === validator
            ? exports.Valid(value)
            : exports.Invalid("Does not match literal '" + validator + "' (" + typeof validator + ")");
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
exports.validate = function (value, specification) {
    var errors = {};
    var hasErrors = false;
    if (isStringMapOf(value, isUnknown)) {
        for (var key in specification) {
            if (Object.prototype.hasOwnProperty.call(specification, key)) {
                var validator = specification[key];
                var valueToCheck = value[key];
                var validateResult = runValidator(valueToCheck, validator);
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
            ? { type: "Invalid", errors: errors }
            : // We know here that we should have a valid `T` as it has passed all checkers
                { type: "Valid", value: value };
    }
    else {
        return { type: "Invalid", errors: "is not a StringMap/object" };
    }
};
function validateOneOf(value, validators) {
    for (var _i = 0, validators_1 = validators; _i < validators_1.length; _i++) {
        var validator = validators_1[_i];
        var result = validator(value);
        if (result.type === "Valid") {
            return result;
        }
    }
    return { type: "Invalid", errors: "Expected to match one of " + printValidators(validators) };
}
exports.validateOneOf = validateOneOf;
function printValidators(validators) {
    return validators.map(function (v) { return "`" + v.name + "`"; }).join(", ");
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
function isObject(value) {
    return typeof value === "object";
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
        : exports.Invalid("Expected number, got: " + value + " (" + typeof value + ")");
}
exports.validateNumber = validateNumber;
function instanceOf(constructor) {
    return function (value) {
        return isInstanceOf(value, constructor);
    };
}
exports.instanceOf = instanceOf;
function isInstanceOf(value, constructor) {
    return value instanceof constructor;
}
exports.isInstanceOf = isInstanceOf;
function isUnknown(value) {
    return true;
}
exports.isUnknown = isUnknown;
function isStringMapOf(value, predicate) {
    if (isObject(value)) {
        var v = value;
        return Object.keys(v).every(predicate);
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
        throw Error("Invalid type for checker: " + typeof checker);
    }
}
exports.isInterface = function (value, specification) {
    if (isStringMapOf(value, isUnknown)) {
        for (var key in specification) {
            if (Object.prototype.hasOwnProperty.call(specification, key)) {
                var checker = specification[key];
                var valueToCheck = value[key];
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
function optional(predicate) {
    return function isOptionalOrT(value) {
        return value === null || value === undefined || predicate(value);
    };
}
exports.optional = optional;
function validateOptional(validator) {
    return function validateOptionalOrT(value) {
        var validationResult = validator(value);
        if (validationResult.type === "Valid") {
            return exports.Valid(value);
        }
        else if (value === null || value === undefined) {
            return exports.Valid(value);
        }
        else {
            return exports.Invalid(validationResult.errors + " or null/undefined");
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
            var hasErrors_1 = false;
            var errorMap = value.reduce(function (errors, v, index) {
                var _a;
                var valueValidatorResult = validator(v);
                if (valueValidatorResult.type === "Valid") {
                    return errors;
                }
                else {
                    hasErrors_1 = true;
                    return __assign(__assign({}, errors), (_a = {}, _a[index] = valueValidatorResult.errors, _a));
                }
            }, {});
            if (hasErrors_1) {
                return exports.Invalid(errorMap);
            }
            else {
                return exports.Valid(value);
            }
        }
        else {
            return exports.Invalid("is not an array");
        }
    };
}
exports.validateArray = validateArray;
var assertUnreachable = function (x) {
    throw new Error("Reached unreachable case with value: " + x);
};
//# sourceMappingURL=index.js.map