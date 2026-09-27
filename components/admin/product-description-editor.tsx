"use client";

import { BgColorsOutlined, BoldOutlined, ItalicOutlined, LinkOutlined, OrderedListOutlined, RedoOutlined, StrikethroughOutlined, UndoOutlined, UnorderedListOutlined } from "@ant-design/icons";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";

export function ProductDescriptionEditor({ name, value }: { name: string; value: string }) {
  const [html, setHtml] = useState(value);
  const submittedValue = useRef<HTMLInputElement>(null);
  const editor = useEditor({ extensions: [StarterKit, TextStyle, Color], content: value, immediatelyRender: false, onTransaction: ({ editor: currentEditor }) => { const nextHtml = currentEditor.getHTML(); if (submittedValue.current) submittedValue.current.value = nextHtml; setHtml(nextHtml); }, editorProps: { attributes: { class: "product-rich-editor-content", "aria-label": "Descripción del producto" } } });
  if (!editor) return null;
  const toggleLink = () => { const previous = editor.getAttributes("link").href as string | undefined; const href = window.prompt("Enlace", previous ?? "https://"); if (href === null) return; if (!href.trim()) editor.chain().focus().unsetLink().run(); else editor.chain().focus().setLink({ href: href.trim() }).run(); };
  const action = (label: string, active: boolean, onClick: () => void, icon: React.ReactNode) => <button type="button" className={active ? "is-active" : ""} aria-label={label} title={label} onClick={onClick}>{icon}</button>;
  const color = (editor.getAttributes("textStyle").color as string | undefined) ?? "#253025";
  return <div className="product-rich-editor"><div className="product-rich-editor-toolbar" role="toolbar" aria-label="Formato de descripción">
    {action("Negrita", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <BoldOutlined/>)}{action("Cursiva", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <ItalicOutlined/>)}{action("Tachado", editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <StrikethroughOutlined/>)}<label className="product-rich-editor-color" title="Color del texto"><BgColorsOutlined/><input aria-label="Color del texto" type="color" value={color} onChange={event => editor.chain().focus().setColor(event.target.value).run()}/></label>{action("Quitar color", false, () => editor.chain().focus().unsetColor().run(), <span className="product-rich-editor-no-color">A</span>)}{action("Lista con viñetas", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <UnorderedListOutlined/>)}{action("Lista numerada", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <OrderedListOutlined/>)}{action("Agregar enlace", editor.isActive("link"), toggleLink, <LinkOutlined/>)}{action("Deshacer", false, () => editor.chain().focus().undo().run(), <UndoOutlined/>)}{action("Rehacer", false, () => editor.chain().focus().redo().run(), <RedoOutlined/>)}
  </div><EditorContent editor={editor}/><input ref={submittedValue} type="hidden" name={name} defaultValue={html}/></div>;
}
