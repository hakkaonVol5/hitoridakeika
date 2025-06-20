import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useGameStore } from '../store/gameStore';

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    isReadOnly: boolean;
    language?: string;
}

export default function CodeEditor({
    code,
    onChange,
    isReadOnly,
    language = 'javascript'
}: CodeEditorProps) {
    const editorRef = useRef<any>(null);
    const { isMyTurn } = useGameStore();

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value);
        }
    };

    useEffect(() => {
        if (editorRef.current) {
            // 編集権限の変更時にフォーカスを設定
            if (isMyTurn && !isReadOnly) {
                editorRef.current.focus();
            }
        }
    }, [isMyTurn, isReadOnly]);

    return (
        <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
            <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    readOnly: isReadOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    theme: 'vs-dark',
                    wordWrap: 'on',
                    tabSize: 2,
                    insertSpaces: true,
                    detectIndentation: false,
                    trimAutoWhitespace: true,
                    largeFileOptimizations: false,
                }}
                theme="vs-dark"
            />
        </div>
    );
} 