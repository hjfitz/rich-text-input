import React, {
	useState, 
	useRef,
	useContext,
	useEffect,
	useCallback
} from 'react'

import {render} from 'react-dom'
import { v4 as uuidv4 } from 'uuid'

import {parseInput, inputTreeToDom} from './parse-input.jsx'

const el = document.getElementById('react-root')

function Editor() {
	const [lines, setLines] = useState([])
	const [modifier, setModifiers] = useState({ 
		cur: {
			bold: false, 
			italic: false
		},
		prev: []
	})
	function createEditor({bold, italic} = {bold: false, italic: false}) {
		const id = uuidv4()
		setLines(children => {
			const newElements = [
				...children,
				<EditorInput
					bold={bold}
					tabIndex={children.length+1}
					italic={italic}
					key={id}
					id={id}
				/>
			]
			return newElements
		})
	}

	useEffect(() => {
		// create editors based on changes to modifiers - new if bold or italic
	
		/*
		 * todo: check if we're creating useless boxes
		 * eg if we go bold and then remove bold, just remove the element
		 *
		 * NOTE: this is very broken... don't go bold and back a few times
		 */
		
		const twoStatesAgo = modifier.prev?.[modifier.prev.length - 2] ?? {}
		console.log(twoStatesAgo)
		/*
		if (JSON.stringify(modifier.cur) === JSON.stringify(twoStatesAgo)) {
			console.log('attempting to remove last box')
			setLines(children => {
				console.log(children)
				children.pop()
				return [...children]
			})
			setModifiers(mods => {
				const {prev, cur} = mods
				prev.pop()
				return {cur, prev, removed: true}
			})
		} else if (!modifier.removed) {*/
			createEditor(modifier.cur)
		//}
	}, [modifier])

	// handle modifiers
	useEffect(() => {
		document.addEventListener('keydown', (ev) => {
			const {ctrlKey, key} = ev
			
			if (!ctrlKey) return
			// we're modifying - kill normal browser behaviour
			ev.preventDefault()

			const symbol = {
				b: 'bold',
				i: 'italic',
			}[key]

			if (!symbol) return


			setModifiers(mods => ({
				cur: {...mods.cur, [symbol]: !mods.cur.[symbol]},
				prev: [...mods.prev, mods.cur],
				removed: false,
			}))
			 
		}) // event listener end


	}, [])

	return (
		<main>
			<div>
				<p>Bold: {String(modifier.cur.bold)}</p>
				<p>Italic: {String(modifier.cur.italic)}</p>
			</div>
			<div contentEditable={true} className="flex text-editor">
				{lines}
			</div>
		</main>
	)
}

function EditorInput({bold, italic, id, tabIndex}) {
	const input = useRef(null)
	const [hasFocus, setFocus] = useState(false)

	useEffect(() => {
		if (input) {
			console.log('focusing')
			setTimeout(() => {

			input.current.focus()
			}, 0)
		}
	}, [input])
	
	const giveFocus = () => setFocus(true)
	const removeFocus = () => setFocus(false)


	const classes = "inline h-5 py-8 pt-4  border focus:ring-2 focus:ring-blue-600".split(' ')

	if (bold) classes.push('font-bold')
	if (italic) classes.push('italic')

	return (
		<span
			ref={input}
			data-guid={id}
			tabIndex={tabIndex}
			contentEditable={true}
			/*contentEditable={hasFocus}*/
			onFocus={giveFocus}
			onBlur={removeFocus}
			className={classes.join(' ')}
		/>
	)
}

render(<Editor />, el)
//render(<App />, el)
