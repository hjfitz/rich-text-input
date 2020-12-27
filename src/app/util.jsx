import React from 'react'

export function getSelectedIndexes(el) {
	const selection = document.getSelection()
	const {startContainer, endContainer} = selection.getRangeAt(0)

	// unfurl inner spans as start/end containers point to text nodes
	const children = [...el.childNodes].map(el => {
		if (el.hasChildNodes()) return [...el.childNodes]
		return el
	}).flat()

	const start = children.indexOf(startContainer)
	const end = children.indexOf(endContainer)

	return {start, end}
}

export function getCaretPos(el) {
	const selection = document.getSelection()
	const _range = selection.getRangeAt(0)
	const range = _range.cloneRange()
	range.selectNodeContents(el)
	range.setEnd(_range.endContainer, _range.endOffset)
	const len = range.toString().length
	return len
}

export function setCaretPos(el, idx) {
	el.focus()
	const sel = document.getSelection()
	sel.collapse(el, idx)
}

export function parseNodesToDOMTreeString(nodes) {
	return nodes.reduce((acc, cur) => {
		const {char, modifiers} = cur
		// if array tail's tail's char is a match to the current char, add
		
		// todo: broken
		const prevBlock = acc?.[acc.length - 1] ?? []
		const prevState = prevBlock?.state //modifiers

		if (JSON.stringify(prevState) === JSON.stringify(modifiers)) {
			prevBlock.chars.push(char)
		} else {
			acc.push({modifiers, chars: [char]})
		}

		console.log({acc})
		return acc

	}, []).map(set => {
		const chars = set.chars.join('')
		const classes = []
		if (set.modifiers.bold) classes.push('font-bold')
		if (set.modifiers.italic) classes.push('italic')
		if (set.modifiers.underline) classes.push('underline')
		if (!classes.length) return chars
		const className = classes.join(' ')
		return <span className={className}>{chars}</span>
	})
}


export class EventEmitter {
	constructor() {
		this.events = {}
	}

	add(event, callback, once = false) {
		const cb = {callback, once}
		if (this.events[event]) this.events[event].push(cb)
		else this.events[event] = [cb]
	}

	on(event, callback) {
		this.add(event, callback)
	}

	once(event, callback) {
		this.add(event, callback, true)
	}


	emit(event, data) {
		const stack = this.events[event]
		if (!stack) return
		stack.forEach(({callback}) => callback(data))
		this.events[event] = stack.filter(cb => cb.once)
	}
}
