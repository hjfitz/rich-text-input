import React, {useState, useRef, useContext, useEffect} from 'react'
import {render} from 'react-dom'

import {parseInput, inputTreeToDom} from './parse-input.jsx'

const el = document.getElementById('react-root')

const ModifierContext = React.createContext({
	modifier: {bold: false, ital: false}, 
	setModifier: () => {}
})

function EditorToolbar({children}) {
	const [focused, setFocused] = useState(null)
	const [modifier, setModifier] = useState({
		bold: false,
		ital: false
	})
	function changeState(ev) {}
	useEffect(() => {
		const keys = []
		document.addEventListener('keydown', (ev) => {
			ev.preventDefault()
			if (ev.key === "Control") {
				setFocused(document.activeElement)
				document.activeElement.blur()
			}

			if (keys[keys.length - 1] !== ev.key) keys.push(ev.key)
			if (keys.length === 2) {
				if (keys[0] !== 'Control') return
				// todo: unfuck code
				if (keys[1] === 'b') {
					setModifier(mod => {
						return {
							...mod,
							bold: !mod.bold,
						}
					})
				} else if (keys[1] === 'i') {
					setModifier(mod => {
						return {
							...mod,
							ital: !mod.ital,
						}
					})
				}

			}
			if (keys.length === 3) keys.pop()
		})
		document.addEventListener('keyup', (ev) => {
			if (ev.key === "Control") {
				console.log('removing control madness')
				setFocused(cur => {
					cur.focus()
					return null
				})
			}
			keys.pop()
		})
			
	}, [])
	return (
		<ModifierContext.Provider
			value={{
				modifier,
				setModifier,
			}}
		>
			<div>{JSON.stringify(modifier)}</div>
			<main>{children}</main>
		</ModifierContext.Provider>
	)
}

function TextInput() {
	const input = useRef(null)
	const {modifier, setModifier} = useContext(ModifierContext)
	const [inputChars, setInputChars] = useState([])

	function doFocus() {
		input.current.focus()
	}

	function doEdit(ev) {
		ev.preventDefault()
		console.log(ev.key)
		const key = parseInput(ev.key, modifier)
		if (ev.key === 'Backspace') {
			setInputChars(allInputs => {
				allInputs.splice(-1)
				console.log(allInputs)
				return [...allInputs]
			})
			return
		}
		// hacky fix for checking for modifier changes
		if (!key) return //input.current.blur()
		setInputChars(allIn => [...allIn, key])
	}

	return (
		<>
			<h1>Input Test</h1>
			<div 
				ref={input}
				tabIndex={0}
				onClick={doFocus} 
				onKeyDown={doEdit}
				className="h-5 py-8 pt-4 m-4 border focus:ring-2 focus:ring-blue-600" 
			>
				<div className="active-field">{(inputTreeToDom(inputChars))}</div>
			</div>
		</>
	)
}

function App() {
	return (
		<EditorToolbar>
			<TextInput />
		</EditorToolbar>
	)
}

render(<App />, el)
