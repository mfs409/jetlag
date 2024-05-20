TODO:
- Finish the chapter
- Split it into files
- Add a wrap-up section
- Update the intro section once this is made

## Basic Programming

Programming may seem like a complex topic at first.  Don't fear.  Lots of things
seem hard at first, and it's only after you've spent some time that you realize
it's not so bad.

In this section, we'll go over some basic programming concepts.  You don't have
to memorize anything.  This is just to help you to know what we mean when we use
certain words in the rest of this book.

### Variables

Programs often need to keep track of data.  A variable is a way of giving a name
to some data.  Here's an example:

```typescript
let x = 0;
```

In that code, we created a new variable called `x`, and gave it the value `0`.

In this book, we use a programming language called TypeScript.  TypeScript lets
us change the value of variables.  Can you guess the value of `y` when this code
runs?

```typescript
let y = 1;
y = y + 7;
```

If you guessed `8`, you're right!

### Sequences of Statements

Above, when you saw lines of code like `let x = 0` or `y = y + 7`, those are
what we call "statements".  And as you noticed, we can have several statements
in a row, that run one after the next.

For example, you may remember from an algebra class that if you want to add the
numbers $1 + 2 + 3 + 4 + \ldots + n$, you can use this formula:

$$
\frac{n\times(n+1)}{2}
$$

We can write code to compute that in a few different ways.  Here's an example
where we use a sequence of statements to compute the sum from from `1` to `100`:

```typescript
let x = 100;
let y = 100 + 1;
let z = x * y;
let z = z / 2;
```

We could also do it all at once:

```typescript
let z = (100 * (100 + 1))/2;
```

Both ways are fine.  And neither way is going to be "faster" or "slower" than
the other.  They both have one plus, one times, and one division operation.

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

### Scopes

### Statement Selection

### Statement Iteration

### Functions

### Basic Objects: Grouping Related Data

### Advanced Objects: Encapsulating Code and Data

### Wrap Up

Talk about how to use the book.  How to work on your own, and work through the
examples.
