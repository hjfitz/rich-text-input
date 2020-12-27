import React, {
	useRef, 
	useState, 
	useEffect,
} from 'react'

import {render} from 'react-dom'

import {
	getCaretPos, 
	setCaretPos, 
	getSelectedIndexes,
	parseNodesToDOMTreeString,
} from './util'

const entry = document.getElementById('react-root')

function App() {
	// ref to main input
	const editor = useRef(null) 

	// nodes to render - chars, with their input type (pending,setPending)
	// form: char: 'a', modifiers: [[pending]]
	const [nodes, setNodes] = useState([]) 
	const [pending, setPending] = useState({bold: false, italic: false, underline: false})

	const [debug, setDebug] = useState(false)

	const toggleDebug = () => setDebug(dbg => !dbg)

	function handleModifiers(ev) {
		const selector = {b: 'bold', i: 'italic', u: 'underline'}[ev.key]
		if (!selector) return 
		setPending(cur => ({
			...cur,
			[selector]: !cur[selector],
		}))
	}

	function deleteChar() {
		const {type} = document.getSelection()

		if (type === 'Range') {
			const {start, end} = getSelectedIndexes(editor.current)
			setNodes(nodes => {
				nodes.splice(start, (end - start+1))
				//document.getSelection().removeAllRanges()
				return [...nodes]
			})
		}

		if (type === 'Caret') {
			const pos = getCaretPos(editor.current)
			const nodeIndex = pos - 1
			// useEffect[nodes] incs by 1 so reduce by 1 again
			const newPos = pos - 2 
			setNodes(nodes => {
				nodes.splice(nodeIndex, 1)
				if (newPos >= 0) setCaretPos(editor.current, newPos)
				else setCaretPos(editor.current, 0)
				return [...nodes]
			})
		}
	}

	function onInput(ev) {
		ev.preventDefault()
		if (ev.ctrlKey) return handleModifiers(ev)
		if (ev.key === 'Backspace') deleteChar()
		if (ev.key.indexOf('Arrow') === 0) handleCaretMovement(ev.key)
		if (ev.key.length > 1) return 
		const pos = getCaretPos(editor.current)
		setNodes(nodes => {
			nodes.splice(pos, 0, {char: ev.key, modifiers: pending})
			return [...nodes]
		})
	}

	function handleCaretMovement(key) {
		const el = editor.current
		const pos = getCaretPos(el)
		if (key === 'ArrowLeft' && pos !== 0)
			setCaretPos(el, pos - 1)
		else if (key === 'ArrowRight' && pos < nodes.length)
			setCaretPos(el, pos + 1)
	}

	// find where we've clicked, get the node before
	// update modifier state
	function updateModifiersPerCaret() {
		const pos = getCaretPos(editor.current)
		const node = nodes[pos - 1]
		if (!node) return
		setPending({...node.modifiers})
	}


	useEffect(() => {
		if (!nodes.length) return
		const pos = getCaretPos(editor.current)
		if (pos >= nodes.length) return
		const newPos = pos + 1
		setCaretPos(editor.current, newPos)
	}, [nodes])

	return (
		<main>
			<h1>App</h1>
			<button onClick={toggleDebug}>Debug</button>
			<div
				ref={editor}
				className="block h-5 py-8 pt-4 border focus:ring-2 focus:ring-blue-600"
				onKeyDown={onInput}
				onClick={updateModifiersPerCaret}
				contentEditable={true} 
				suppressContentEditableWarning={true}
			>
				{parseNodesToDOMTreeString(nodes)}
			</div>

			{debug && (
				<div className="block h-24 mt-12 border-2 border-dashed">
					{JSON.stringify(nodes)}
				</div>
			)}
		</main>
	)
}

render(<App />, entry)
