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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArray = exports.arrayOf = exports.validateOptional = exports.optional = exports.isStringMapOf = exports.isUnknown = exports.isInstanceOf = exports.instanceOf = exports.validateNumber = exports.validateString = exports.validateBoolean = exports.isObject = exports.isNumber = exports.isString = exports.isBoolean = exports.validateConstant = exports.validateWithTypeTag = exports.hasTypeTag = exports.isInterface = exports.validateOneOfLiterals = exports.validateOneOf = exports.validate = exports.isValidator = exports.runValidator = exports.Invalid = exports.Valid = void 0;
var Valid = function (value) {
    return { type: "Valid", value: value, valid: true };
};
exports.Valid = Valid;
var Invalid = function (errors) {
    return { type: "Invalid", errors: errors, valid: false };
};
exports.Invalid = Invalid;
var JSON_SPACING = 4;
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
var validate = function (value, specification) {
    var errors = {};
    var hasErrors = false;
    var newValue = {};
    if (isStringMapOf(value, isUnknown)) {
        for (var key in specification) {
            if (Object.prototype.hasOwnProperty.call(specification, key)) {
                var validator = specification[key];
                var valueToCheck = value[key];
                var validateResult = runValidator(valueToCheck, validator);
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
function validateOneOf(value, validators) {
    for (var _i = 0, validators_1 = validators; _i < validators_1.length; _i++) {
        var validator = validators_1[_i];
        var result = validator(value);
        if (result.type === "Valid") {
            return exports.Valid(result.value);
        }
    }
    return exports.Invalid("Expected to match one of " + printValidators(validators) + ", found: " + JSON.stringify(value, null, 2) + " (" + typeof value + ")");
}
exports.validateOneOf = validateOneOf;
function validateOneOfLiterals(value, values) {
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var v = values_1[_i];
        if (v === value) {
            return exports.Valid(value);
        }
    }
    var joinedValues = values.map(function (v) { return JSON.stringify(v, null, JSON_SPACING); }).join(", ");
    return exports.Invalid("Expected to match one of " + joinedValues + " but found " + value);
}
exports.validateOneOfLiterals = validateOneOfLiterals;
var isInterface = function (value, specification) {
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
exports.isInterface = isInterface;
function hasTypeTag(value, tagField) {
    var _a;
    return exports.isInterface(value, (_a = {}, _a[tagField] = isString, _a));
}
exports.hasTypeTag = hasTypeTag;
function validateWithTypeTag(value, spec, tagField) {
    var _a;
    if (hasTypeTag(value, tagField)) {
        var tagValue = value[tagField];
        var validator = (_a = spec[tagValue]) !== null && _a !== void 0 ? _a : "NotFound";
        if (validator === "NotFound") {
            var validTypeTags = Object.keys(spec);
            return exports.Invalid("Unknown type tag. Expected one of: " + validTypeTags.join(", ") + " but found '" + tagValue + "'");
        }
        return validator(value);
    }
    else {
        return exports.Invalid("Expecting type tag but found none in: " + JSON.stringify(value, null, JSON_SPACING));
    }
}
exports.validateWithTypeTag = validateWithTypeTag;
function validateConstant(constant) {
    return function validateConstantValue(value) {
        return value === constant
            ? exports.Valid(value)
            : exports.Invalid("Expected " + constant + " (" + typeof constant + "), got: " + value + " (" + typeof value + ")");
    };
}
exports.validateConstant = validateConstant;
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
            var validationResult = validator(value);
            if (validationResult.type === "Valid") {
                return exports.Valid(value);
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
            var hasErrors_1 = false;
            var _a = value.reduce(function (accumulator, v, index) {
                var _a;
                var values = accumulator.values, errors = accumulator.errors;
                var valueValidatorResult = validator(v);
                if (valueValidatorResult.type === "Valid") {
                    return __assign(__assign({}, accumulator), { values: __spreadArrays(values, [valueValidatorResult.value]) });
                }
                else {
                    hasErrors_1 = true;
                    return { values: [], errors: __assign(__assign({}, errors), (_a = {}, _a[index] = valueValidatorResult.errors, _a)) };
                }
            }, { values: [], errors: {} }), checkedValues = _a.values, errorMap = _a.errors;
            if (hasErrors_1) {
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
function assertUnreachable(x) {
    throw new Error("Reached unreachable case with value: " + x);
}
//# sourceMappingURL=index.js.map