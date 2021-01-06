"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUntaggedUnion = exports.isUntaggedUnion = exports.validateUntaggedOnePayload = exports.isUntaggedOnePayload = exports.validateBasicEnumeration = exports.isBasicEnumeration = exports.BasicEnumeration = exports.validateTwo = exports.validateOne = exports.validateTaggedUnion = exports.isTwo = exports.isOne = exports.isTaggedUnion = exports.Two = exports.One = exports.TaggedUnionTag = exports.validatePayloadForTwo = exports.isPayloadForTwo = exports.validatePayloadForOne = exports.isPayloadForOne = void 0;
var svt = require("./index");
function isPayloadForOne(value) {
    return svt.isInterface(value, { field: svt.isNumber });
}
exports.isPayloadForOne = isPayloadForOne;
function validatePayloadForOne(value) {
    return svt.validate(value, { field: svt.validateNumber });
}
exports.validatePayloadForOne = validatePayloadForOne;
function isPayloadForTwo(value) {
    return svt.isInterface(value, { value: "StringConstant" });
}
exports.isPayloadForTwo = isPayloadForTwo;
function validatePayloadForTwo(value) {
    return svt.validate(value, { value: "StringConstant" });
}
exports.validatePayloadForTwo = validatePayloadForTwo;
var TaggedUnionTag;
(function (TaggedUnionTag) {
    TaggedUnionTag["One"] = "One";
    TaggedUnionTag["Two"] = "Two";
})(TaggedUnionTag = exports.TaggedUnionTag || (exports.TaggedUnionTag = {}));
function One(data) {
    return { type: TaggedUnionTag.One, data: data };
}
exports.One = One;
function Two(data) {
    return { type: TaggedUnionTag.Two, data: data };
}
exports.Two = Two;
function isTaggedUnion(value) {
    return [isOne, isTwo].some(function (typePredicate) { return typePredicate(value); });
}
exports.isTaggedUnion = isTaggedUnion;
function isOne(value) {
    return svt.isInterface(value, { type: TaggedUnionTag.One, data: isPayloadForOne });
}
exports.isOne = isOne;
function isTwo(value) {
    return svt.isInterface(value, { type: TaggedUnionTag.Two, data: isPayloadForTwo });
}
exports.isTwo = isTwo;
function validateTaggedUnion(value) {
    var _a;
    return svt.validateWithTypeTag(value, (_a = {},
        _a[TaggedUnionTag.One] = validateOne,
        _a[TaggedUnionTag.Two] = validateTwo,
        _a), "type");
}
exports.validateTaggedUnion = validateTaggedUnion;
function validateOne(value) {
    return svt.validate(value, { type: TaggedUnionTag.One, data: validatePayloadForOne });
}
exports.validateOne = validateOne;
function validateTwo(value) {
    return svt.validate(value, { type: TaggedUnionTag.Two, data: validatePayloadForTwo });
}
exports.validateTwo = validateTwo;
var BasicEnumeration;
(function (BasicEnumeration) {
    BasicEnumeration["size1"] = "SizeOne";
    BasicEnumeration["size2"] = "SizeTwo";
    BasicEnumeration["other"] = "OtherSize";
})(BasicEnumeration = exports.BasicEnumeration || (exports.BasicEnumeration = {}));
function isBasicEnumeration(value) {
    return [BasicEnumeration.size1, BasicEnumeration.size2, BasicEnumeration.other].some(function (v) { return v === value; });
}
exports.isBasicEnumeration = isBasicEnumeration;
function validateBasicEnumeration(value) {
    return svt.validateOneOfLiterals(value, [
        BasicEnumeration.size1,
        BasicEnumeration.size2,
        BasicEnumeration.other,
    ]);
}
exports.validateBasicEnumeration = validateBasicEnumeration;
function isUntaggedOnePayload(value) {
    return svt.isInterface(value, { value: "Hello" });
}
exports.isUntaggedOnePayload = isUntaggedOnePayload;
function validateUntaggedOnePayload(value) {
    return svt.validate(value, { value: "Hello" });
}
exports.validateUntaggedOnePayload = validateUntaggedOnePayload;
function isUntaggedUnion(value) {
    return [isUntaggedOnePayload, svt.isString].some(function (typePredicate) { return typePredicate(value); });
}
exports.isUntaggedUnion = isUntaggedUnion;
function validateUntaggedUnion(value) {
    return svt.validateOneOf(value, [validateUntaggedOnePayload, svt.validateString]);
}
exports.validateUntaggedUnion = validateUntaggedUnion;
//# sourceMappingURL=typesForTests.js.map