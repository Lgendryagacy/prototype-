import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Send, Sparkles, LoaderCircle, Check, CheckCheck } from 'lucide-react';
import { fullFogServiceBrands, brandMessages as initialMessages } from '../constants';
import { type Route } from '../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

type Message = {
    id: number;
    sender: 'me' | 'brand';
    text: string;
    time: string;
    status?: 'sent' | 'delivered' | 'read';
};

const ReadReceipt = ({ status }: { status: Message['status'] }) => {
    if (!status) return null;

    return (
        <div className="relative w-4 h-4">
            <AnimatePresence initial={false}>
                {status === 'sent' && (
                    <motion.div
                        key="sent"
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Check size={16} className="text-[--color-text-secondary]" />
                    </motion.div>
                )}
                {status === 'delivered' && (
                    <motion.div
                        key="delivered"
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CheckCheck size={16} className="text-[--color-text-secondary]" />
                    </motion.div>
                )}
                {status === 'read' && (
                    <motion.div
                        key="read"
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CheckCheck size={16} className="text-blue-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MessageBrandPage = ({ navigate, context }: { navigate: (route: Route, context?: any, options?: { name?: string }) => void; context?: { brandId: number } }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages.map((m, i) => ({...m, id: i, sender: m.sender as 'me' | 'brand'})));
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isBrandTyping, setIsBrandTyping] = useState(false);

    const brand = fullFogServiceBrands.find(b => b.id === context?.brandId);

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages, isBrandTyping]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            sender: 'me',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
        };

        setMessages(prev => [...prev, userMessage]);
        setSmartReplies([]);

        setTimeout(() => {
            setMessages(prev => prev.map((m): Message => m.id === userMessage.id ? { ...m, status: 'delivered' } : m));
        }, 600);

        setIsBrandTyping(true);

        setTimeout(() => {
            setIsBrandTyping(false);
            setMessages(prev => {
                const newMessages = prev.map((m): Message => m.id === userMessage.id ? { ...m, status: 'read' } : m);
                const brandReply: Message = {
                    id: Date.now() + 1,
                    sender: 'brand',
                    text: 'Thanks for that! Let me check on the details for you.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                return [...newMessages, brandReply];
            });
        }, 2500);
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(newMessage);
        setNewMessage('');
    };

    const handleSmartReplyClick = (reply: string) => {
        handleSendMessage(reply);
    };
    
    const generateSmartReplies = async () => {
        setIsGenerating(true);
        setError(null);
        setSmartReplies([]);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is missing.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const conversationHistory = messages
                .slice(-6) // Take the last 6 messages for context
                .map(msg => `${msg.sender === 'me' ? 'User' : 'Brand'}: ${msg.text}`)
                .join('\n');
            
            const prompt = `
                Based on the following conversation history between a user and a service brand on FOGSLY, generate 3 short, relevant, and helpful quick replies for the User. The replies should be based on the last message from the Brand.

                Conversation History:
                ---
                ${conversationHistory}
                ---

                Provide ONLY a valid JSON object with a key "replies" which is an array of strings. For example: {"replies": ["First reply", "Second reply", "Third reply"]}. Do not include any other text or markdown formatting.
            `;

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // The response text might contain markdown like ```json ... ```
            let jsonStr = response.text.trim();
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
            } else if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
            }

            const parsed = JSON.parse(jsonStr);
            if (parsed.replies && Array.isArray(parsed.replies)) {
                setSmartReplies(parsed.replies.slice(0, 3)); // Ensure only 3 replies
            } else {
                throw new Error("Invalid response format from AI.");
            }

        } catch (err) {
            console.error("Error generating smart replies:", err);
            setError("Couldn't generate suggestions. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };


    if (!brand) {
        return (
             <div className="bg-[--color-bg-secondary] min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Brand not found!</h1>
                 <Button variant="ghost" onClick={() => navigate('fog-services')} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Brands
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-10">
                 <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => navigate('fog-service-brand', brand.id, { name: brand.name })}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Brand Page
                        </Button>
                    </div>
                    <Card className="h-[calc(100vh-200px)] flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[--color-bg-tertiary] flex-shrink-0 flex items-center justify-center font-bold text-xl text-[--color-text-secondary]">
                                    {brand.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <CardTitle>{brand.name}</CardTitle>
                                    <CardDescription>Typically replies within a few hours</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                             {messages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'brand' && <div className="w-8 h-8 rounded-full bg-[--color-bg-tertiary] flex-shrink-0 flex items-center justify-center text-sm font-bold text-[--color-text-secondary]">{brand.name.split(' ').map(n => n[0]).join('')}</div>}
                                    <div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`max-w-md p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-[--color-primary] text-white rounded-br-lg' : 'bg-[--color-card] border border-[--color-border] rounded-bl-lg'}`}
                                        >
                                            <p>{msg.text}</p>
                                        </motion.div>
                                        {msg.sender === 'me' ? (
                                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                                <p className="text-xs text-[--color-text-secondary]">{msg.time}</p>
                                                <ReadReceipt status={msg.status} />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[--color-text-secondary] mt-1">{msg.time}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isBrandTyping && (
                                <div className="flex items-end gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[--color-bg-tertiary] flex-shrink-0 flex items-center justify-center text-sm font-bold text-[--color-text-secondary]">
                                        {brand.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-3 rounded-2xl bg-[--color-card] border border-[--color-border] rounded-bl-lg"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="p-4 border-t border-[--color-border] flex-shrink-0 space-y-3">
                             <div className="flex gap-2 overflow-x-auto pb-2 min-h-[40px] items-center">
                                {isGenerating ? (
                                    <Button variant="outline" size="sm" className="flex-shrink-0" disabled>
                                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </Button>
                                ) : error ? (
                                    <p className="text-xs text-red-500">{error}</p>
                                ) : smartReplies.length > 0 ? (
                                    smartReplies.map((reply, index) => (
                                        <Button key={index} variant="outline" size="sm" className="flex-shrink-0" onClick={() => handleSmartReplyClick(reply)}>
                                            {reply}
                                        </Button>
                                    ))
                                ) : (
                                    <Button variant="outline" size="sm" className="flex-shrink-0" onClick={generateSmartReplies}>
                                        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                                        Suggest Replies
                                    </Button>
                                )}
                            </div>
                            <form onSubmit={handleFormSubmit} className="flex items-center gap-4">
                                <Input 
                                    placeholder="Type your message..." 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon"><Send /></Button>
                            </form>
                        </div>
                    </Card>
                 </div>
            </div>
        </div>
    );
};

export default MessageBrandPage;