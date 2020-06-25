import { ToChars, Atom, ParseAtom, List, ParseList } from './main'

test('should return an array of chars, given a string', () => {
	const actual = ToChars("abc")
	const expected = ['a', 'b', 'c']
	let result = true
	for (let i = 0; i < expected.length; i++) {
		result = result && (expected[i] == actual[i])
	}
	expect(result).toBe(true)
})

test('should return an number Atom, given a correct string', () => {
	const actual = ParseAtom("1")
	const expected = <Atom>{ value: 1 }
	expect(expected.value == actual.value).toBe(true)
})

test('should return an string Atom, given a correct string', () => {
	const actual = ParseAtom("a")
	const expected = <Atom>{ value: 'a' }
	expect(expected.value == actual.value).toBe(true)
})

test('should throw, given an empty string', () => {
	const actual = () => { ParseList("") }
	expect(actual).toThrowError('Expected starting (')
})

test('should return a List, given an empty string with paren', () => {
	const actual = ParseList("()")
	const expected = <List>{ items: [] }
	expect(expected.items.length == actual.items.length).toBe(true)
})

test('should return a List, given a string with 1 element', () => {
	const actual = ParseList("(1)")
	const expected = <List>{ items: [<Atom>{ value: 1 }] }
	// console.log(actual)
	expect(expected.items.length == actual.items.length).toBe(true)
})

test('should return a List, given a string with 2 elements', () => {
	const actual = ParseList("(1 2)")
	const expected = <List>{ items: [<Atom>{ value: 1 }, <Atom>{ value: 2 }] }
	expect(expected.items.length == actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value == (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value == (<Atom>actual.items[1]).value).toBe(true)
})

test('should return a List, given a string with 2 elements', () => {
	const actual = ParseList("(1 2 ())")
	const expected = <List>{
		items: [
			<Atom>{ value: 1 },
			<Atom>{ value: 2 },
			<List>{ items: [] }
		]
	}
	// console.log(actual)
	expect(expected.items.length == actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value == (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value == (<Atom>actual.items[1]).value).toBe(true)
})

test('should return a List, given a string with 2 elements', () => {
	const actual = ParseList("(add 1 2)")
	const expected = <List>{
		items: [
			<Atom>{ value: 'add' },
			<Atom>{ value: 1 },
			<Atom>{ value: 2 },
		]
	}
	// console.log(actual)
	expect(expected.items.length == actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value == (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value == (<Atom>actual.items[1]).value).toBe(true)
})


test('should return a List, given a string with 2 elements', () => {
	const actual = ParseList("(+ 1 2 (* 3 4))")
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
	// console.log(actual)
	expect(expected.items.length == actual.items.length).toBe(true)
	expect((<Atom>expected.items[0]).value == (<Atom>actual.items[0]).value).toBe(true)
	expect((<Atom>expected.items[1]).value == (<Atom>actual.items[1]).value).toBe(true)
})
