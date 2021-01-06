import * as svt from "./index";
export declare type PayloadForOne = {
    field: number;
};
export declare function isPayloadForOne(value: unknown): value is PayloadForOne;
export declare function validatePayloadForOne(value: unknown): svt.ValidationResult<PayloadForOne>;
export declare type PayloadForTwo = {
    value: "StringConstant";
};
export declare function isPayloadForTwo(value: unknown): value is PayloadForTwo;
export declare function validatePayloadForTwo(value: unknown): svt.ValidationResult<PayloadForTwo>;
export declare type TaggedUnion = One | Two;
export declare enum TaggedUnionTag {
    One = "One",
    Two = "Two"
}
export declare type One = {
    type: TaggedUnionTag.One;
    data: PayloadForOne;
};
export declare type Two = {
    type: TaggedUnionTag.Two;
    data: PayloadForTwo;
};
export declare function One(data: PayloadForOne): One;
export declare function Two(data: PayloadForTwo): Two;
export declare function isTaggedUnion(value: unknown): value is TaggedUnion;
export declare function isOne(value: unknown): value is One;
export declare function isTwo(value: unknown): value is Two;
export declare function validateTaggedUnion(value: unknown): svt.ValidationResult<TaggedUnion>;
export declare function validateOne(value: unknown): svt.ValidationResult<One>;
export declare function validateTwo(value: unknown): svt.ValidationResult<Two>;
export declare enum BasicEnumeration {
    size1 = "SizeOne",
    size2 = "SizeTwo",
    other = "OtherSize"
}
export declare function isBasicEnumeration(value: unknown): value is BasicEnumeration;
export declare function validateBasicEnumeration(value: unknown): svt.ValidationResult<BasicEnumeration>;
export declare type UntaggedOnePayload = {
    value: "Hello";
};
export declare function isUntaggedOnePayload(value: unknown): value is UntaggedOnePayload;
export declare function validateUntaggedOnePayload(value: unknown): svt.ValidationResult<UntaggedOnePayload>;
export declare type UntaggedUnion = UntaggedOnePayload | string;
export declare function isUntaggedUnion(value: unknown): value is UntaggedUnion;
export declare function validateUntaggedUnion(value: unknown): svt.ValidationResult<UntaggedUnion>;
