import { ToChars, Atom, ParseAtom, List, ParseList, isAtom, isList, first, rest, Eval } from './main'

test('should return an array of chars, given a string', () => {
	const actual = ToChars('abc')
	const expected = ['a', 'b', 'c']
	expect(actual).toEqual(expected)
})

// Tests fro Atom
test('should return a number Atom, given a string containing a number', () => {
	const actual = ParseAtom('1')
	const expected = <Atom<number>>{ value: 1 }
	expect(actual).toEqual(expected)
})

test('should return a symbol Atom, given a string containing a name', () => {
	const actual = ParseAtom('a')
	const expected = <Atom<string>>{ value: 'a' }
	expect(actual).toEqual(expected)
})

test('should throw if the given string is invalid', () => {
	const actual = () => { ParseAtom('') }
	expect(actual).toThrowError(Error('Invalid symbol'))
})
// Tests for List
test('should throw if the given string is invalid', () => {
	const actual = () => { ParseList('') }
	expect(actual).toThrowError(Error("Expected a valid string"))
})

test('should throw if starting ( is not given', () => {
	const actual = () => { ParseList('12') }
	expect(actual).toThrowError(Error("Starting ( not found"))
})

test('should return an empty list for ()', () => {
	const actual = ParseList('()')
	const expected = <List>{
		items: []
	}
	expect(actual).toEqual(expected)
})

test('should return a List with one number Atom', () => {
	const actual = ParseList('(1)')
	const expected = <List>{
		items: [<Atom<number>>{ value: 1 }]
	}
	expect(actual).toEqual(expected)
})

test('should return a List with 2 Atoms', () => {
	const actual = ParseList('(1 a)')
	const expected = <List>{
		items: [<Atom<number>>{ value: 1 }, <Atom<string>>{ value: 'a' }]
	}
	expect(actual).toEqual(expected)
})

test('should return a List, given a string with nested list', () => {
	const actual = ParseList('(1 2 ())')
	const expected = <List>{
		items: [
			<Atom<number>>{ value: 1 },
			<Atom<number>>{ value: 2 },
			<List>{
				items: []
			}
		]
	}
	expect(actual).toEqual(expected)
})

test('should return a List, given a string with symbol and numeric atoms', () => {
	const actual = ParseList('(add 1 2)')
	const expected = <List>{
		items: [
			<Atom<string>>{ value: 'add' },
			<Atom<number>>{ value: 1 },
			<Atom<number>>{ value: 2 }
		]
	}
	expect(actual).toEqual(expected)
})

test('should return a nested list given a string of arithmetic expression', () => {
	const actual = ParseList('(+ 1 2 (* 3 4))')
	const expected = <List>{
		items: [
			<Atom<string>>{ value: '+' },
			<Atom<number>>{ value: 1 },
			<Atom<number>>{ value: 2 },
			<List>{
				items: [
					<Atom<string>>{ value: '*' },
					<Atom<number>>{ value: 3 },
					<Atom<number>>{ value: 4 },
				]
			}
		]
	}
	expect(actual).toEqual(expected)
})

test('should return a deep nested list given a string of arithmetic expression', () => {
	const actual = ParseList('(((+ 1 2 )))')
	const expected = <List>{
		items: [
			<List>{
				items: [
					<List>{
						items: [
							<Atom<string>>{ value: '+' },
							<Atom<number>>{ value: 1 },
							<Atom<number>>{ value: 2 },
						]
					}
				]
			}
		]
	}
	expect(actual).toEqual(expected)
})

// ----------- Eval Tests ------------

test('should return true for a test of an Atom', () => {
	const actual = isAtom(<Atom<number>>{ value: 3 })
	const expected = true
	expect(actual).toEqual(expected)
})
test('should return false for a test of an Atom', () => {
	const actual = isAtom(<List>{ items: [] })
	const expected = false
	expect(actual).toEqual(expected)
})

test('should return true for a test of a List', () => {
	const actual = isList(<List>{ items: [] })
	const expected = true
	expect(actual).toEqual(expected)
})
test('should return false for a test of a List', () => {
	const actual = isList(<Atom<number>>{ value: 3 })
	const expected = false
	expect(actual).toEqual(expected)
})

test('should return first element of a List', () => {
	const actual = first(<List>{
		items: [
			<Atom<number>>{ value: 3 }
		]
	})
	const expected = <Atom<number>>{ value: 3 }
	expect(actual).toEqual(expected)
})
test('should throw and exception if the list is empty', () => {
	const actual = () => {
		first(<List>{
			items: []
		})
	}
	expect(actual).toThrowError(Error('List is empty'))
})

