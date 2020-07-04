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
const ListElementDelimeter = [' ', '\t', '\n', '\r']

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
		if (ListElementDelimeter.includes(elements[i])) {
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

function performBasicArithmeticOps(r: List, f: Atom<string>, ctx: FunMap3): Atom<number> {
	const fun = _basicArithmeticOps[f.value]
	const evaluated = r.items.map(el => Eval(el, ctx))
	if (evaluated.length < 2) throw new Error('Arithmetic operation ' + f.value + ' needs 2 or more arguments')
	let a = <Atom<number>>evaluated[0]
	for (let i = 1; i < evaluated.length; i++) {
		a = fun(a, <Atom<number>>evaluated[i])
	}
	return a
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
	'=': _equal, '!=': _notEqual, '>': _gt, '<': _lt
}

// logical ops are == != > < 
function performLogicalOps(r: List, f: Atom<string>, ctx: FunMap3): Atom<boolean> {
	const fun = _logicalOps[<string>f.value]
	if (r.items.length != 2) throw new Error('Logical operation ' + f.value + ' needs 2 arguments')
	const [a, b] = r.items
	const a1 = Eval(a, ctx)
	const b1 = Eval(b, ctx)
	return fun(a1, b1)
}

function performConditional(r: List, f: Atom<string>, ctx: FunMap3): AUT {
	const [test, ifTrue, ifFalse] = r.items
	return Eval(test, ctx).value ? Eval(ifTrue, ctx) : Eval(ifFalse, ctx)
}
// -------------------------------------------------------------
type TUserFunc = (a: List) => AUT
interface FunMap3 {
	[key: string]: TUserFunc | AUT | List
}

export function Run(k: AUT | List): AUT {
	let ctx: FunMap3 = {}
	const retval = Eval(k, ctx)
	if ('main' in ctx) {
		const fun = <TUserFunc>ctx['main']
		const params = <List>{ items: [] }
		return fun(params)
	}
	return retval
}

export function Eval(k: AUT | List, ctx: FunMap3 = {}): AUT {
	if (isAtom(k)) {
		switch (typeof k.value) {
			case "boolean":
			case "number": {
				return k
			} break;
			case "string": {
				// if string starts with ' <- do not substitue
				if (k.value.startsWith("'")) {
					return k
				} else {
					// else return the value of the variable name					
					if (k.value in ctx) {
						return <AUT>ctx[k.value]
					}
				}
			}
		}
	} else if (isList(k)) {
		const f = <Atom<string>>first(k)
		const r = rest(k)
		if (f.value in _basicArithmeticOps) {
			return performBasicArithmeticOps(r, f, ctx)
		} else if (f.value in _logicalOps) {
			return performLogicalOps(r, f, ctx)
		} else if (f.value === 'if') {
			return performConditional(r, f, ctx)
		} else if (f.value === 'defun') {
			// handle function definition
			if (r.items.length < 3) throw Error('Malformed function definition')
			const fname = <Atom<string>>r.items[0]

			if (fname.value in ctx) {
				throw Error('function `' + fname.value + '` already defined')
			} else {
				// get the names of the function parameters
				const params = <List>r.items[1]
				// store the function
				ctx[fname.value] = ((args) => {
					// associate each argument with the parameter name
					if (args.items.length != params.items.length)
						throw Error('Expected ' + params.items.length +
							' number of arguments to function `' + fname.value +
							'` but was given ' + args.items.length + ' with ')
					for (let i = 0; i < params.items.length; i++) {
						const p = params.items[i]
						if (!isAtom(p))
							throw Error('Param must be an Atom')
						if (typeof p.value !== 'string')
							throw Error('Param must be a string')
						ctx[p.value] = args.items[i]
						console.log(`setting ${p.value} = ${args.items[i]}`)
					}

					// Evaluate the bodies and return the last one's result
					// Defn <name> <args> <body1> <body2> .. <bodyn>
					const h = r.items.slice(2).map(k => Eval(k, ctx))
					return h[h.length - 1]
				})
				return <Atom<boolean>>{ value: true } // TODO: is this ok?
			}
		} else if (f.value in ctx) {
			const fun = <TUserFunc>ctx[f.value]
			const args = r.items.slice(0)
			const a = args.map(k => Eval(k, ctx))
			const params = <List>{ items: a }
			return fun(params)
		}
		else
			return f
	}
	throw new Error('Unknown Error evaluating ' + k)
}
