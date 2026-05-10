import { DecoratorNode, DOMExportOutput, SerializedLexicalNode, Spread } from 'lexical'

export type SerializedImageNode = Spread<{ src: string; alt: string }, SerializedLexicalNode>

// --- 1. CUSTOM IMAGE NODE ---
export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string
  __alt: string

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt)
  }

  constructor(src: string = '', alt: string = 'Editor content') {
    super()
    this.__src = src
    this.__alt = alt
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return new ImageNode(serializedNode.src, serializedNode.alt)
  }

  exportJSON(): SerializedImageNode {
    return { src: this.__src, alt: this.__alt, type: 'image', version: 1 }
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'contents'
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(): React.ReactNode {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        className="max-w-full rounded-lg my-4 inline-block border border-[#333]"
      />
    )
  }
}
