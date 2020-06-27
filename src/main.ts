export function ToChars(s: string): string[] {
	return Array.from(s)
}

// Atom is the basic unit in Lisp
// it could be a number or a symbol
export interface Atom {
	value: boolean | number | string
}

export function ParseAtom(s: string): Atom {
	s = s.trim() // remove leading and trailing whitespace
	if (s === '') throw new Error('Invalid symbol')
	// TODO: extend this to validate other symbol naming rules
	const result = Number(s)
	return isNaN(result) ? <Atom>{ value: s } : <Atom>{ value: result }
}

// List is a sequence of Atoms or Lists
// example: (1 2 (3 4) (5 6))
export interface List {
	items: (Atom | List)[]
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
function isAtom(o: Atom | List): o is Atom {
	return (o as Atom).value !== undefined
}
function isList(o: Atom | List): o is List {
	return (o as List).items !== undefined
}
function isString(a: Atom): boolean {
	return (typeof a.value === 'string')
}
function isNum(a: Atom): boolean {
	return (typeof a.value === 'number')
}
function isBool(a: Atom): boolean {
	return (typeof a.value === 'boolean')
}
function first(l: List): Atom {
	if (l.items.length == 0) return <Atom>{ value: 0 } // TODO: fix default
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
type BasicArithmeticOperation = (a: Atom, b: Atom) => Atom
const _validateAndExec = (a: Atom, b: Atom, op: (c: number, d: number) => number) => {
	if (typeof a.value === 'number' && typeof b.value === 'number')
		return <Atom>{
			value: op(a.value, b.value)
		}
	throw new Error('Invalid term in add operation')
}
const _add = (a: Atom, b: Atom): Atom => {
	return _validateAndExec(a, b, (c: number, d: number) => c + d)
}
const _sub = (a: Atom, b: Atom): Atom => {
	return _validateAndExec(a, b, (c: number, d: number) => c - d)
}
const _mul = (a: Atom, b: Atom): Atom => {
	return _validateAndExec(a, b, (c: number, d: number) => c * d)
}
const _div = (a: Atom, b: Atom): Atom => {
	return _validateAndExec(a, b, (c: number, d: number) => c / d)
}
// -------------------------------------------------------------
// Eval function is at the heart of Lisp
// An expression usually contains a symbol for an
// operator or function and the rest of the
// elements are the arguments
interface FunMap {
	[key: string]: any
}
const _basicArithmeticOps: FunMap = {
	'+': _add, '-': _sub, '*': _mul, '/': _div
}
// -------------------------------------------------------------
const _validateAndExec2 = <T1, T2>(a: Atom, b: Atom, op: (c: T1, d: T1) => T2): Atom => {
	if (typeof a.value === T1 && typeof b.value === T1)
		return <Atom>{
			value: a.value === b.value
		}
	throw new Error('Invalid term in add operation')
}

const _equal = (a: Atom, b: Atom): Atom => {
	if (typeof a.value === 'number' && typeof b.value === 'number')
		return <Atom>{
			value: a.value === b.value
		}
	throw new Error('Invalid term in add operation')
}

const _notEqual = (a: Atom, b: Atom): Atom => {
	if (typeof a.value === 'number' && typeof b.value === 'number')
		return <Atom>{
			value: a.value !== b.value
		}
	throw new Error('Invalid term in add operation')
}

const _gt = (a: Atom, b: Atom): Atom => {
	if (typeof a.value === 'number' && typeof b.value === 'number')
		return <Atom>{
			value: a.value > b.value
		}
	throw new Error('Invalid term in add operation')
}

const _logicalOps: FunMap = {
	'==': _equal, '!=': _notEqual, '>': _gt, '<': _lt
}

export function Eval(k: Atom | List): Atom {
	if (isAtom(k)) {
		switch (typeof k.value) {
			case "string":
			case "number": {
				return k
			}
		}
	} else if (isList(k)) {
		const f = first(k)
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

function performBasicArithmeticOps(r: List, f: Atom): Atom {
	const fun = _basicArithmeticOps[<string>f.value]
	const evaluated = r.items.map(el => Eval(el))
	if (evaluated.length < 2) throw new Error('Arithmetic operation ' + f.value + ' needs 2 or more arguments')
	let a = evaluated[0]
	for (let i = 1; i < evaluated.length; i++) {
		a = fun(a, evaluated[i])
	}
	return a
}

// logical ops are == != > < !
function perormLogicalOps(r: List, f: Atom): Atom {
	const fun = _logicalOps[<string>f.value]
	if (r.items.length != 2) throw new Error('Logical operation ' + f.value + ' needs 2 arguments')
	const [a, b] = r.items
	return fun(a, b)
}
