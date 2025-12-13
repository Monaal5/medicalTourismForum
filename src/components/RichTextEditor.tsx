"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon
} from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Write your content here..." }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Image,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ] as any,
        content: value,
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[200px] max-w-none p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content when value prop changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('URL')

        if (url && editor) {
            (editor.chain().focus() as any).setImage({ src: url }).run()
        }
    }, [editor])

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        isActive,
        icon: Icon,
        label
    }: {
        onClick: () => void;
        isActive?: boolean;
        icon: any;
        label: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'
                }`}
            title={label}
            suppressHydrationWarning
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={Bold}
                    label="Bold"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={Italic}
                    label="Italic"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon={UnderlineIcon}
                    label="Underline"
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    icon={AlignLeft}
                    label="Align Left"
                />
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    icon={AlignCenter}
                    label="Align Center"
                />
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    icon={AlignRight}
                    label="Align Right"
                />
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    icon={AlignJustify}
                    label="Justify"
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={Heading1}
                    label="Heading 1"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={Heading2}
                    label="Heading 2"
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={addImage}
                    icon={ImageIcon}
                    label="Add Image"
                    isActive={false}
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={List}
                    label="Bullet List"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={ListOrdered}
                    label="Numbered List"
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon={Quote}
                    label="Quote"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    icon={Code}
                    label="Code Block"
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    icon={Undo}
                    label="Undo"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    icon={Redo}
                    label="Redo"
                />
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