test('should return the rest of a List', () => {
	const actual = rest(<List>{
		items: [
			<Atom<number>>{ value: 3 }
		]
	})
	const expected = <List>{ items: [] }
	expect(actual).toEqual(expected)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 3 }

	expect(actual).toEqual(expected)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 4 }

	expect(actual).not.toEqual(expected)
})

test('should fail malformed arithmetic operation', () => {
	const t = ParseList('(+)')
	const actual = () => { Eval(t) }

	expect(actual).toThrowError('Not enough arguments to the operator +')
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(- 1 2)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: -1 }

	expect(actual).toEqual(expected)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(* 1 2)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 2 }

	expect(actual).toEqual(expected)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(/ 1 2)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 0.5 }

	expect(actual).toEqual(expected)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 3)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 6 }

	expect(actual).toEqual(expected)
})


test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 4))')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 15 }

	expect(actual).toEqual(expected)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 (/ 8 2)))')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 15 }

	expect(actual).toEqual(expected)
})


test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 (/ 8 2)) 5)')
	const actual = Eval(t)
	const expected = <Atom<number>>{ value: 20 }

	expect(actual).toEqual(expected)
})

// comparison operations

test('comparison op == should throw', () => {
	const t = ParseList('(==)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error('Comparison operation == needs 2 arguments'))
})

test('comparison op == should throw', () => {
	const t = ParseList('(== 1)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error('Comparison operation == needs 2 arguments'))
})

test('comparison op == should succeed 1', () => {
	const t = ParseList('(== 1 1)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})
test('comparison op == should succeed 2', () => {
	const t = ParseList('(== 2 1)')
	const actual = Eval(t)
	expect(actual.value).toEqual(false)
})
test('comparison op == should succeed 3', () => {
	const t = ParseList('(== aaaa aaaa)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})

test('comparison op == should succeed 4', () => {
	const t = ParseList('(== aaaa aaa)')
	const actual = Eval(t)
	expect(actual.value).toEqual(false)
})

test('comparison op != should succeed 1', () => {
	const t = ParseList('(!= 1 1)')
	const actual = Eval(t)
	expect(actual.value).toEqual(false)
})
test('comparison op != should succeed 2', () => {
	const t = ParseList('(!= 1 2)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})
test('comparison op > should succeed 1', () => {
	const t = ParseList('(> 2 1)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})

test('comparison op > should succeed 2', () => {
	const t = ParseList('(> 1 2)')
	const actual = Eval(t)
	expect(actual.value).toEqual(false)
})

test('comparison op < should succeed 1', () => {
	const t = ParseList('(< 1 2)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})

test('complex comparison op should succeed 1', () => {
	const t = ParseList('(== (== 1 1) (!= a b))')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})

// logical operations
// and or not
test('logical op && should throw', () => {
	const t = ParseList('(&&)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error('Logical operation && needs 2 arguments'))
})

test('logical op && should throw', () => {
	const t = ParseList('(&& true)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error('Logical operation && needs 2 arguments'))
})

test('logical op && should throw', () => {
	const t = ParseList('(||)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error('Logical operation || needs 2 arguments'))
})

test('logical op && should throw', () => {
	const t = ParseList('(|| true)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error('Logical operation || needs 2 arguments'))
})

test('logical op && should succeed', () => {
	const t = ParseList('(&& true true)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})
test('logical op && should succeed', () => {
	const t = ParseList('(&& true false)')
	const actual = Eval(t)
	expect(actual.value).toEqual(false)
})

test('logical op || should succeed', () => {
	const t = ParseList('(|| true true)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})
test('logical op || should succeed', () => {
	const t = ParseList('(|| true false)')
	const actual = Eval(t)
	expect(actual.value).toEqual(true)
})

// conditional logic
test('conditional logic, if then else', () => {
	const t = ParseList('(if (> 2 1) good bad)')
	const actual = Eval(t)
	expect(actual.value).toBe('good')
})

test('conditional logic, if then else', () => {
	const t = ParseList('(if (< 2 1) good bad)')
	const actual = Eval(t)
	expect(actual.value).toBe('bad')
})

test('conditional logic, if then else', () => {
	const t = ParseList('(if (&& (< 1 2) (> 3 1)) good bad)')
	const actual = Eval(t)
	expect(actual.value).toBe('good')
})

test('conditional logic, if then else', () => {
	const t = ParseList('(if (&& (< 1 2) (> 3 1)) (* 3 3) bad)')
	const actual = Eval(t)
	expect(actual.value).toBe(9)
})

test('conditional logic, if then else', () => {
	const t = ParseList('(if (&& (< 2 1) (> 3 1)) (* 3 3) bad)')
	const actual = Eval(t)
	expect(actual.value).toBe('bad')
})