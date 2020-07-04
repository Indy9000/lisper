import { ToChars, Atom, ParseAtom, List, ParseList, Eval, Run } from "./main"

test("should return an array of chars, given a string", () => {
	const actual = ToChars("abc")
	const expected = ["a", "b", "c"]
	let result = true
	for (let i = 0; i < expected.length; i++) {
		result = result && (expected[i] == actual[i])
	}
	expect(result).toBe(true)
})

// Tests fro Atom
test("should return a number Atom, given a string containing a number", () => {
	const actual = ParseAtom("1")
	const expected = <Atom<number>>{ value: 1 }
	expect(expected.value).toBe(actual.value)
})

test("should return a symbol Atom, given a string containing a name", () => {
	const actual = ParseAtom("a")
	const expected = <Atom<string>>{ value: "a" }
	expect(expected.value).toBe(actual.value)
})

test("should return a symbol Atom, given a string containing a boolean", () => {
	const actual = ParseAtom("true")
	const expected = <Atom<boolean>>{ value: true }
	expect(expected.value).toBe(actual.value)
})

test("should return a symbol Atom, given a string containing a boolean", () => {
	const actual = ParseAtom("false")
	const expected = <Atom<boolean>>{ value: false }
	expect(expected.value).toBe(actual.value)
})

test("should throw if the given string is invalid", () => {
	const actual = () => { ParseAtom("") }
	expect(actual).toThrowError(Error("Invalid symbol"))
})
// Tests for List
test("should throw if the given string is invalid", () => {
	const actual = () => { ParseList("") }
	expect(actual).toThrowError(Error("Expected a valid string"))
})

test("should throw if starting ( is not given", () => {
	const actual = () => { ParseList("12") }
	expect(actual).toThrowError(Error("Starting ( not found"))
})

test("should return an empty list for ()", () => {
	const actual = ParseList("()")
	const expected = <List>{
		items: []
	}
	expect(expected.items.length === actual.items.length).toBe(true)
})

test("should return a List with one number Atom", () => {
	const actual = ParseList("(1)")
	const expected = <List>{
		items: [<Atom<number>>{ value: 1 }]
	}

	expect(actual.items.length).toBe(expected.items.length)
	expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>actual.items[0]).value).toBe(true)
})

test("should return a List with 2 Atoms", () => {
	const actual = ParseList("(1 a)")
	const expected = <List>{
		items: [<Atom<number>>{ value: 1 }, <Atom<string>>{ value: "a" }]
	}
	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>actual.items[0]).value).toBe(true)
	expect((<Atom<string>>expected.items[1]).value === (<Atom<string>>actual.items[1]).value).toBe(true)

})

test("should return a List, given a string with nested list", () => {
	const actual = ParseList("(1 2 ())")
	const expected = <List>{
		items: [
			<Atom<number>>{ value: 1 },
			<Atom<number>>{ value: 2 },
			<List>{
				items: []
			}
		]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>actual.items[0]).value).toBe(true)
	expect((<Atom<number>>expected.items[1]).value === (<Atom<number>>actual.items[1]).value).toBe(true)
	expect((<List>expected.items[2]).items.length === 0).toBe(true)
})

test("should return a List, given a string with symbol and numeric atoms", () => {
	const actual = ParseList("(add 1 2)")
	const expected = <List>{
		items: [
			<Atom<string>>{ value: "add" },
			<Atom<number>>{ value: 1 },
			<Atom<number>>{ value: 2 }
		]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<string>>expected.items[0]).value === (<Atom<string>>actual.items[0]).value).toBe(true)
	expect((<Atom<number>>expected.items[1]).value === (<Atom<number>>actual.items[1]).value).toBe(true)
	expect((<Atom<number>>expected.items[2]).value === (<Atom<number>>actual.items[2]).value).toBe(true)
})

test("should return a nested list given a string of arithmetic expression", () => {
	const actual = ParseList("(+ 1 2 (* 3 4))")
	const expected = <List>{
		items: [
			<Atom<string>>{ value: "+" },
			<Atom<number>>{ value: 1 },
			<Atom<number>>{ value: 2 },
			<List>{
				items: [
					<Atom<string>>{ value: "*" },
					<Atom<number>>{ value: 3 },
					<Atom<number>>{ value: 4 },
				]
			}
		]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<string>>expected.items[0]).value === (<Atom<string>>actual.items[0]).value).toBe(true)
	expect((<Atom<number>>expected.items[1]).value === (<Atom<number>>actual.items[1]).value).toBe(true)
	expect((<Atom<number>>expected.items[2]).value === (<Atom<number>>actual.items[2]).value).toBe(true)
	const b = (<List>expected.items[3]).items
	const c = (<List>actual.items[3]).items
	expect(b.length === c.length).toBe(true)
	expect((<Atom<string>>b[0]).value === (<Atom<string>>c[0]).value).toBe(true)
	expect((<Atom<number>>b[1]).value === (<Atom<number>>c[1]).value).toBe(true)
	expect((<Atom<number>>b[2]).value === (<Atom<number>>c[2]).value).toBe(true)

})

