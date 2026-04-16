'use client'

import React, {
  useState,
  Fragment,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { ImageSquareIcon } from '@phosphor-icons/react/ImageSquare'
import { LinkIcon } from '@phosphor-icons/react/Link'
import { TextItalicIcon } from '@phosphor-icons/react/TextItalic'
import { TextBIcon } from '@phosphor-icons/react/TextB'
import { PencilSimpleIcon } from '@phosphor-icons/react/PencilSimple'
import { TrashSimpleIcon } from '@phosphor-icons/react/TrashSimple'
// Lexical Core
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  $insertNodes,
  SerializedLexicalNode,
  SerializedRootNode,
  LexicalEditor,
} from 'lexical'

// Lexical Link
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { $generateHtmlFromNodes } from '@lexical/html'
// Headless UI
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { ImageNode } from './nodes/image'

export interface LexicalEditorRef {
  /** Returns the serialized Lexical root node (JSON) */
  getContent: () => SerializedRootNode<SerializedLexicalNode> | null
  /** Returns the editor HTML string */
  getHTML: () => string | null
  /** Clears the editor content */
  clear: () => void
}
// --- 2. EDITOR REF PLUGIN ---
// Captures the editor instance and exposes it via a mutable ref — zero re-renders.
function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editorRef.current = editor
    return () => {
      editorRef.current = null
    }
  }, [editor, editorRef])

  return null
}

// --- 3. FLOATING LINK POPOVER ---
function FloatingLinkPopover({ onEdit }: { onEdit: (url: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const [state, setState] = useState<{
    open: boolean
    url: string
    top: number
    left: number
  }>({ open: false, url: '', top: 0, left: 0 })
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorContainerRef = useRef<HTMLElement | null>(null)

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }

  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setState((s) => ({ ...s, open: false })), 150)
  }

  useEffect(() => {
    const root = editor.getRootElement()
    if (!root) return
    editorContainerRef.current = root.parentElement

    const handleMouseOver = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor || !root.contains(anchor)) return
      cancelHide()

      const containerRect = editorContainerRef.current!.getBoundingClientRect()
      const anchorRect = anchor.getBoundingClientRect()

      setState({
        open: true,
        url: anchor.getAttribute('href') || '',
        top: anchorRect.top - containerRect.top - 8,
        left: anchorRect.left - containerRect.left + anchorRect.width / 2,
      })
    }

    const handleMouseOut = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (anchor && root.contains(anchor)) scheduleHide()
    }

    root.addEventListener('mouseover', handleMouseOver)
    root.addEventListener('mouseout', handleMouseOut)
    return () => {
      root.removeEventListener('mouseover', handleMouseOver)
      root.removeEventListener('mouseout', handleMouseOut)
    }
  }, [editor])

  return (
    <div
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
      style={{
        position: 'absolute',
        top: state.top,
        left: state.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 50,
        pointerEvents: state.open ? 'auto' : 'none',
        opacity: state.open ? 1 : 0,
        transition: 'opacity 0.1s ease',
      }}
    >
      <div className="bg-[#1A1A1A] border border-[#333] px-3 py-2 rounded-lg shadow-2xl flex items-center gap-4 whitespace-nowrap">
        <div className="flex flex-col min-w-[100px]">
          <a
            href={state.url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-blue-400 truncate max-w-[150px] hover:underline"
          >
            {state.url.replace(/^https?:\/\//, '')}
          </a>
        </div>
        <div className="flex gap-2 border-l border-[#2A2A2A] pl-3">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              setState((s) => ({ ...s, open: false }))
              onEdit(state.url)
            }}
            className="text-[9px] uppercase font-bold text-gray-400 hover:text-white"
          >
            <PencilSimpleIcon size={16} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
              setState((s) => ({ ...s, open: false }))
            }}
            className="text-[9px] uppercase font-bold text-red-500/80 hover:text-red-400"
          >
            <TrashSimpleIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- 4. GLOBAL MODAL ---
interface ModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  type: 'link' | 'image'
  initialVal: string
}

function GlobalModal({ isOpen, setIsOpen, type, initialVal }: ModalProps) {
  const [editor] = useLexicalComposerContext()
  const [val, setVal] = useState('')
  const [alt, setAlt] = useState('')

  useEffect(() => {
    if (isOpen) setVal(initialVal || '')
  }, [isOpen, initialVal])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (val) {
      if (type === 'link') {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
          url: val,
          target: '_blank',
          rel: 'noreferrer noopener',
        })
      } else {
        editor.update(() => {
          const imageNode = new ImageNode(val, alt)
          $insertNodes([imageNode])
        })
      }
    }
    setIsOpen(false)
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => setIsOpen(false)} className="relative z-60">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm bg-[#1A1A1A] border border-[#333] p-6 rounded-2xl shadow-2xl">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <label className="text-[10px] uppercase tracking-widest text-gray-500">
                Σύνδεσμος {type === 'image' && 'εικόνας'}
              </label>
              <input
                autoFocus
                className="bg-[#262626] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-white/20 transition-all"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="https://..."
              />
              {type === 'image' && (
                <>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">
                    Περιγραφή
                  </label>
                  <input
                    className="bg-[#262626] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-white/20 transition-all"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Άνδρας κρατά λουλούδι"
                  />
                </>
              )}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200"
                >
                  Συνέχεια
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}

