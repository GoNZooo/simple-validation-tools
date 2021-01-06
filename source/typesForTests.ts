import * as svt from "./index";

export type PayloadForOne = {
  field: number;
};

export function isPayloadForOne(value: unknown): value is PayloadForOne {
  return svt.isInterface<PayloadForOne>(value, { field: svt.isNumber });
}

export function validatePayloadForOne(value: unknown): svt.ValidationResult<PayloadForOne> {
  return svt.validate<PayloadForOne>(value, { field: svt.validateNumber });
}

export type PayloadForTwo = {
  value: "StringConstant";
};

export function isPayloadForTwo(value: unknown): value is PayloadForTwo {
  return svt.isInterface<PayloadForTwo>(value, { value: "StringConstant" });
}

export function validatePayloadForTwo(value: unknown): svt.ValidationResult<PayloadForTwo> {
  return svt.validate<PayloadForTwo>(value, { value: "StringConstant" });
}

export type TaggedUnion = One | Two;

export enum TaggedUnionTag {
  One = "One",
  Two = "Two",
}

export type One = {
  type: TaggedUnionTag.One;
  data: PayloadForOne;
};

export type Two = {
  type: TaggedUnionTag.Two;
  data: PayloadForTwo;
};

export function One(data: PayloadForOne): One {
  return { type: TaggedUnionTag.One, data };
}

export function Two(data: PayloadForTwo): Two {
  return { type: TaggedUnionTag.Two, data };
}

export function isTaggedUnion(value: unknown): value is TaggedUnion {
  return [isOne, isTwo].some((typePredicate) => typePredicate(value));
}

export function isOne(value: unknown): value is One {
  return svt.isInterface<One>(value, { type: TaggedUnionTag.One, data: isPayloadForOne });
}

export function isTwo(value: unknown): value is Two {
  return svt.isInterface<Two>(value, { type: TaggedUnionTag.Two, data: isPayloadForTwo });
}

export function validateTaggedUnion(value: unknown): svt.ValidationResult<TaggedUnion> {
  return svt.validateWithTypeTag<TaggedUnion>(
    value,
    {
      [TaggedUnionTag.One]: validateOne,
      [TaggedUnionTag.Two]: validateTwo,
    },
    "type",
  );
}

export function validateOne(value: unknown): svt.ValidationResult<One> {
  return svt.validate<One>(value, { type: TaggedUnionTag.One, data: validatePayloadForOne });
}

export function validateTwo(value: unknown): svt.ValidationResult<Two> {
  return svt.validate<Two>(value, { type: TaggedUnionTag.Two, data: validatePayloadForTwo });
}

export enum BasicEnumeration {
  size1 = "SizeOne",
  size2 = "SizeTwo",
  other = "OtherSize",
}

export function isBasicEnumeration(value: unknown): value is BasicEnumeration {
  return [BasicEnumeration.size1, BasicEnumeration.size2, BasicEnumeration.other].some(
    (v) => v === value,
  );
}

export function validateBasicEnumeration(value: unknown): svt.ValidationResult<BasicEnumeration> {
  return svt.validateOneOfLiterals<BasicEnumeration>(value, [
    BasicEnumeration.size1,
    BasicEnumeration.size2,
    BasicEnumeration.other,
  ]);
}

export type UntaggedOnePayload = {
  value: "Hello";
};

export function isUntaggedOnePayload(value: unknown): value is UntaggedOnePayload {
  return svt.isInterface<UntaggedOnePayload>(value, { value: "Hello" });
}

export function validateUntaggedOnePayload(
  value: unknown,
): svt.ValidationResult<UntaggedOnePayload> {
  return svt.validate<UntaggedOnePayload>(value, { value: "Hello" });
}

export type UntaggedUnion = UntaggedOnePayload | string;

export function isUntaggedUnion(value: unknown): value is UntaggedUnion {
  return [isUntaggedOnePayload, svt.isString].some((typePredicate) => typePredicate(value));
}

export function validateUntaggedUnion(value: unknown): svt.ValidationResult<UntaggedUnion> {
  return svt.validateOneOf<UntaggedUnion>(value, [validateUntaggedOnePayload, svt.validateString]);
}
