# script
# mission statement
Today we're going to create a parser for Lisp Programming language

# Intro to Lisp
1. Lisp is symbolic processing language invented in 1958. 

2. It's the second oldest language that is still used today. 

3. Fortran was the first.

4. If you've heard of Common Lisp, Clojure, Racket, or Scheme, Lisp is the ancestor of all of them

5. Lisp gets its name from LISt Processor. 

6. There are two main components in Lisp.

7. An Atom and a List

8. An Atom is either a number or a symbol

9. Symbol is a string of characters, and used as a name for a function or data in symbolic processing
	1. for example 1 34 foo

10. A List is a sequence of Atoms
	1. It is written inside brackets (1 2 3) and each element is separated by a space

11. Lisp is an expression oriented language. 

12. ASIDE:
	1. An expression evaluates to a value
	2. A statement doesn't. 
	3. Statement would be like: That mountain is tall
	4. Expression would be like: When I saw that mountain, I thought it represented my fears. And I must conquer it.

13. Lisp uses the prefix notation. 

14. This means the operator is written first and then its arguments.

15. example: 1+2 is written + 1 2. 

16. Being Lisp it would be written as (+ 1 2)

17. But you are already familiar with this syntax if we write it as a function: add(1,2)

18. In Lisp it would be written (add 1 2)



19. So let's create a simple List Interpreter in TypeScript

20. First intialize project for npm and typescript 

21. Install Jest as the test framework. 

22. We're gonna use tests extensively to grow the lexer/parser

23. 
