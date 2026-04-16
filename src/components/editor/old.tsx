'use client'

import React, { useState, Fragment, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

// Lexical Core
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  $insertNodes,
  DecoratorNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  EditorConfig,
  DOMExportOutput,
} from 'lexical'

// Lexical Link
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { $generateHtmlFromNodes } from '@lexical/html'

// Headless UI
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'

export type SerializedImageNode = Spread<{ src: string }, SerializedLexicalNode>

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string

  static getType(): string {
    return 'image'
  }
  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__key)
  }

  constructor(src: string = '', key?: NodeKey) {
    super(key)
    this.__src = src
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return new ImageNode(serializedNode.src)
  }

  exportJSON(): SerializedImageNode {
    return { ...super.exportJSON(), src: this.__src, type: 'image', version: 1 }
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'contents'
    return span
  }
  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = ''
    img.className = 'rimg'
    return { element: img }
  }
  updateDOM(): false {
    return false
  }

  decorate(): React.ReactNode {
    return (
      <img
        src={this.__src}
        alt="Editor content"
        className="max-w-full rounded-lg my-4 inline-block border border-[#333]"
      />
    )
  }
}

function FloatingLinkPopover({ onEdit }: { onEdit: (url: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const [linkUrl, setLinkUrl] = useState('')
  const [isLink, setIsLink] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const updateLinkEditor = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = selection.getNodes()[0]
        const parent = node?.getParent()
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          const linkNode = $isLinkNode(parent) ? parent : node
          // @ts-ignore - Lexical types can be finicky with getURL
          setLinkUrl(linkNode.getURL())
          setIsLink(true)

          const nativeSelection = window.getSelection()
          if (nativeSelection?.rangeCount) {
            const rect = nativeSelection.getRangeAt(0).getBoundingClientRect()
            setCoords({
              top: rect.top + window.scrollY - 10,
              left: rect.left + window.scrollX + rect.width / 2,
            })
          }
          return
        }
      }
      setIsLink(false)
    })
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateLinkEditor()
        return false
      },
      1,
    )
  }, [editor, updateLinkEditor])

  if (!isLink || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed z-50 -translate-x-1/2 -translate-y-full pb-2"
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="bg-[#1A1A1A] border border-[#333] px-3 py-2 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1">
        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-blue-400 truncate max-w-[120px] hover:underline"
        >
          {linkUrl}
        </a>
        <button
          onClick={() => onEdit(linkUrl)}
          className="text-[10px] uppercase text-gray-400 hover:text-white"
        >
          Edit
        </button>
        <button
          onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
          className="text-[10px] uppercase text-red-500/70 hover:text-red-400"
        >
          Remove
        </button>
      </div>
    </div>,
    document.body,
  )
}

interface ModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  type: 'link' | 'image'
  initialVal: string
}

function GlobalModal({ isOpen, setIsOpen, type, initialVal }: ModalProps) {
  const [editor] = useLexicalComposerContext()
  const [val, setVal] = useState('')

  useEffect(() => {
    if (isOpen) setVal(initialVal || '')
  }, [isOpen, initialVal])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (val) {
      if (type === 'link') {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, val)
      } else {
        editor.update(() => {
          const imageNode = new ImageNode(val)
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
                Insert {type}
              </label>
              <input
                autoFocus
                className="bg-[#262626] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-white/20 transition-all"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="https://..."
              />
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200"
                >
                  Confirm
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}

// --- 4. TOOLBAR ---
function Toolbar({ onOpenModal }: { onOpenModal: (t: 'link' | 'image') => void }) {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState({ b: false, i: false })

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

  const btn = (act: boolean) =>
    `px-3 py-1.5 rounded text-[10px] uppercase tracking-tighter transition-all ${act ? 'bg-white text-black font-bold' : 'text-gray-500 hover:text-white'}`

  return (
    <div className="flex gap-1 p-3 border-b border-[#2A2A2A]">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={btn(active.b)}
      >
        Bold
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={btn(active.i)}
      >
        Italic
      </button>
      <button onClick={() => onOpenModal('link')} className={btn(false)}>
        Link
      </button>
      <button onClick={() => onOpenModal('image')} className={btn(false)}>
        Image
      </button>
    </div>
  )
}

// --- 5. MAIN EDITOR ---
export default function LexicalDarkEditor() {
  const [modal, setModal] = useState({ open: false, type: 'link' as 'link' | 'image', val: '' })
  const [html, setHtml] = useState('')

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
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl">
        <LexicalComposer initialConfig={config}>
          <Toolbar onOpenModal={(type) => setModal({ open: true, type, val: '' })} />
          <div className="relative">
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
            <LinkPlugin />
            <OnChangePlugin
              onChange={(state, ed) => {
                state.read(() => {
                  const htmlString = $generateHtmlFromNodes(ed)
                  setHtml(htmlString)
                })
              }}
            />
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
}
