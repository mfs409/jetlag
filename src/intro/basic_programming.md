## Basic Programming

```admonish note
If you have experience programming, feel free to skip this section.  You can
always come back to it if you find that you have questions.
```

Programming may seem like a complex topic at first.  Don't fear.  Lots of things
seem hard at first, and it's only after you've spent some time that you realize
it's not so bad.

Part of what makes programming confusing is that there are many different
*programming languages*.  They differ for all sorts of reasons.  Some languages
are easier to use than others.  Some generally lead to faster code than others.
Some make it hard to make mistakes.  Some are particularly well suited to a
specific domain.

JetLag uses the TypeScript language.  TypeScript is a *superset* of the
JavaScript programming language.  The good news is that, for the most part,
anything you learn about JavaScript also applies to TypeScript.

The reason JetLag uses TypeScript is because TypeScript does a better job of
helping programmers to find errors in their code.  Hopefully, you'll agree that
this is a good thing!

### About This Guide

This brief guide is not meant to teach you everything you need to know about
TypeScript or JavaScript.  Its goal is to give a very brief overview, so you can
feel like you have some background as you work through this book.  If you're
wondering why I didn't just give a link to a good on-line TypeScript tutorial,
there are two reasons:

1. Most on-line resources for learning TypeScript assume you already know
   JavaScript, which means they're no help if you're new to programming.
2. Most on-line resources talk about lots of things that aren't relevant to
   JetLag.  While it would be great for you to learn these things eventually,
   they're not important to this book.

With that said, there's not much about TypeScript that is different from
JavaScript.  Here are three very good references for JavaScript:

