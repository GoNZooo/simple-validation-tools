# simple-validation-tools

I created this library because there was room in my toolbox for my own fairly simple validation
tools for TypeScript.

## What does simple mean?

In this case it means the implementation is small, has no dependencies outside of TypeScript, a
small module footprint and really only necessary abstraction such that you don't have to jump
through 15 abstractions to see what something is and how it works.

## There's a lot of boilerplate needed

Yes, I haven't done anything to reduce the need for an explicit interface, explicit type predicate
and explicit constructors for those interfaces.

## Interfaces and type predicates can differ and we get no compiler help

Use code generation:

[gotyno-hs](https://github.com/GoNZooo/gotyno-hs) provides a compiler for type definitions that
uses this library to generate all of the validators, etc.
