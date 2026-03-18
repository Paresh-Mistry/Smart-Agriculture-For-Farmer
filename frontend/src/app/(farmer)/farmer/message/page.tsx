"use client"

import { useState, useEffect, useRef, useMemo } from 'react';
import {
    ChevronDown, MessageCircle, Users, MoreVertical,
    Paperclip, Send, Star, Download, Building2
} from 'lucide-react';
import { AutoTranslate } from '@component/components/common/AutoTranslate';
import { Button } from '@component/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@component/components/ui/table';
import { useCurrentUser } from '@component/hooks/queries/useAuth';

type Msg = {
    from: string;
    to: string;
    message: string;
    time: string;
    timestamp: number;
};

type Conversation = {
    id: number;
    name: string;
    company: string;
    avatar: string;
    buyerName: string;
    rating: number;
    avatarBg: string;
    date: string;
    sellersince: string;
    headquarter: string;
    receiverId: string;
};

export default function MessagingInterface() {
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Record<number, Msg[]>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [debugLog, setDebugLog] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data: user } = useCurrentUser();
    const myId = user?.id?.toString();

    // Helper function to add debug logs
    const addDebugLog = (message: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, data || '');
        setDebugLog(prev => [...prev.slice(-20), logMessage]);
    };

    useEffect(() => {
        addDebugLog("Component mounted/updated", { myId });
    }, [myId]);

    // 🔥 CRITICAL FIX: Dynamic conversations based on logged-in user
    // Define your test user IDs here
    const USER_A_ID = "7d577d72-4704-48d1-a0f2-763c02f04533"; // Normal tab
    const USER_B_ID = "7b1fb094-87ce-45e7-b16a-ec2dd0eea5b0"; // Incognito tab

    // Use useMemo to avoid recreating conversations on every render
    const conversations: Conversation[] = useMemo(() => {
        if (!myId) return [];

        // Determine the OTHER user (the one I'm chatting with)
        const isUserA = myId === USER_A_ID;
        const otherUserId = isUserA ? USER_B_ID : USER_A_ID;
        const otherUserName = isUserA ? "User B (Incognito)" : "User A (Normal)";

        addDebugLog(`🔧 Setting up conversation: Me=${myId.substring(0, 10)}..., Other=${otherUserId.substring(0, 10)}...`);

        return [
            {
                id: 1,
                name: otherUserName,
                company: 'UpTricks Solutions',
                avatar: '🌾',
                buyerName: 'John Doe',
                rating: 4.5,
                avatarBg: 'bg-orange-100',
                date: '7 Oct 2025',
                sellersince: '9 years 6 months',
                headquarter: 'Rajkot, India',
                receiverId: otherUserId // KEY: Always points to the OTHER user
            },
        ];
    }, [myId]);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedChat]);

    // WebSocket Connection with reconnection logic
    useEffect(() => {
        if (!myId) {
            addDebugLog("⏳ Waiting for user ID...");
            return;
        }

        if (conversations.length === 0) {
            addDebugLog("⏳ Waiting for conversations to be set up...");
            return;
        }

        const connectWebSocket = () => {
            try {
                addDebugLog(`🔌 Attempting WebSocket connection for user: ${myId}`);
                const wsUrl = `ws://localhost:8000/ws/${myId}`;
                addDebugLog(`🔗 WebSocket URL: ${wsUrl}`);

                const socket = new WebSocket(wsUrl);
                socketRef.current = socket;

                socket.onopen = () => {
                    addDebugLog(`✅ WebSocket CONNECTED for user: ${myId}`);
                    setIsConnected(true);

                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                    }
                };

                socket.onmessage = (event) => {
                    addDebugLog("📨 RAW WebSocket message received");
                    console.log("📨 Raw event.data:", event.data);

                    try {
                        const data = JSON.parse(event.data);
                        addDebugLog("📦 PARSED message data", data);
                        console.log("📦 Full parsed data:", JSON.stringify(data, null, 2));

                        addDebugLog(`🔍 Message details - from: ${data.from}, to: ${data.to}, message: ${data.message}`);

                        if (!data.message) {
                            addDebugLog("❌ ERROR: Message field is missing!", data);
                            return;
                        }

                        if (!data.from) {
                            addDebugLog("❌ ERROR: From field is missing!", data);
                            return;
                        }

                        addDebugLog(`🔍 My ID: ${myId}`);
                        addDebugLog(`🔍 Checking against ${conversations.length} conversation(s)`);

                        conversations.forEach((conv, index) => {
                            addDebugLog(`🔍 Conv[${index}] - ID: ${conv.id}, ReceiverID: ${conv.receiverId}`);
                            addDebugLog(`🔍 Conv[${index}] - Match check: data.from(${data.from}) === receiverId(${conv.receiverId})? ${data.from === conv.receiverId}`);
                        });

                        let conversationId: number | undefined;

                        for (const conv of conversations) {
                            addDebugLog(`🔍 Checking conversation ${conv.id} (${conv.name}) | ${conv.receiverId} against message from: ${data.from} and to: ${data.to}`);

                            // Case 1: Incoming message - from the other user
                            if (conv.receiverId === data.from) {
                                conversationId = conv.id;
                                addDebugLog(`✅ MATCH FOUND (Incoming): Message FROM ${data.from} matches conversation ${conv.id}`);
                                break;
                            }

                            // Case 2: Outgoing message echo - my message being echoed back
                            if (conv.receiverId === data.to && data.from === myId) {
                                conversationId = conv.id;
                                addDebugLog(`✅ MATCH FOUND (Outgoing Echo): Message TO ${data.to} from ME(${myId}) matches conversation ${conv.id}`);
                                break;
                            }
                        }

                        addDebugLog('Determined conversation ID:', conversationId || "None");

                        if (!conversationId) {
                            addDebugLog(`❌ NO CONVERSATION MATCH FOUND!`);
                            addDebugLog(`❌ Message: from=${data.from}, to=${data.to}`);
                            addDebugLog(`❌ My conversations expect: ${conversations.map(c => c.receiverId).join(', ')}`);
                            return;
                        }

                        addDebugLog(`✅ Message assigned to conversation ID: ${conversationId}`);

                        const newMsg: Msg = {
                            from: data.from,
                            to: data.to || myId,
                            message: data.message,
                            time: new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            timestamp: Date.now()
                        };

                        addDebugLog(`📝 Creating new message object`, newMsg);

                        setMessages(prev => {
                            const existingMessages = prev[conversationId!] || [];
                            addDebugLog(`📚 Existing messages in conv ${conversationId}: ${existingMessages.length}`);

                            // Avoid duplicate messages
                            const isDuplicate = existingMessages.some(
                                msg => {
                                    const sameMessage = msg.message === newMsg.message;
                                    const sameFrom = msg.from === newMsg.from;
                                    const closeTime = Math.abs(msg.timestamp - newMsg.timestamp) < 2000;

                                    if (sameMessage && sameFrom && closeTime) {
                                        addDebugLog(`⚠️ DUPLICATE detected: same message from same sender within 2 seconds`);
                                        return true;
                                    }
                                    return false;
                                }
                            );

                            if (isDuplicate) {
                                addDebugLog("⏭️ Skipping duplicate message");
                                return prev;
                            }

                            addDebugLog(`✅ Adding message to conversation ${conversationId}`);
                            const updated = {
                                ...prev,
                                [conversationId!]: [...existingMessages, newMsg]
                            };

                            addDebugLog(`📊 Updated messages state`, {
                                conversationId,
                                totalMessages: updated[conversationId!].length
                            });

                            return updated;
                        });
                    } catch (error) {
                        addDebugLog("❌ ERROR parsing WebSocket message", error);
                        console.error('Full error:', error);
                    }
                };

                socket.onerror = (error) => {
                    addDebugLog("❌ WebSocket ERROR", error);
                    console.error('WebSocket error details:', error);
                    setIsConnected(false);
                };

                socket.onclose = (event) => {
                    addDebugLog(`🔌 WebSocket CLOSED - Code: ${event.code}, Reason: ${event.reason}`);
                    setIsConnected(false);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        addDebugLog("🔄 Attempting to reconnect...");
                        connectWebSocket();
                    }, 3000);
                };
            } catch (error) {
                addDebugLog("❌ ERROR creating WebSocket", error);
                console.error('WebSocket creation error:', error);
                setIsConnected(false);
            }
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                addDebugLog("🔌 Closing WebSocket connection");
                socketRef.current.close();
            }
        };
    }, [myId, conversations]);

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedChat || !myId) {
            addDebugLog("❌ Cannot send - missing data", { messageText: !!messageText, selectedChat, myId });
            return;
        }

        const conv = conversations.find(c => c.id === selectedChat);
        if (!conv) {
            addDebugLog(`❌ No conversation found for ID: ${selectedChat}`);
            return;
        }

        const payload = {
            to: conv.receiverId,
            from: myId,
            message: messageText.trim()
        };

        addDebugLog("📤 SENDING message", payload);
        console.log("📤 Full send payload:", JSON.stringify(payload, null, 2));

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            try {
                socketRef.current.send(JSON.stringify(payload));
                addDebugLog("✅ Message SENT successfully via WebSocket");

                const newMsg: Msg = {
                    from: myId,
                    to: conv.receiverId,
                    message: messageText.trim(),
                    time: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    timestamp: Date.now()
                };

                addDebugLog("📝 Adding sent message to local state", newMsg);

                setMessages(prev => ({
                    ...prev,
                    [selectedChat]: [...(prev[selectedChat] || []), newMsg]
                }));

                setMessageText('');
            } catch (error) {
                addDebugLog("❌ ERROR sending message", error);
                console.error('Send error:', error);
                alert('Failed to send message. Please try again.');
            }
        } else {
            const state = socketRef.current?.readyState;
            addDebugLog(`❌ WebSocket NOT OPEN - State: ${state}`);
            alert('Connection lost. Please wait while we reconnect...');
        }
    };

    const selectedConversation = conversations.find(c => c.id === selectedChat);
    const chatMessages = messages[selectedChat || 0] || [];

    if (!user || !myId) {
        return (
            <AutoTranslate>
                <div className="flex h-[calc(100vh-86px)] items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading user data...</p>
                    </div>
                </div>
            </AutoTranslate>
        );
    }

    return (
        <AutoTranslate>
            <div className="flex h-[calc(100vh-86px)] overflow-hidden">

                {/* Debug Panel */}
                {/* <div className="w-80 border-r border-gray-300 bg-gray-900 text-green-400 overflow-y-auto p-4 font-mono text-xs">
                    <div className="sticky top-0 bg-gray-900 pb-2 border-b border-gray-700 mb-2">
                        <h3 className="font-bold text-sm text-white">🐛 Debug Console</h3>
                        <button
                            onClick={() => setDebugLog([])}
                            className="text-xs text-red-400 hover:text-red-300 mt-1"
                        >
                            Clear Logs
                        </button>
                    </div>
                    <div className="space-y-1">
                        <div className="text-yellow-400 mb-2">
                            <div>👤 My ID: {myId}</div>
                            <div>🎯 Other ID: {conversations[0]?.receiverId || 'N/A'}</div>
                            <div>🔌 Connected: {isConnected ? '✅ YES' : '❌ NO'}</div>
                            <div>💬 Selected: {selectedChat || 'None'}</div>
                            <div>📨 Messages: {chatMessages.length}</div>
                        </div>
                        {debugLog.map((log, i) => (
                            <div key={i} className="break-all">{log}</div>
                        ))}
                    </div>
                </div> */}

                {/* Sidebar */}
                <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
                    <div className="px-6 py-3 border-b bg-white">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#04a091]">Messages</h1>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                                    title={isConnected ? 'Connected' : 'Disconnected'} />
                                <span className="text-xs text-gray-500">
                                    {isConnected ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">My ID: {myId}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(conv => {
                            const lastMessage = messages[conv.id]?.[messages[conv.id]?.length - 1];

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => {
                                        setSelectedChat(conv.id);
                                        addDebugLog(`📱 Selected conversation ${conv.id}`);
                                    }}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors
                                        ${selectedChat === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-12 h-12 ${conv.avatarBg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                                            {conv.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{conv.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{conv.company}</p>
                                            <p className="text-xs text-gray-400 truncate">ID: {conv.receiverId.substring(0, 20)}...</p>
                                            {lastMessage && (
                                                <p className="text-xs text-gray-400 truncate mt-1">
                                                    {lastMessage.from === myId ? 'You: ' : ''}
                                                    {lastMessage.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                {!selectedChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                        <MessageCircle className="w-20 h-20 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
                        <p className="text-gray-400 text-sm mt-2">Your ID: {myId}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 flex flex-col bg-gray-50">

                            {/* Header */}
                            <div className="px-6 py-4 border-b bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${selectedConversation?.avatarBg} rounded-xl flex items-center justify-center text-xl`}>
                                        {selectedConversation?.avatar}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">{selectedConversation?.name}</h2>
                                        <p className="text-xs text-gray-500">{selectedConversation?.company}</p>
                                        <p className="text-xs text-gray-400">Receiver: {selectedConversation?.receiverId.substring(0, 30)}...</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {chatMessages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <p className="text-gray-400">No messages yet. Start the conversation!</p>
                                            <p className="text-xs text-gray-300 mt-2">
                                                You: {myId?.substring(0, 20)}...
                                            </p>
                                            <p className="text-xs text-gray-300">
                                                ↔ {selectedConversation?.receiverId.substring(0, 20)}...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, i) => {
                                        const mine = msg.from === myId;
                                        return (
                                            <AutoTranslate key={i}>
                                                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"} animate-fadeIn`}>
                                                    <div className={`px-4 py-3 rounded-2xl max-w-md text-sm shadow-sm
                                                ${mine
                                                            ? "bg-blue-600 text-white rounded-br-sm"
                                                            : "bg-white border border-gray-200 rounded-bl-sm"
                                                        }`}>
                                                        <div className="text-[10px] opacity-60 mb-1">
                                                            From: {msg.from.substring(0, 15)}...
                                                        </div>
                                                        <div className="break-words">{msg.message}</div>
                                                        <div className={`text-[10px] mt-1 text-right flex items-center gap-1 justify-end
                                                    ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            <span>{msg.time}</span>
                                                            {mine && <span>✓</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AutoTranslate>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-white border-t shadow-lg">
                                <div className="flex gap-2 items-end">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <textarea
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={1}
                                        style={{
                                            minHeight: '40px',
                                            maxHeight: '120px'
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={!isConnected}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageText.trim() || !isConnected}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Send
                                    </button>
                                </div>
                                {!isConnected && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-2">
                                        <span className="animate-pulse">●</span>
                                        Disconnected - Reconnecting...
                                    </p>
                                )}
                            </div>

                        </div>
                        <div className="w-80 bg-white border-l border-gray-200 p-6 hidden lg:block">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-gray-900">{selectedConversation?.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-400" />
                                        <span className="text-sm font-medium text-gray-900">{selectedConversation?.rating}</span>
                                    </div>
                                </div>

                                <Table className="w-full">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Buyer Name</TableCell>
                                            <TableCell>{selectedConversation?.buyerName}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Seller Since</TableCell>
                                            <TableCell>{selectedConversation?.sellersince}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Head Quarter</TableCell>
                                            <TableCell>{selectedConversation?.headquarter}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-bold text-gray-900 mb-2">Company Description</h4>
                                <p className="text-sm text-gray-700">
                                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt maiores culpa illum odit ab ducimus quam placeat nam. Doloremque asperiores dicta aliquam id amet commodi excepturi, et consectetur sapiente accusantium.
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <Button variant={"secondary"} className='w-full'>
                                    Accept Request
                                </Button>
                            </div>
                        </div>  
                    </>
                )}



            </div>
        </AutoTranslate>
    );
}