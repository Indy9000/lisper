import { ToChars, Atom, ParseAtom, List, ParseList, isAtom, isList, first, rest, Eval } from './main'

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
	const expected = <Atom>{ value: 1 }
	expect(expected.value).toBe(actual.value)
})

test('should return a symbol Atom, given a string containing a name', () => {
	const actual = ParseAtom('a')
	const expected = <Atom>{ value: 'a' }
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
		items: [<Atom>{ value: 1 }]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value === (<Atom>actual.items[0]).value).toBe(true)
})

test('should return a List with 2 Atoms', () => {
	const actual = ParseList('(1 a)')
	const expected = <List>{
		items: [<Atom>{ value: 1 }, <Atom>{ value: 'a' }]
	}
	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value === (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value === (<Atom>actual.items[1]).value).toBe(true)

})

test('should return a List, given a string with nested list', () => {
	const actual = ParseList('(1 2 ())')
	const expected = <List>{
		items: [
			<Atom>{ value: 1 },
			<Atom>{ value: 2 },
			<List>{
				items: []
			}
		]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value === (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value === (<Atom>actual.items[1]).value).toBe(true)
	expect((<List>expected.items[2]).items.length === 0).toBe(true)
})

test('should return a List, given a string with symbol and numeric atoms', () => {
	const actual = ParseList('(add 1 2)')
	const expected = <List>{
		items: [
			<Atom>{ value: 'add' },
			<Atom>{ value: 1 },
			<Atom>{ value: 2 }
		]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value === (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value === (<Atom>actual.items[1]).value).toBe(true)
	expect((<Atom>expected.items[2]).value === (<Atom>actual.items[2]).value).toBe(true)
})

test('should return a nested list given a string of arithmetic expression', () => {
	const actual = ParseList('(+ 1 2 (* 3 4))')
	const expected = <List>{
		items: [
			<Atom>{ value: '+' },
			<Atom>{ value: 1 },
			<Atom>{ value: 2 },
			<List>{
				items: [
					<Atom>{ value: '*' },
					<Atom>{ value: 3 },
					<Atom>{ value: 4 },
				]
			}
		]
	}

	expect(expected.items.length === actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value === (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value === (<Atom>actual.items[1]).value).toBe(true)
	expect((<Atom>expected.items[2]).value === (<Atom>actual.items[2]).value).toBe(true)
	const b = (<List>expected.items[3]).items
	const c = (<List>actual.items[3]).items
	expect(b.length === c.length).toBe(true)
	expect((<Atom>b[0]).value === (<Atom>c[0]).value).toBe(true)
	expect((<Atom>b[1]).value === (<Atom>c[1]).value).toBe(true)
	expect((<Atom>b[2]).value === (<Atom>c[2]).value).toBe(true)

})

test('should return a deep nested list given a string of arithmetic expression', () => {
	const actual = ParseList('(((+ 1 2 )))')
	const expected = <List>{
		items: [
			<List>{
				items: [
					<List>{
						items: [
							<Atom>{ value: '+' },
							<Atom>{ value: 1 },
							<Atom>{ value: 2 },
						]
					}
				]
			}
		]
	}

	expect(actual.items.length).toBe(expected.items.length)
	const b = (<List>actual.items[0]).items
	const c = (<List>expected.items[0]).items

	expect(b.length).toBe(c.length)
	const d = (<List>b[0]).items
	const e = (<List>c[0]).items
	expect(d.length).toBe(e.length)
})

// ----------- Eval Tests ------------

test('should return true for a test of an Atom', () => {
	const actual = isAtom(<Atom>{ value: 3 })
	const expected = true
	expect(actual).toBe(expected)
})
test('should return false for a test of an Atom', () => {
	const actual = isAtom(<List>{ items: [] })
	const expected = false
	expect(actual).toBe(expected)
})

test('should return true for a test of a List', () => {
	const actual = isList(<List>{ items: [] })
	const expected = true
	expect(actual).toBe(expected)
})
test('should return false for a test of a List', () => {
	const actual = isList(<Atom>{ value: 3 })
	const expected = false
	expect(actual).toBe(expected)
})

test('should return first element of a List', () => {
	const actual = first(<List>{
		items: [
			<Atom>{ value: 3 }
		]
	})
	const expected = <Atom>{ value: 3 }
	expect(actual.value).toBe(expected.value)
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
			<Atom>{ value: 3 }
		]
	})
	const expected = <List>{ items: [] }
	expect(actual.items.length).toBe(expected.items.length)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2)')
	const actual = Eval(t)
	const expected = <Atom>{ value: 3 }

	expect(actual.value).toBe(expected.value)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2)')
	const actual = Eval(t)
	const expected = <Atom>{ value: 4 }

	expect(actual.value !== expected.value).toBe(true)
})

test('should fail malformed arithmetic operation', () => {
	const t = ParseList('(+)')
	const actual = () => { Eval(t) }

	expect(actual).toThrowError('Not enough arguments to the operator +')
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(- 1 2)')
	const actual = Eval(t)
	const expected = <Atom>{ value: -1 }

	expect(actual.value).toBe(expected.value)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(* 1 2)')
	const actual = Eval(t)
	const expected = <Atom>{ value: 2 }

	expect(actual.value).toBe(expected.value)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(/ 1 2)')
	const actual = Eval(t)
	const expected = <Atom>{ value: 0.5 }

	expect(actual.value).toBe(expected.value)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 3)')
	const actual = Eval(t)
	const expected = <Atom>{ value: 6 }

	expect(actual.value).toBe(expected.value)
})


test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 4))')
	const actual = Eval(t)
	const expected = <Atom>{ value: 15 }

	expect(actual.value).toBe(expected.value)
})

test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 (/ 8 2)))')
	const actual = Eval(t)
	const expected = <Atom>{ value: 15 }

	expect(actual.value).toBe(expected.value)
})


test('should evaluate a simple arithmetic expression correctly', () => {
	const t = ParseList('(+ 1 2 (* 3 (/ 8 2)) 5)')
	const actual = Eval(t)
	const expected = <Atom>{ value: 20 }

	expect(actual.value).toBe(expected.value)
})
