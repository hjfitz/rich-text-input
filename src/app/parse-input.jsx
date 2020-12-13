import React from 'react'

export function parseInput(char, state = 'norm') {
	if (char.length === 1) return {char, state}
	return false
}



export function inputTreeToDom(inputString) {
	// data comes in as {char, state}
	// take the compiler approach, get an outer, 
	// keep filling until next doesn't match
	return inputString.reduce((acc, cur) => {
		const {char, state} = cur
		// if array tail's tail's char is a match to the current char, add
		
		const prevBlock = acc?.[acc.length - 1] ?? []
		const prevState = prevBlock?.state ?? 'none'

		if (prevState === state) {
			//cur[cur.length - 1].chars.push(char)
			prevBlock.chars.push(char)
		}
		else acc.push({state, chars: [char]})
		return acc
		// else, create a new item
	}, []) // follows the form [{chars: [], state: ''}, ...]
		//.map(() => '')
		.map((block) => {
			const children = block.chars.join('')
			const classes = ['inline']
			if (block.state.bold) classes.push('font-semibold')
			if (block.state.ital) classes.push('italic')
			return <div className={classes.join(' ')}>{children}</div>
		})
}