// --- 5. TOOLBAR ---
function Toolbar({ onOpenModal }: { onOpenModal: (t: 'link' | 'image') => void }) {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState({ b: false, i: false })
  const [count, setCount] = useState(0)

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const sel = $getSelection()
          if ($isRangeSelection(sel)) {
            setActive({ b: sel.hasFormat('bold'), i: sel.hasFormat('italic') })
          }
        })
        return false
      },
      1,
    )
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = editorState._nodeMap
        let fullText = ''
        root.forEach((node: any) => {
          if (node.__text) fullText += node.__text + ' '
        })
        const words = fullText.trim().split(/\s+/).filter(Boolean)
        setCount(words.length)
      })
    })
  }, [editor])

  const btn = (act: boolean) =>
    `px-3 py-1.5 rounded text-[10px] uppercase tracking-tighter transition-all ${act ? 'bg-white text-black font-bold' : 'text-gray-500 hover:text-white'}`

  return (
    <div className="flex items-center gap-1 p-3 border-[#2A2A2A]">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={btn(active.b)}
      >
        <TextBIcon size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={btn(active.i)}
      >
        <TextItalicIcon size={18} />
      </button>
      <button onClick={() => onOpenModal('link')} className={btn(false)}>
        <LinkIcon size={18} />
      </button>
      <button onClick={() => onOpenModal('image')} className={btn(false)}>
        <ImageSquareIcon size={18} />
      </button>
      <p className="ml-auto text-sm tracking-tight text-gray-500">
        {count ? (count === 1 ? count + ' λέξη' : count + ' λέξεις') : ''}
      </p>
    </div>
  )
}

// --- 6. MAIN EDITOR ---
const LexicalDarkEditor = forwardRef<LexicalEditorRef>(function LexicalDarkEditor(_props, ref) {
  const [modal, setModal] = useState({ open: false, type: 'link' as 'link' | 'image', val: '' })

  // Holds the raw Lexical editor instance — populated by EditorRefPlugin, never causes re-renders
  const editorInstanceRef = useRef<LexicalEditor | null>(null)

  // Expose imperative methods to the parent via ref
  useImperativeHandle(
    ref,
    () => ({
      getContent: () => {
        const editor = editorInstanceRef.current
        if (!editor) return null
        return editor.getEditorState().toJSON().root
      },
      getHTML: () => {
        const editor = editorInstanceRef.current
        if (!editor) return null
        let html = ''
        editor.getEditorState().read(() => {
          html = $generateHtmlFromNodes(editor)
        })
        return html
      },
      clear: () => {
        const editor = editorInstanceRef.current
        if (!editor) return
        editor.update(() => {
          const { $getRoot, $createParagraphNode } = require('lexical')
          const root = $getRoot()
          root.clear()
          root.append($createParagraphNode())
        })
      },
    }),
    [],
  )

  const config = {
    namespace: 'Editor',
    theme: {
      text: { bold: 'font-bold', italic: 'italic' },
      link: 'text-blue-400 underline cursor-pointer hover:text-blue-300 transition-colors',
    },
    nodes: [LinkNode, AutoLinkNode, ImageNode],
    onError: (e: Error) => console.error(e),
  }

  return (
    <div className="">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl">
        <LexicalComposer initialConfig={config}>
          <Toolbar onOpenModal={(type) => setModal({ open: true, type, val: '' })} />
          <div className="relative overflow-visible">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[350px] p-8 text-gray-300 outline-none leading-relaxed selection:bg-white/10" />
              }
              placeholder={
                <div className="absolute top-8 left-8 text-gray-700 pointer-events-none text-sm select-none italic">
                  Εκφράσου...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FloatingLinkPopover onEdit={(val) => setModal({ open: true, type: 'link', val })} />
            <HistoryPlugin />
            <LinkPlugin validateUrl={(url) => /^https?:\/\//.test(url)} />{' '}
            {/* Captures editor instance into editorInstanceRef — no re-renders, no onChange */}
            <EditorRefPlugin editorRef={editorInstanceRef} />
          </div>
          <GlobalModal
            isOpen={modal.open}
            setIsOpen={(o) => setModal((m) => ({ ...m, open: o }))}
            type={modal.type}
            initialVal={modal.val}
          />
        </LexicalComposer>
      </div>
    </div>
  )
})

export default LexicalDarkEditor
