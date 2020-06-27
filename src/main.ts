export function ToChars(s: string): string[] {
	return Array.from(s)
}

// Atom is the basic unit in Lisp
// it could be a number or a symbol
export interface Atom<T> {
	value: T
}

type AUT = Atom<string> | Atom<boolean> | Atom<number>
export function ParseAtom(s: string): AUT {
	s = s.trim() // remove leading and trailing whitespace
	if (s === '') throw new Error('Invalid symbol')
	// TODO: extend this to validate other symbol naming rules
	const result = Number(s)
	return isNaN(result) ? <Atom<string>>{ value: s } : <Atom<number>>{ value: result }
}

// List is a sequence of Atoms or Lists
// example: (1 2 (3 4) (5 6))
export interface List {
	items: (AUT | List)[]
}

const ListOpenDelimeter = '('
const ListCloseDelimeter = ')'
const ListElementDelimeter = ' '

function ParseListActual(elements: string[], i: number): [List, number] {
	let result = <List>{ items: [] }
	let atomStart = -1
	const AddAtom = () => {
		if (atomStart != -1) {
			const term = elements.slice(atomStart, i)
			result.items.push(ParseAtom(term.join('')))
		}
	}
	while (i < elements.length) {
		if (elements[i] === ListCloseDelimeter) { // exit condition
			AddAtom()
			return [result, i + 1]
		}
		if (elements[i] === ListOpenDelimeter) {
			const [r, k] = ParseListActual(elements, i + 1)
			i = k
			result.items.push(r)
			continue
		}
		// find the end of an atom
		// rationale: if we found a space then AddAtom <- only adds if atom 
		// was already discovered.
		if (elements[i] === ListElementDelimeter) {
			// found the whole of the atom
			AddAtom()
			atomStart = -1
		} else {
			// find the start of an atom. 
			// rationale: If the atom's start had not already
			// found and then we discover a non-space, then this is the
			// start of the atom
			if (atomStart == -1) {
				atomStart = i
			}
		}
		i++
	}
	return [result, i]
}

export function ParseList(s: string): List {
	if (s.length == 0) throw new Error("Expected a valid string")
	s = s.trim()
	if (s[0] !== '(') throw new Error("Starting ( not found")
	const elements = ToChars(s)
	const [l, m] = ParseListActual(elements, 0)
	return <List>l.items[0]
}
// -------------------------------------------------------------
function isAtom(o: AUT | List): o is AUT {
	return (o as AUT).value !== undefined
}
function isList(o: AUT | List): o is List {
	return (o as List).items !== undefined
}

function first(l: List): AUT {
	if (l.items.length == 0) return <Atom<number>>{ value: 0 } // TODO: fix default
	if (isAtom(l.items[0])) {
		return l.items[0]
	} else {
		throw Error('Expected Atom at the start of list')
	}
}
function rest(l: List): List {
	let result = <List>{ items: [] }
	if (l.items.length == 0) return result
	result.items = l.items.slice(1)
	return result
}
// -------------------------------------------------------------
type BasicArithmeticOperation = (a: Atom<number>, b: Atom<number>) => Atom<number>
const _add = (a: Atom<number>, b: Atom<number>): Atom<number> => {
	return <Atom<number>>{ value: a.value + b.value }
}
const _sub = (a: Atom<number>, b: Atom<number>): Atom<number> => {
	return <Atom<number>>{ value: a.value - b.value }
}
const _mul = (a: Atom<number>, b: Atom<number>): Atom<number> => {
	return <Atom<number>>{ value: a.value * b.value }
}
const _div = (a: Atom<number>, b: Atom<number>): Atom<number> => {
	return <Atom<number>>{ value: a.value / b.value }
}
// -------------------------------------------------------------
// Eval function is at the heart of Lisp
// An expression usually contains a symbol for an
// operator or function and the rest of the
// elements are the arguments
interface FunMap1 {
	[key: string]: (a: Atom<number>, b: Atom<number>) => Atom<number>
}
const _basicArithmeticOps: FunMap1 = {
	'+': _add, '-': _sub, '*': _mul, '/': _div
}

// -------------------------------------------------------------
const _equal = <T>(a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value === b.value }
}

const _notEqual = <T>(a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value !== b.value }
}

const _gt = <T>(a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value > b.value }
}

const _lt = <T>(a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value < b.value }
}

interface FunMap2 {
	[key: string]: (a: AUT, b: AUT) => Atom<boolean>
}
const _logicalOps: FunMap2 = {
	'==': _equal, '!=': _notEqual, '>': _gt, '<': _lt
}

export function Eval(k: AUT | List): AUT {
	if (isAtom(k)) {
		switch (typeof k.value) {
			case "boolean":
			case "string":
			case "number": {
				return k
			}
		}
	} else if (isList(k)) {
		const f = <Atom<string>>first(k)
		const r = rest(k)
		if (f.value in _basicArithmeticOps) {
			return performBasicArithmeticOps(r, f)
		} else if (f.value in _logicalOps) {
			return perormLogicalOps(r, f)
		} else
			throw new Error('Function/Operator ' + f.value + ' Not found')
	}

	throw new Error('Unknown Error evaluating ' + k)
}

function performBasicArithmeticOps(r: List, f: Atom<string>): Atom<number> {
	const fun = _basicArithmeticOps[f.value]
	const evaluated = r.items.map(el => Eval(el))
	if (evaluated.length < 2) throw new Error('Arithmetic operation ' + f.value + ' needs 2 or more arguments')
	let a = <Atom<number>>evaluated[0]
	for (let i = 1; i < evaluated.length; i++) {
		a = fun(a, <Atom<number>>evaluated[i])
	}
	return a
}

// logical ops are == != > < !
function perormLogicalOps(r: List, f: Atom<string>): Atom<boolean> {
	const fun = _logicalOps[<string>f.value]
	if (r.items.length != 2) throw new Error('Logical operation ' + f.value + ' needs 2 arguments')
	const [a, b] = r.items
	const a1 = Eval(a)
	const b1 = Eval(b)
	return fun(a1, b1)
}
