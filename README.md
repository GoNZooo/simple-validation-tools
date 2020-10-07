# simple-validation-tools

## Why?

There was room in my toolbox for my own fairly simple validation tools for TypeScript.

## What does simple mean?

In this case it means the implementation is small, has no dependencies outside of TypeScript, a
small module footprint and really only necessary abstraction such that you don't have to jump
through 15 abstractions to see what something is and how it works.

## There's a lot of boilerplate needed

Yes, I haven't done anything to reduce the need for an explicit interface, explicit type predicate
and explicit constructors for those interfaces.

## Interfaces and type predicates can differ and we get no compiler help

Yeah, I don't know how to make this enforce consistency without deriving one from the other. My
personal plan is to perhaps use code generation from a central specification to generate these, but
I wouldn't recommend it as a general solution. I'm sure there are compiler extensions one can use
to define one thing and get all the necessary components out of it.

## The error reporting is pretty bare/shoddy

I'll try to sort it out in the future.
