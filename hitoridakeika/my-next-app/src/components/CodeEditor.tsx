import React, { useEffect, useRef } from 'react';

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    isReadOnly?: boolean;
    language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    onChange,
    isReadOnly = false,
    language = 'javascript'
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            // テキストエリアの高さを自動調整
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [code]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isReadOnly) {
            onChange(e.target.value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            
            const newValue = code.substring(0, start) + '  ' + code.substring(end);
            onChange(newValue);
            
            // カーソル位置を調整
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 2;
            }, 0);
        }
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={code}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                readOnly={isReadOnly}
                className={`
                    w-full h-96 p-4 font-mono text-sm
                    bg-gray-900 text-green-400
                    border border-gray-700 rounded-lg
                    resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isReadOnly ? 'opacity-75 cursor-not-allowed' : ''}
                `}
                placeholder={`// ${language} コードをここに書いてください`}
                style={{
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    lineHeight: '1.5'
                }}
            />
            
            {isReadOnly && (
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    読み取り専用
                </div>
            )}
        </div>
    );
};

export default CodeEditor; 