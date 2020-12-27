import React, {useState, useRef, useEffect} from 'react'
import {render} from 'react-dom'

const entry = document.getElementById('react-root')


function parseNodesToDOMTreeString(nodes) {
	return nodes.reduce((acc, cur) => {
		const {char, modifiers} = cur
		// if array tail's tail's char is a match to the current char, add
		
		const prevBlock = acc?.[acc.length - 1] ?? []
		const prevState = prevBlock?.state

		if (JSON.stringify(prevState) === JSON.stringify(modifiers)) {
			prevBlock.chars.push(char)
		} else {
			acc.push({modifiers, chars: [char]})
		}

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

function App() {
	// ref to main input
	const editor = useRef(null) 

	// nodes to render - chars, with their input type (pending,setPending)
	// form: char: 'a', modifiers: [[pending]]
	const [nodes, setNodes] = useState([]) 
	// whether to 
	const [pending, setPending] = useState({bold: false, italic: false, underline: false})

	function handleModifiers(ev) {
		const selector = {b: 'bold', i: 'italic', u: 'underline'}[ev.key]
		if (!selector) return 
		setPending(cur => ({
			...cur,
			[selector]: !cur[selector],
		}))
	}

	function getCaretPos() {
		const selection = document.getSelection()
		if (selection.type !== "Caret") return;
		const _range = selection.getRangeAt(0)
		const range = _range.cloneRange()
		range.selectNodeContents(editor.current)
		range.setEnd(_range.endContainer, _range.endOffset)
		const len = range.toString().length
		return len
	}

	function setCaretPos(idx) {
		editor.current.focus()
		document.getSelection().collapse(editor.current, idx)
    }

	function onInput(ev) {
		ev.preventDefault()
		if (ev.ctrlKey) return handleModifiers(ev)
		if (ev.key.length > 1) return 
		const pos = getCaretPos()
		setNodes(nodes => {
			nodes.splice(pos, 0, {char: ev.key, modifiers: pending})
			return [...nodes]
		})
	}


	useEffect(() => {
		if (!nodes.length) return
		const pos = getCaretPos()
		setCaretPos(pos + 1)
	}, [nodes])

	return (
		<main>
			<h1>App</h1>
			<div
				ref={editor}
				className="block h-5 py-8 pt-4 border focus:ring-2 focus:ring-blue-600"
				onKeyDown={onInput}
				contentEditable={true} 
				suppressContentEditableWarning={true}
			>
					
				{parseNodesToDOMTreeString(nodes)}
			</div>

			<div className="block h-24 mt-12 border-2 border-dashed">
				{JSON.stringify(nodes)}
			</div>
			<div>
				{parseNodesToDOMTreeString(nodes)}
			</div>
		</main>
	)
}

render(<App />, entry)
