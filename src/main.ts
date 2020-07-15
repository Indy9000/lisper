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
	if (isNaN(result)) {
		if (s === 'true') {
			return <Atom<boolean>>{ value: true }
		}
		if (s === 'false') {
			return <Atom<boolean>>{ value: false }
		}
		return <Atom<string>>{ value: s }
	} else {
		return <Atom<number>>{ value: result }
	}
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

export function isAtom(o: AUT | List): o is AUT {
	return (o as AUT).value !== undefined
}

export function isList(o: AUT | List): o is List {
	return (o as List).items !== undefined
}

export function first(l: List): AUT {
	if (l.items.length === 0) throw Error('List is empty')
	if (isAtom(l.items[0])) {
		return l.items[0]
	} else {
		throw Error('Expected an Atom at the start of a List')
	}
}

export function rest(l: List): List {
	let result = <List>{ items: [] }
	if (l.items.length === 0) return result
	result.items = l.items.slice(1)
	return result
}

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

type basicArithmeticOp = (a: Atom<number>, b: Atom<number>) => Atom<number>
interface FunMap1 {
	[key: string]: basicArithmeticOp
}
const _basicArithmeticOps: FunMap1 = {
	'+': _add, '-': _sub, '*': _mul, '/': _div
}

function performBasicArithmeticOps(r: List, f: Atom<string>): Atom<number> {
	const evaluated = r.items.map(k => Eval(k))
	if (evaluated.length === 0)
		throw Error('Not enough arguments to the operator ' + f.value)
	let a = <Atom<number>>evaluated[0]
	if (typeof f.value === 'string') {
		const fun = _basicArithmeticOps[f.value]
		for (let i = 1; i < evaluated.length; i++) {
			a = fun(a, <Atom<number>>evaluated[i])
		}
	}
	return a
}

const _equal = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: (a.value === b.value) }
}

const _notEqual = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: (a.value !== b.value) }
}

const _gt = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: (a.value > b.value) }
}

const _lt = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: (a.value < b.value) }
}

type basicLogicalOp = (a: AUT, b: AUT) => Atom<boolean>
interface FunMap2 {
	[key: string]: basicLogicalOp
}
const _logicalOps: FunMap2 = {
	'==': _equal, '!=': _notEqual, '>': _gt, '<': _lt
}
function performLogicalOps(r: List, f: Atom<string>): Atom<boolean> {
	const fun = _logicalOps[<string>f.value]
	if (r.items.length != 2) throw new Error('Logical operation ' + f.value + ' needs 2 arguments')
	const [a, b] = r.items
	return fun(Eval(a), Eval(b))
}

function performConditional(r: List, f: Atom<string>): AUT {
	const [test, ifTrue, ifFalse] = r.items
	return Eval(test).value ? Eval(ifTrue) : Eval(ifFalse)
}
// rule 1: A list should start with a symbol which can be a
//         name of an operator
export function Eval(exp: AUT | List): AUT {
	// if Atom, return itself
	if (isAtom(exp)) {
		return exp
	} else if (isList(exp)) {
		// if List evaluate the first
		// then evaluate the rest
		const f = <Atom<string>>first(exp)
		const r = rest(exp)
		if (f.value in _basicArithmeticOps) {
			return performBasicArithmeticOps(r, f)
		} else if (f.value in _logicalOps) {
			return performLogicalOps(r, f)
		} else if (f.value === 'if') {
			return performConditional(r, f)
		}
		return f
	}
	throw Error('Unknown evaluation error ' + exp)
}

