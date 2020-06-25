export function ToChars(s: string): string[] {
	return Array.from(s)
}

// atom is the basic unit in Lisp
// it could be a number or a symbol
export interface Atom {
	value: number | string
}

export function ParseAtom(s: string): Atom {
	s = s.trim()
	const result = Number(s)
	if (isNaN(result)) {
		return <Atom>{ value: s }
	} else {
		return <Atom>{ value: result }
	}
}

// list is a sequence of atoms or lists
// q( 1 2 (3 4) (5 6))
export interface List {
	items: (Atom | List)[]
}

const ListOpenDelimeter = '('
const ListCloseDelimeter = ')'
const ElementDelimeter = ' '
function ParseListActual(s: string, i: number = 0): [List, number] {
	if (!s || s.length == 0) return [<List>{ items: [] }, 0]

	const AddAtom = () => {
		if (j != -1) {
			const term = elements.slice(j, i)
			result.items.push(ParseAtom(term.join('')))
		}
	}
	const elements = ToChars(s)
	let result = <List>{ items: [] }
	let j = -1
	while (i < elements.length) {
		if (elements[i] == ListCloseDelimeter) {
			AddAtom()
			return [result, i + 1]
		}
		if (elements[i] == ListOpenDelimeter) {
			const [result1, k] = ParseListActual(s, i + 1)
			i = k
			result.items.push(result1)
		}
		if (j == -1 && elements[i] != ElementDelimeter) {
			j = i // start of an atom
		}
		if (elements[i] == ElementDelimeter) {
			AddAtom()
			j = -1
		}
		i++
	}

	return [result, i]

}

export function ParseList(s: string): List {
	if (!s || s.length == 0) throw new Error("Expected starting (")
	s = s.trim()
	if (s[0] != ListOpenDelimeter) throw "Expected starting ("
	const [l, k] = ParseListActual(s, 0)
	console.log('l=', l)
	return <List>l.items[0]
}