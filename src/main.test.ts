import { ToChars, Atom, ParseAtom, List, ParseList, Eval } from './main'

test('should return an array of chars, given a string', () => {
	const actual = ToChars('abc')
	const expected = ['a', 'b', 'c']
	let result = true
	for (let i = 0; i < expected.length; i++) {
		result = result && (expected[i] == actual[i])
	}
	expect(result).toBe(true)
})

// Tests fro Atom
test('should return a number Atom, given a string containing a number', () => {
	const actual = ParseAtom('1')
	const expected = <Atom<number>>{ value: 1 }
	expect(expected.value).toBe(actual.value)
})

test('should return a symbol Atom, given a string containing a name', () => {
	const actual = ParseAtom('a')
	const expected = <Atom<string>>{ value: 'a' }
	expect(expected.value).toBe(actual.value)
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
	expect(expected.items.length === actual.items.length).toBe(true)
})

test('should return a List with one number Atom', () => {
	const actual = ParseList('(1)')
	const expected = <List>{
		items: [<Atom<number>>{ value: 1 }]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>actual.items[0]).value).toBe(true)
})

test('should return a List with 2 Atoms', () => {
	const actual = ParseList('(1 a)')
	const expected = <List>{
		items: [<Atom<number>>{ value: 1 }, <Atom<string>>{ value: 'a' }]
	}
	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>actual.items[0]).value).toBe(true)
	expect((<Atom<string>>expected.items[1]).value === (<Atom<string>>actual.items[1]).value).toBe(true)

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

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>actual.items[0]).value).toBe(true)
	expect((<Atom<number>>expected.items[1]).value === (<Atom<number>>actual.items[1]).value).toBe(true)
	expect((<List>expected.items[2]).items.length === 0).toBe(true)
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

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom<string>>expected.items[0]).value === (<Atom<string>>actual.items[0]).value).toBe(true)
	expect((<Atom<number>>expected.items[1]).value === (<Atom<number>>actual.items[1]).value).toBe(true)
	expect((<Atom<number>>expected.items[2]).value === (<Atom<number>>actual.items[2]).value).toBe(true)
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

test('simple arithmetic operation should evaluate correctly', () => {
	const t = ParseList('(+ 1 2)')
	const actual = Eval(t)
	const expected = <Atom<number>>{
		value: 3
	}
	expect(expected.value).toBe(actual.value)
})

test('1 level nested arithmetic operation should evaluate correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 4))')
	const actual = Eval(t)
	const expected = <Atom<Number>>{
		value: 15
	}
	expect(expected.value).toBe(actual.value)
})

test('2 level nested arithmetic operation should evaluate correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 (- 2 1)))')
	const actual = Eval(t)
	const expected = <Atom<Number>>{
		value: 6
	}

	expect(actual.value).toBe(expected.value)
})

test('2 level nested arithmetic operation should evaluate correctly', () => {
	const t = ParseList('(+ 10 20 (* 30 (- 20 10)))')
	const actual = Eval(t)
	const expected = <Atom<Number>>{
		value: 330
	}

	expect(actual.value).toBe(expected.value)
})
//----------------------------------------------------------------------------
test('logical op == should throw', () => {
	const t = ParseList('(==)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error("Logical operation == needs 2 arguments"))
})

test('logical op == should throw', () => {
	const t = ParseList('(== 1)')
	const actual = () => { Eval(t) }
	expect(actual).toThrowError(Error("Logical operation == needs 2 arguments"))
})

test('logical op == should succeed', () => {
	const t = ParseList('(== 1 1)')
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})

test('logical op == should succeed', () => {
	const t = ParseList('(== 1 2)')
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test('logical op != should succeed', () => {
	const t = ParseList('(!= 1 1)')
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test('logical op != should succeed', () => {
	const t = ParseList('(!= 1 2)')
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})


test('logical op == should succeed on string', () => {
	const t = ParseList('(== ab ab)')
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})

test('logical op == should succeed on string', () => {
	const t = ParseList('(== ab aa)')
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test('logical op != should succeed on string', () => {
	const t = ParseList('(!= aa aa)')
	const actual = Eval(t)
	expect(actual.value).toBe(false)
})

test('logical op != should succeed on string', () => {
	const t = ParseList('(!= aa bb)')
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})


test('logical ops should succeed', () => {
	const t = ParseList('(== (== 1 1) (!= a b))')
	const actual = Eval(t)
	expect(actual.value).toBe(true)
})