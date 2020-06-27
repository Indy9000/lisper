export function ToChars(s: string): string[] {
	return Array.from(s)
}

// Atom is the basic unit in Lisp
// it could be a number or a symbol
export interface Atom {
	value: number | string
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

function isAtom(o: Atom | List): o is Atom {
	return (o as Atom).value !== undefined
}
function isList(o: Atom | List): o is List {
	return (o as List).items !== undefined
}
// -------------------------------------------------------------

type basicArithmeticOp = (a: Atom, b: Atom) => Atom
const _validateAndEval = (a: Atom, b: Atom, op: (c: number, d: number) => number) => {
	if (typeof a.value === 'number' && typeof b.value === 'number')
		return <Atom>{
			value: op(a.value, b.value)
		}
	throw new Error('Invalid term in add operation')
}
const _add = (a: Atom, b: Atom): Atom => {
	return _validateAndEval(a, b, (c: number, d: number) => c + d)
}
const _sub = (a: Atom, b: Atom): Atom => {
	return _validateAndEval(a, b, (c: number, d: number) => c - d)
}
const _mul = (a: Atom, b: Atom): Atom => {
	console.log('in mul')
	return _validateAndEval(a, b, (c: number, d: number) => c * d)
}
const _div = (a: Atom, b: Atom): Atom => {
	return _validateAndEval(a, b, (c: number, d: number) => c / d)
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

// Eval function is at the heart of Lisp
// An expression usually contains a symbol for an
// operator or function and the rest of the
// elements are the arguments
interface FunMap {
	[key: string]: basicArithmeticOp
}
const _builtInFunctionNames: FunMap = {
	'+': _add,
	'-': _sub, '*': _mul, '/': _div
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
		if (f.value in _builtInFunctionNames) {
			let r = rest(k)
			let a = first(r)
			r = rest(r)
			r.items.forEach(el => {
				const b = Eval(el)
				const fun = _builtInFunctionNames[f.value]
				a = fun(a, b)
			});
			return a
		} else {
			throw new Error('Function/Operator ' + f.value + ' Not found')
		}
	}
	throw new Error('Unknown Error evaluating ' + k)
}