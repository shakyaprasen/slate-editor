// Import React dependencies.
import React, { useCallback, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor, Transforms, Editor, Text } from 'slate';

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';

import './App.css';

import { convert } from './romanizedNepali';

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    })

    return !!match
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    )
  },
  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    )
  },
};

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [currentWord, setCurrentWord] = useState('');
  const [value, setValue] = useState([
    {
      id: 'text-1',
      type: 'readOnly',
      children: [{ text: 'A line of text to be translated.' }],
    },
    {
      id: 'translation-1',
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      id: 'text-2',
      type: 'readOnly',
      children: [{ text: 'Another line to be translated.' }],
    },
    {
      id: 'translation-2',
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      case 'readOnly':
        return <ReadOnlyElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, []);

  
  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === 'readOnly' ? true : isVoid(element);
  };


  const convertToUnicode = text => convert(text);

  // const addToTranslationQueue = (text => setCurrentTranslation({})


  return (
    // Add a toolbar with buttons that call the same methods.
    <Slate
      onChange={value => {
        setValue(value)
        // Save the value to Local Storage.
        const content = JSON.stringify(value)
        localStorage.setItem('content', content)
      }}
      editor={editor} 
      value={value} 
    >
      <Editable
        editor={editor}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (event.keyCode === 32 || event.key === "Shift" || event.key === "Alt" || event.key === "Control" || event.key === "Backspace" || event.key === "Enter" || event.key === "Delete" || event.key === "Tab") {
            setCurrentWord('');
            return;
          }
          event.preventDefault();
          const updatedWord = `${currentWord}${event.key}`;
          setCurrentWord(updatedWord);
          if (currentWord) {
            editor.deleteBackward('word');
          }
          Transforms.insertText(editor, convertToUnicode(updatedWord));
        }}
      />
    </Slate>
  )
}


const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
}
const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

const ReadOnlyElement = props => {
  return <div {...props.attributes}><p contentEditable={false}>{props.element.children[0].text}</p>{props.children}</div>
}
// Define a React component to render leaves with bold text.
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}
export default App;
