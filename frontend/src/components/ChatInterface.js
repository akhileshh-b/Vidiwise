import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface({ videoId }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || loading) return;

        setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/start-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    videoId: videoId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, {
                type: 'assistant',
                content: data.message
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Failed to get response. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const formatMessage = (content) => {
        let formattedContent = content;
        
        // Handle tables
        if (content.includes('|')) {
            const lines = content.split('\n');
            let inTable = false;
            let isHeader = true;  // First row of table is header
            
            const formattedLines = lines.map(line => {
                if (line.trim().startsWith('|')) {
                    inTable = true;
                    const cells = line.split('|').filter(cell => cell.trim());
                    const formattedCells = cells.map(cell => {
                        // Clean the cell content
                        let cleanCell = cell.trim()
                            .replace(/<strong>|<\/strong>/g, '')
                            .replace(/\*\*/g, '')
                            .trim();
                            
                        return cleanCell;
                    });

                    // Create table row with appropriate styling
                    const rowContent = formattedCells.map(cell => 
                        `<td class="${isHeader ? 'font-bold bg-dark-800' : ''} px-3 py-2 border border-dark-600">${cell}</td>`
                    ).join('');
                    
                    isHeader = false; // After first row, rest are normal rows
                    return `<tr>${rowContent}</tr>`;
                }
                if (inTable && !line.trim()) {
                    inTable = false;
                    isHeader = true; // Reset for potential next table
                }
                return line;
            });

            // Wrap table content in table tags
            let tableContent = formattedLines.join('\n');
            if (tableContent.includes('<tr>')) {
                tableContent = `<table class="min-w-full divide-y divide-dark-600 my-4 border-collapse">${tableContent}</table>`;
            }
            formattedContent = tableContent;
        }

        // Clean up any remaining formatting
        formattedContent = formattedContent
            .replace(/<strong>|<\/strong>/g, '') // Remove strong tags
            .replace(/\*\*/g, '')  // Remove markdown bold
            .replace(/`([^`]+)`/g, '<span class="bg-dark-800 px-1 rounded font-mono">$1</span>') // Format code
            .replace(/^- /gm, '• '); // Convert bullet points

        // Wrap paragraphs that aren't part of tables
        formattedContent = formattedContent
            .split('\n')
            .map(line => {
                if (!line.trim()) return '';
                if (line.includes('<table') || line.includes('<tr') || line.includes('<td')) {
                    return line;
                }
                return `<p class="my-2">${line}</p>`;
            })
            .join('\n');

        return formattedContent;
    };

    return (
        <div className="flex-1 flex flex-col h-[80vh] glass-effect rounded-xl">
            <div className="p-4 border-b border-dark-700">
                <h2 className="text-lg font-semibold text-dark-50">Chat Assistant</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                                message.type === 'user'
                                    ? 'bg-accent-primary text-white'
                                    : 'bg-dark-700 text-dark-50'
                            }`}
                        >
                            {message.type === 'assistant' ? (
                                <div 
                                    className="prose prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ 
                                        __html: formatMessage(message.content) 
                                    }}
                                />
                            ) : (
                                <p>{message.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-dark-700">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 input-dark"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                            'Send'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}