test("simple arithmetic operation should evaluate correctly", () => {
	const t = ParseList("(+ 1 2)")
	const actual = Eval(t)
	const expected = <Atom<number>>{
		value: 3
	}
	expect(expected.value).toBe(actual.value)
})

test("1 level nested arithmetic operation should evaluate correctly", () => {
	const t = ParseList("(+ 1 2 (* 3 4))")
	const actual = Eval(t)
	const expected = <Atom<Number>>{
		value: 15
	}
	expect(expected.value).toBe(actual.value)
})

test("2 level nested arithmetic operation should evaluate correctly", () => {
	const t = ParseList("(+ 1 2 (* 3 (- 2 1)))")
	const actual = Eval(t)
	const expected = <Atom<Number>>{
		value: 6
	}
	expect(actual.value).toBe(expected.value)
})

test("2 level nested arithmetic operation should evaluate correctly", () => {
	const t = ParseList("(+ 10 20 (* 30 (- 20 10)))")
	const actual = Eval(t)
	const expected = <Atom<Number>>{
		value: 330
	}

	expect(actual.value).toBe(expected.value)
})
//----------------------------------------------------------------------------
test("logical op == should throw", () => {
	const t = ParseList("(=)")
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error("Logical operation = needs 2 arguments"))
})

test("logical op == should throw", () => {
	const t = ParseList("(= 1)")
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error("Logical operation = needs 2 arguments"))
})

test("logical op = should succeed", () => {
	const t = ParseList("(= 1 1)")
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})

test("logical op = should succeed", () => {
	const t = ParseList("(= 1 2)")
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test("logical op != should succeed", () => {
	const t = ParseList("(!= 1 1)")
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test("logical op != should succeed", () => {
	const t = ParseList("(!= 1 2)")
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})


test("logical op == should succeed on string", () => {
	const t = ParseList("(= 'ab 'ab)")
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})

test("logical op = should succeed on string", () => {
	const t = ParseList("(= 'ab 'aa)")
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test("logical op != should succeed on string", () => {
	const t = ParseList("(!= 'aa 'aa)")
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test("logical op != should succeed on string", () => {
	const t = ParseList("(!= 'aa 'bb)")
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})


test("logical ops should succeed", () => {
	const t = ParseList("(= (= 1 1) (!= 'a 'b))")
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})

test("conditional logic, if then else", () => {
	const t = ParseList("(if (> 2 1) 'good 'bad)")
	const actual = Eval(t)
	expect(actual.value).toBe("'good")
})

test("conditional logic, if then else", () => {
	const t = ParseList("(if (> 1 2) 'good 'bad)")
	const actual = Eval(t)
	expect(actual.value).toBe("'bad")
})

test("conditional logic, if then else", () => {
	const t = ParseList("(if (> 2 1) (* 3 3) (/ 49 7))")
	const actual = Eval(t)
	expect(actual.value).toBe(9)
})

test("conditional logic, if then else", () => {
	const t = ParseList("(if (> 1 2) (* 3 3) (/ 64 8))")
	const actual = Eval(t)
	expect(actual.value).toBe(8)
})

// Defn <name> <args> <body1> <body2> .. <bodyn>
// evaluate all bodies and return the result of last one
test("main function definition", () => {
	const t = ParseList("(defun main () (0))")
	const actual = Run(t)
	expect(actual.value).toBe(0)
})

test("main function definition with function exec", () => {
	const t = ParseList("(defun main () (+ 1 5))")
	const actual = Run(t)
	expect(actual.value).toBe(6)
})

test("arbitrary function definition within main", () => {
	const t = ParseList(`
	(defun main ()
		(defun fn () (5))
		(fn)
	)`)
	const actual = Run(t)
	expect(actual.value).toBe(5)
})

test("arbitrary function with argument definition within main", () => {
	const t = ParseList(`
	(defun main ()
		(defun fn (n) (+ n 5))
		(fn 1)
	)`)
	const actual = Run(t)
	expect(actual.value).toBe(6)
})

test("arbitrary function with argument definition within main", () => {
	const t = ParseList(`
	(defun main ()
		(defun fn (n) (if (> n 5) 'bigger 'smaller ))
		(fn 6)
	)`)
	const actual = Run(t)
	expect(actual.value).toBe("'bigger")
})

test("arbitrary function with argument definition within main", () => {
	const t = ParseList(`
	(defun main ()
		(defun fn (n)
			(if (> n 5) 'bigger 
			'smaller))
		(fn (- 7 1))
	)`)
	const actual = Run(t)
	expect(actual.value).toBe("'bigger")
})

test("arbitrary function with argument definition within main", () => {
	const t = ParseList(`
	(defun main ()
		(defun ! (n)
			(if (= n 0) 1 
			(* n (! (- n 1))))
		)
		(! 3)
	)`)
	const actual = Run(t)
	expect(actual.value).toBe(6)
})

test("arbitrary function with argument definition within main", () => {
	const t = ParseList(`
	(defun main ()
		(defun factorial (n)
			(if (= n 0) 1
			(* n (factorial (- n 1)))))

		(factorial 5)
	)`)
	const actual = Run(t)
	expect(actual.value).toBe(120)
})
