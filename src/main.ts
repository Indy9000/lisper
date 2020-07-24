export function ToChars(s: string): string[] {
	return Array.from(s)
}

// Atom is the basic unit in Lisp
// it could be a number or a symbol
export interface Atom<T> {
	value: T
}

// General form of an ATOM 
type AUT = Atom<string> | Atom<number> | Atom<boolean>

export function ParseAtom(s: string): AUT {
	s = s.trim() // remove leading and trailing whitespace
	if (s === '') throw new Error('Invalid symbol')
	// TODO: extend this to validate other symbol naming rules
	const result = Number(s)
	if (isNaN(result)) { //  not a number
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

type basicArithmeticOp = (a: Atom<number>, b: Atom<number>) => Atom<number>
interface FunMap {
	[key: string]: basicArithmeticOp
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

const _basicArithmeticOps: FunMap = {
	'+': _add, '-': _sub, '*': _mul, '/': _div
}

// f.value contains the symbol
function performBasicArithmeticOps(r: List, f: Atom<string>, ctx: Context) {
	const evaluated = r.items.map(k => Eval(k, ctx))
	if (evaluated.length === 0)
		throw Error('Not enough arguments to the operator ' + f.value)
	let a = <Atom<number>>evaluated[0]

	const fun = _basicArithmeticOps[f.value]
	for (let i = 1; i < evaluated.length; i++) {
		a = fun(a, <Atom<number>>evaluated[i])
	}
	return a
}
//-------------------------------------
// comparison ops
type basicComparisonOp = (a: AUT, b: AUT) => Atom<boolean>
interface FunMap2 {
	[key: string]: basicComparisonOp
}
const _equal = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value === b.value }
}
const _notEqual = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value !== b.value }
}
const _gt = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value > b.value }
}
const _lt = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value < b.value }
}

const _basicComparisonOps: FunMap2 = {
	'==': _equal, '!=': _notEqual, '>': _gt, '<': _lt
}
// f.value contains the comparison symbol
function performBasicComparisonOps(r: List, f: Atom<string>, ctx: Context): Atom<boolean> {
	const fun = _basicComparisonOps[f.value]
	if (r.items.length != 2) throw new Error('Comparison operation ' + f.value + ' needs 2 arguments')
	const [a, b] = r.items
	return fun(Eval(a, ctx), Eval(b, ctx))
}
//-----------------------------------------------------
// logical ops
type basicLogicalOp = (a: AUT, b: AUT) => Atom<boolean>
interface FunMap3 {
	[key: string]: basicLogicalOp
}
const _and = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value && b.value }
}

const _or = (a: AUT, b: AUT): Atom<boolean> => {
	return <Atom<boolean>>{ value: a.value || b.value }
}

const _basicLogicalOps: FunMap2 = {
	'&&': _and, '||': _or
}

function performBasicLogicalOps(r: List, f: Atom<string>, ctx: Context): Atom<boolean> {
	const fun = _basicLogicalOps[f.value]
	if (r.items.length != 2) throw new Error('Logical operation ' + f.value + ' needs 2 arguments')
	const [a, b] = r.items
	return fun(Eval(a, ctx), Eval(b, ctx))
}

function performConditionalLogicalOps(r: List, f: Atom<string>, ctx: Context): AUT {
	const [test, ifTrue, ifFalse] = r.items
	return Eval(test, ctx).value ? Eval(ifTrue, ctx) : Eval(ifFalse, ctx)
}
//-------------------------------------------------------------------
type TUserFunc = (args: List) => AUT
interface Context {
	[key: string]: AUT | List | TUserFunc
}
function performFunctionDefinitionOps(r: List, f: Atom<string>, ctx: Context): AUT {
	if (r.items.length < 3) throw Error('Malformed function definition')
	const fname = <Atom<string>>r.items[0]
	// check if the function name already exists in the context
	if (fname.value in ctx) {
		throw Error('Function `' + fname.value + '` already defined')
	} else {
		const fparams = <List>r.items[1]
		const fbodies = r.items.slice(2)
		ctx[fname.value] = ((args) => {// body of the function
			// bind args to params
			if (args.items.length != fparams.items.length)
				throw Error('Expected ' + fparams.items.length +
					' number of argumets to the function ' + fname)

			for (let i = 0; i < fparams.items.length; i++) {
				const p = <Atom<string>>fparams.items[i]
				ctx[p.value] = args.items[i]
				console.log(`setting ${p.value} = ${args.items[i]}`)
			}

			// defn <name> <params> <body 1> <body 2> .. <body n>
			// evaluate all bodies, and return the result of the last one
			const h = fbodies.map(k => Eval(k, ctx))
			return h[h.length - 1]
		})
	}
	// definition succeeded
	return <Atom<boolean>>{ value: true }
}

function performFunctionExecOps(r: List, f: Atom<string>, ctx: Context): AUT {
	const fun = <TUserFunc>ctx[f.value]
	const args = r.items.slice(0)
	const a = args.map(k => Eval(k, ctx))
	return fun(<List>{ items: a })
}

// rule 1: A list should start with a symbol which can be a
//         name of an operator
export function Eval(exp: AUT | List, ctx: Context = {}): AUT {
	// if Atom, return itself
	if (isAtom(exp)) {
		if (typeof exp.value === 'string') {
			if (exp.value.startsWith("'"))
				return exp
			if (exp.value in ctx) { // resolve symbol to a value
				return <AUT>ctx[exp.value]
			}
		}
		return exp
	} else if (isList(exp)) {
		// if List evaluate the first
		// then evaluate the rest
		const f = <Atom<string>>first(exp)
		const r = rest(exp)
		if (f.value in _basicArithmeticOps) {
			return performBasicArithmeticOps(r, f, ctx)
		} else if (f.value in _basicComparisonOps) {
			return performBasicComparisonOps(r, f, ctx)
		} else if (f.value in _basicLogicalOps) {
			return performBasicLogicalOps(r, f, ctx)
		} else if (f.value === 'if') {
			return performConditionalLogicalOps(r, f, ctx)
		} else if (f.value === 'defn') {
			return performFunctionDefinitionOps(r, f, ctx)
		} else if (f.value in ctx) {
			return performFunctionExecOps(r, f, ctx)
		}
		return f
	}
	throw Error('Unknown evaluation error ' + exp)
}

export function Run(exp: AUT | List): AUT {
	const ctx: Context = {}
	const retval = Eval(exp, ctx)
	if ('main' in ctx) {
		const fun = <TUserFunc>ctx['main']
		const args = <List>{ items: [] }
		return fun(args)
	}
	return retval
}