- [The MDN JavaScript Language Overview](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Language_overview)
- [The MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
- [The MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

If you read any of those pages, you'll notice that I copied from them a lot, but
translated things to TypeScript and cut out anything that wasn't relevant to
JetLag.

Before we dive in, there's one last thing I want to emphasize.  **You should not
spend too long on this chapter**.  Programming is like juggling.  You can read
all about it in books and websites, but you won't know how to do it.  The only
way to get good at it is by doing it.  As you do it, you'll discover things you
don't know, and then it's worth going to a book or website to learn more.  So
feel free to skim this chapter, or skip it.  You can always come back to it (or
look at those three links above) when you run into something you do not
understand.

### Comments

When you write code, sometimes you want to put notes in it, to explain what
you're doing.  You can use `//` to start a "comment".  A comment is a note that
doesn't affect the code.

```typescript
// Compute (n(n+1))/2, store it in z
let z = (n*(n+1))/2;
```

We can also write comments like this:

```typescript
/* Compute (n(n+1))/2, store it in z */
let z = (n*(n+1))/2;
```

It turns out that there are some common practices for when to use the one style
or the other.  You'll probably figure it out once you read some of the code in
the later chapters of this book.

### Statements

A "statement" in TypeScript is kind of like a sentence.  We'll see some
statements soon.  In TypeScript, sometimes you *must* end your statement with a
semicolon (`;`).  Sometimes, if you don't, it's OK.  This flexibility can cause
trouble, so I recommend always ending statements with semicolons.

When you write a statement, sometimes you'll indent it, to make it easier to
read.  Extra spaces at the beginning, middle, or end of a statement don't have
any meaning.  They're just there to help you.  If possible, you should turn on
"auto formatting" when you write code... it will help you notice errors.

Many statements make use of "identifiers".  Identifiers are names that you
create, to help you organize your code.  Identifiers can't have spaces in them,
and can't start with a number.  You should use descriptive names.  For example,
`number_of_enemies` is better than `x`.  Capitalization matters in TypeScript,
so be careful.  Some people like to use "camel case" (`numberOfEnemies`) instead
of "snake case" (`number_of_enemies`).  There's no real reason to pick one or
the other, but you should try to be consistent.  Also, there are some "keywords"
in TypeScript that you can't use as identifiers.  This will make sense soon, I
promise.

### Data and Types

Almost every computer program processes some kinds of information.  We call this
information "data".  In a game, data includes where characters are, what color
the walls are, how bouncy a ball is, etc.  It is useful to think of data in
terms of possible values.  *Types* define the values that a particular piece of
data can hold.  So, for example, a value whose type is `number` cannot hold the
word "JetLag".

There are seven basic in TypeScript.  In JetLag, we only use four of them.

- `number`: As you probably guessed, this holds numbers.  They can have a
  decimal point or not.  Examples include `7` and `-6.4`
- `string`: This is for storing text.  Strings can be zero or more characters,
  and they are delimited with `"`, `'`, or `` ` ``.  When you use `"` or `'`,
  the string cannot have a newline in it.
- `boolean`: This is for `true` and `false` values.
- `undefined`: This is for when something *does not have a value*.
- ~~null~~: This is like `undefined`, except it means that the absence of the
  value is *intentional*.  In JetLag, we try to only use `undefined`.
- ~~bigint~~: This is for very large numbers.  We don't use it in JetLag.
- ~~symbol~~: This is for creating unique identifiers.  We don't use it in
  JetLag.

There is another kind of type: `Object`.  Objects are pretty much everything
that isn't a primitive type.  This includes functions and arrays, which we use a
lot in JetLag, as well as dates, regular expressions, and errors.  It also
includes types that we create on our own.

#### Numbers

Numbers in TypeScript can have an optional decimal part.  Numbers that don't
have a decimal can be very precise.  Non-decimal numbers go from $-(2^{53} - 1)$
to $2^{53} - 1$.  If you need a decimal point, then things get a little weird.
Technically, you can represent decimal numbers in the range $\pm 1.79 \times
10^{308}$. But you might find that when you add a *tiny* fraction to a *huge*
number, the number doesn't change.  Fortunately, in JetLag we rarely have
numbers bigger than one million, or fractions that need more than 5 decimal
places.

By default, numbers are assumed to have a decimal.  So, for example, `3 / 2`
becomes `1.5`.  You don't have to say `3.0 / 2.0`.  But remember that decimals
can get weird.  For example, `.1 + .2` becomes `0.30000000000000004`.

Every now and then, it's easier to think of a number in base 16 (hex), instead
of base 10 (decimal).  You can use an on-line calculator to convert between
these.  If you want to specify a number in hex, you can do it like this: `0x10`
(which is `16`).

There are many math operations that are built in.  Some of the most common are:

- Addition (`+`)
- Subtraction (`-`)
- Multiplication (`*`)
- Division (`/`)
- Remainder (`%`)

There are also many "math functions", like `Math.sin()`, and "math constants"
like `Math.PI`.  Trigonometric functions like `sin` work in radians, not degrees.

You can turn a string into a number (without decimal) like this:
`parseInt("22")`, and into a number (with decimal) like this:
`parseFloat("22.2)`.  You can limit the number of decimal digits like this:
`15.555.toFixed(2)`.

If you do invalid math, you may gt a value like `NaN` or `Infinity`.

#### Strings

Strings are sequences of zero or more characters.  These characters use
"Unicode" as their format, so both of these are valid:

```typescript
"" // an empty string
console.log("Hello, world");
console.log("你好，世界！");
```

You can use single quotes (`'`) or double quotes (`"`) for your strings.
Strings behave like arrays, so if you want to extract a character from a string,
you can do this (notice that the first character is at position 0):

```typescript
"Hello"[0]; // returns "H"
```

When you compare strings, you should use `===` and `!===`.

Technically, strings and numbers are objects, which means they have functions
and properties that are accessed via the `.` notation.  We saw this in the case
of `.toFixed()` up above.  Likewise, you can get a string's length with
`.length`. When you write code in an advanced editor, like Visual Studio Code,
its code completion features will help you to find the different available
functions and properties.

You can also add strings together, like `"Hello" + " " + "World"`.  `+` will
turn non-strings into strings when they get added to a string, but this can get
hard to use correctly.  When in doubt, use the special "template" version of
strings:

```typescript
let clicks = 12;
let message = `It was pressed ${clicks} times.`
```

#### Boolean and Undefined

Booleans can only be `true` or `false`.  That seems simple, right?  But there
are many things in TypeScript that are equivalent to `false` (a.k.a., "falsey").
`undefined` is one such thing.  So is `0`, and so is `""`.  This can get tricky.
The best advice is "be careful".

There are some boolean operators, like `&&` (and), `||` (or), and `!`
(negation).

### Variables

Variables associate an identifier with a value.  To create a variable, you can
use the `let` or `const` keyword.  There is also a `var` keyword, but you should
avoid using it.  The difference between `let` and `const` is that variables
declared with `let` can be changed:

```typescript
let a = "hello world"; // `a` is a string
a = "bye";
const b = 87; // `b` is a number
b = 22; // error!
```

Every variable has a type, and those types should be respected.  So, for
example, TypeScript does not like it when you do this:

```typescript
let a = 22;
a = "hello"; // a was a number, but you're assigning a string to it
```

Whenever possible, TypeScript will infer the type for you.  But sometimes we
must be explicit:

```typescript
let a : number;
a = 55;
```

It is possible to say a variable can have a few different types.  This is
especially useful along with `undefined`, for cases where the variable may not
have a value:

```typescript
let a : number | undefined;
```

When you create a variable with `let` or `const`, it is only valid within the
block where it is declared.  Blocks are usually surrounded by curly braces
(`{}`).

```typescript
{
  let a = 12;
}
console.log(a); // Error: a is no longer valid
```

There are two more things to know about `const`.  The first is that you must
give `const` variables a value when you create them:

```typescript
const x : number; // Error
const y : number = 7; // OK
const z = 7; // Also OK
```

The second is that `const` prevents changing which value a variable is
associated with, but if that value is an object, you can still change the
object.  This will make more sense once you learn about objects:

```typescript
const obj = { name: "Me" };
obj.name = "You"; // this is OK
obj = { name: "Me" }; // Not OK... this is a new object, but `obj` is `const`
```

### Operators

Above, we saw a few operators, like assignment (`x = 7`) and indexing (`a[8]`).
TypeScript has many other operators.  We'll review some below, but before we do,
please note that operators are governed by "precedence" rules.  In US-based
elementary schools, you may recall "PEMDAS" (Please Excuse My Dear Aunt Sally)
as a way of remembering "parentheses, exponent, multiply/divide, add/subtract".
There are similar rules in TypeScript, but they are more complex.  A good rule
of thumb is "when in doubt, use parentheses".  So instead of writing `2+3*9` and
wondering why it produced `29` instead of `45`, you should write `(2+3)*9`.  The
time it takes to write two parentheses is worth the time saved later on.

With that said, there are several operators for numbers:

- `1 + 3` (addition -- produces `4`)
- `1 - 5` (subtraction -- produces `-4`)
- `2 * 8.2` (multiplication -- produces `16.4`)
- `5 / 2` (division -- produces `2.5`)
- `5 % 2` (remainder -- produces `1`)

There are also some "compound assignment" operators (`+=`, `-=`, `*=`, `/=`,
`%=`).  So, for example, `a += 7` is the same as `a = a + 7`.

Two other common operators are `++` and `--`.  Beware, though.  These have two
meanings, depending on whether they are before or after an identifier:

```typescript
let y = 7;
let x = ++y; // y becomes 8, then x gets the value 8
y = 7;
x = y++; // x gets the value 7, then y becomes 8
y = 7;
x = --y; // y becomes 6, then x gets the value 6
y = 7;
x = y--; // x gets the value 7, then y becomes 6
```

Moving on to strings, the most common operators are `[]`, for accessing a
specific character, and `+`, for concatenating strings:

```typescript
let hi = "Hello " + "JetLag"
hi[6]; // 'J'
```

If you add something to a string, and that thing is not a string, it will become
a string:

```typescript
let x = "Count to " + 6; // x == "Count to 6"
```

This can be convenient.  For example, you can turn a number into a string by
adding it to `""`.  But it can also lead to unexpected errors, so be careful!

Next, let's briefly consider comparing values.  The most common comparisons are
`<`, `>`, `<=`, and `>=`, which correspond to less-than, greater-than,
less-than-or-equal, and greater-than-or-equal.  You can check if things are
equal with `==` or `===`.  Technically, `===` is slower.  But in most cases,
`===` is what you want, so in JetLag, you use `===` unless you're sure you want
`==`.  Similarly, if you want to check if things are *not* equal, you can use
`!=` and `!==`.  Again, you should use `!==` unless you're sure you want `!=`.

You can compare booleans with `||` and `&&`, which indicate logical-or and
logical-and, respectively.  You can negate a boolean with `!`.  (Now, perhaps,
you understand the joke "`!false`... it's funny because it's `true`").

When comparing values, be careful!  They will coerce their operands.  So, for
example, `1 || false` is `true`, because `1` is considered true.  
`0`, `-0`, `NaN`, `false`, `""`, `null`, and `undefined` are all `false`.
Everything else is `true`.

One place where things get a bit tricky is when something can possibly be
undefined.  In JetLag, you'll find lots of times where we have a type like this:

```typescript
let x : string | undefined
```

TypeScript will complain if you say `let y = x.substring(1, 2)`, because `x`
might be `undefined`.  If you know for 100% sure that `x` is defined, you can
say `x!.substring(1, 2)`.  Otherwise, you might write something like this:

```typescript
let y : string | undefined; // It's initialized to `undefined`
if (x) {
    y = x.substring(1, 2);
}
```

We can also condense this.  Below, the code means the same thing: if `x` is
defined, then `y` gets the result of the substring, and otherwise it will be
undefined.

```typescript
let y = x?.substring(1, 2);
```

And if we wanted, we could even provide a sort of "otherwise" value:

```typescript
let y = (x?.substring(1, 2)) ?? "";
```

### Control Flow

Did you notice that `if` statement just above?  That was new!  It's what we call
a "conditional" statement, or a "selection".  The form is `if (clause) { stuff
}` or `if (clause) { stuff } else { other stuff }`.  That means "if the clause
is true, then do the stuff", with the second version including an "otherwise do
the other stuff" part.

If the "stuff" is just one statement, you don't technically need the curly
braces.  But you should use them anyway.  Also, remember that the indentation
doesn't mean anything.

If you have lots of things to test, you can use several `if` and `else`
statements:

```typescript
if (animalType === "dog") {
  sound = "woof";
}
else if (animalType === "cat") {
  sound = "meow"
}
else if (animalType === "cow") {
  sound = "moo"
}
else {
  sound = "";
}
```

`if` lets us do something zero or one times.  What if we want to do it a lot of
times?  We use the term "loop" or "iteration" for this purpose.  There are three
common ways we'll do loop in JetLag.  

The first style is when we know exactly how many times we want to do something.
We can use a `for` loop for that:

```typescript
for (let i = 0; i < 100; ++i) {
  console.log(i);
}
```

In the above code, you'll notice that we created a variable `i`, which is only
valid within the parentheses and curly braces that you see.  It is `0` the first
time, and `99` the last time the loop runs.

One of the most common uses of a `for` loop is to iterate through an array.
It's clunky to say "start at zero and go up to the array size", so TypeScript
has a nice alternative:

```typescript
for (let i of array) {
  console.log(i);
}
```

Each time the loop body (the part inside the curly braces) runs, it has the next
element of the array available in `i`.

There are some other loop forms in TypeScript, but the only other one you really
need to know is the `while` loop.  It's for when you don't know how many times
to run.

```typescript
let x = 1;
let limit = 100;
while (x < limit) {
  console.log(x);
  x *= 2;
}
```

The above loop will run 7 times.  It will print `1`, then `2`, then `4`, all the
way up to `64`, then stop.  If we changed `limit`, it might run more times.  Or
fewer.  But we know it won't run forever, because we keep doubling `x`.

We could also say "run forever", like this:

```typescript
while (true) {
  // something...
}
```

That's probably not a good way to write code in JetLag, but sometimes it's
necessary.  When it is, you can use `break` to break out of the code.  You can
also use `continue` to jump back to the top.

There are two more things to cover quickly.  First, if we are using an `if ..
else if .. else if` pattern, and each `if` is just checking for a single value,
we could use a `switch` instead:

```typescript
switch (request) {
  case "jump": {
    actor.jump(); 
    break;
  }
  case "crawl": {
    actor.crawl(); 
    break;
  }
  case "swim": {
    actor.swim();
    break;
  }
  default: {
    actor.doNothing();
    break;
  }
}
```

If you think you'd like to use `switch`, be sure to read more about it in the
JavaScript documentation, because it is a little trickier than it looks
(especially that `default` and `break` stuff).

Lastly, TypeScript has `try`, `catch`, and `throw` statements for dealing with
errors.  In your code, you should avoid using these.  But you should know about
them, because if you try to use JetLag incorrectly, sometimes JetLag will
`throw` an error, which will cause your game to stop.  When you see that happen,
be sure to check the "developer console" to figure out what went wrong.

### Objects

Objects are a way to group related data together.  Each datum within an object
has its own name, and the various data within an object can have different
types.  Here's an example:

```typescript
let person = {
  userName: "player123",
  age: 17,
  verified: true,
  topScores: [99, 82, 76]
}
```

You can access an object's properties using the `.` notation:

```typescript
console.log(person.userName);
person.age = 18;
person.topScores.push(55);
```

You can embed objects inside of other objects, too.

Every object is distinct:

```typescript
let person1 = {name: "player123"}
let person2 = {name: "player123"}
let same = person1 === person2; // False!
```

But two variables can refer to the same object:

```typescript
let person1 = {name: "player123"}
let person2 = person1;
person2.name = "goodplayer";
person1 === person2; // true
person1.name === "goodplayer"; // true
```

### Arrays

Arrays in TypeScript can hold zero or more values.  They are objects, which
means they have some parts (like `length`) that can be accessed via the `.`
operator.  But their values aren't accessed by name, but instead by position,
using `[]`.  Remember that positions start at `0`:

```typescript
let a = [10, 20, 30, 40, 50]
a[0]; // 10
a.length // 5
a[4]; // 50
```

The size of an array can change:

```typescript
let a = [10, 20];
a.push(30); // now a == [10, 20, 30]
let y = a.pop(); // now y == 30, a == [10, 20]
```

If you try to access something that isn't there, you'll get `undefined`.

```typescript
let a = [10, 20];
let b = a[2]; // undefined... only [0] and [1] are defined
```

### Functions

Functions are an extremely important concept.  They are a group of statements
that are grouped together in a reusable form.  Here's a simple function
declaration:

```typescript
function square(x: number): number {
  return x * x;
}
```

This code won't do anything until it is "called":

```typescript
let x = square(2); // x == 4
```

That's a lot to understand.  For starters, we say the function `square` takes an
"argument" or "parameter" that is a number.  That argument is called `x`, and is
only valid inside of the curly braces of the function.  That's the meaning of
`function square(x: number)`.

The function *returns* a number, and we've said that by the second `: number`.
It turns out that TypeScript can usually figure out the return type for you, so
we could have just written `function square(x: number) { return x*x; }` and it
would have worked.

Finally, the code of the function just does a multiplication and returns the
result.

Functions can take zero or more parameters.  And they don't need to return
anything.  In that case, you can have `return;` to return, or you can just let
the function run until the end.  Here's an example that divides a number and
returns the result as a `string`:

```typescript
function divide(x: number, y: number) {
  if (y === 0) {
    return "error";
  }
  return "" + (x/y)
}
```

There is another special kind of function, known as an *anonymous* function. The
idea here is that you can make functions "on the fly".  The syntax is `()=>{}`.
Here's an example:

```typescript
let func = (x: number) => { console.log(x) };
func(12);
```

That may seem silly.  But it becomes a very powerful concept for two reasons.
The first is that JetLag often will know that *something* needs to be done, but
won't know *what* to do.  For example, JetLag might know that a weapon collided
with an enemy.  But is it the kind of weapon that harms the enemy or not?

JetLag's code might look like this:

```typescript
let handler: (a: Actor, b: Actor) => boolean;
onCollision(actor1: Actor, actor2: Actor) {
  handler(actor1, actor2);
}
```

Then you could give it the code to run:

```typescript
handler = (enemy: Actor, weapon: Actor) => {
  if (enemy.onlyTakesFireDamage && !weapon.doesFireDamage) {
    return false;
  }
  enemy.strength -= weapon.damage;
  return true;
}
```

And now, whenever there is a collision, JetLag would know *what* to do!

These functions are even more powerful than that, though, because they can
remember (technically "close over") their state.

```typescript
let userName = "player33";
let loginMessagePrinter = () => {
  return userName + " has logged in";
}
```

In this code, the anonymous function can access the variable `userName`.  That's
pretty cool!  As you write games, you'll discover why this is a very powerful,
if confusing, idea.

Finally, note that functions can call themselves.  We call this recursion.  When
you use recursion, be careful... a function that calls itself, that calls
itself, that calls itself ... will call itself forever.  That's called "infinite
recursion", and it is not good.  When you use recursion, you probably need an
`if` to prevent the recursion from going on forever:

```typescript
function countHalvings(x: number) {
  if (x < 1) {
    return 0;
  }
  return 1 + countHalvings(x/2);
}
```

### Classes

In our discussion of objects, we overlooked an important idea: an object can
combine data **and code**!  There are many ways to do this, but we'll usually
use the `class` syntax:

```typescript
class Pet {
  name: string;
  sound: string;
  constructor(petName: string, petSound: string) {
    this.name = petName;
    this.sound = petSound;
  }
  speak() {
    console.log(`${this.name} says ${this.sound}`)
  }
}
```

The `name` and `sound` are called properties.  They're equivalent to us doing
this:

```typescript
let fluffy = {name: "fluffy", sound: "woof"};
```

But instead, we can now make our pets like this:

```typescript
let fluffy = new Pet("fluffy", "woof");
let bessie = new Pet("bessie", "moo");
```

The `constructor` is a function for initializing an object.  It is called when
we use `new` and the class name (for example `new Pet`).

Where classes get really nice is when we want to make the pet speak.  We can
just call the function `speak`, which is part of the `Pet`:

```typescript
fluffy.speak();
```

So then, we can say an object is an *instance* of a class, and an object's
function is called a *method*.  Inside of a method, the fields of the object,
like `name` are prefixed with `this.`.

If you don't want people to access fields *except through your methods*, you can
mark them as `private`.  You can also have `private` methods.  Finally, there is
an easy syntax for the case when a class's fields get initialized directly from
the arguments to the constructor:

```typescript
class Pet {
  constructor(private name: string, sound: string) {}
  speak() {
    console.log(`${this.name} says ${this.sound}`)
  }
}
```

If you think back, we saw a `substring` method on strings, and a `toFixed`
method on numbers.  So then strings and numbers are actually objects!
