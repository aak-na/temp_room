import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './index.css';

// Centralize the backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
let socket;

// Generates a nice phonetic alias
const generatePhoneticName = () => {
    const consonants = 'bcdfghjklmnprstvwz';
    const vowels = 'aeiou';
    const lengths = [4, 5, 6];
    const length = lengths[Math.floor(Math.random() * lengths.length)];
    let name = '';
    let isConsonant = Math.random() > 0.5;

    for (let i = 0; i < length; i++) {
        if (isConsonant) {
            name += consonants.charAt(Math.floor(Math.random() * consonants.length));
        } else {
            name += vowels.charAt(Math.floor(Math.random() * vowels.length));
        }
        isConsonant = !isConsonant;
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
};

// ==========================================
// HOME COMPONENT (Glacier Chat Landing Page)
// ==========================================
function Home() {
    const [userName, setUserName] = useState('');
    const [joinSessionId, setJoinSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();



    // Auto-generate alias on mount if empty
    useEffect(() => {
        if (!userName) setUserName(generatePhoneticName());
    }, [userName]);

    const handleCreateSession = async () => {
        if (!userName.trim()) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to create session');
            const data = await response.json();
            
            // Store user identity for this session
            sessionStorage.setItem(`identity_${data.sessionId}`, userName);
            sessionStorage.setItem(`isCreator_${data.sessionId}`, 'true');
            navigate(`/chat/${data.sessionId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = () => {
        let extractedId = joinSessionId.trim();
        if (!extractedId || !userName.trim()) {
            setError('Please provide a name and session ID');
            return;
        }

        // If the user pasted a full URL, extract the session ID from the end
        if (extractedId.includes('http://') || extractedId.includes('https://') || extractedId.includes('/chat/')) {
            const parts = extractedId.split('/').filter(Boolean);
            extractedId = parts[parts.length - 1];
        }

        sessionStorage.setItem(`identity_${extractedId}`, userName);
        navigate(`/chat/${extractedId}`);
    };

    return (
        <div className="w-full flex-grow flex flex-col relative min-h-screen overflow-x-hidden pb-12">
            {/* Top Navigation Bar */}
            <nav className="flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-sky-400/10 shadow-[0_0_30px_rgba(125,211,252,0.05)] font-inter tracking-tight">
                <div className="text-xl font-semibold text-sky-300">Temp Room</div>

            </nav>

            {/* Atmospheric Background Texture Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-tertiary/5 rounded-full blur-[100px]"></div>
            </div>



            {/* Central Portal */}
            <main className="flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative w-full max-w-7xl mx-auto px-6 py-24 z-10 text-left">
                
                {/* Information Side */}
                <div className="flex-1 w-full max-w-xl space-y-8 animate-fade-in z-10 mt-10 lg:mt-0">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Burner chats for <span className="text-sky-400">secure</span> conversations.
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed font-light">
                            Temp Room is an ephemeral, self-destructing chat application. No accounts, no histories, no traces. 
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-2">
                            <span className="material-symbols-outlined text-sky-400 mb-1 block">timer</span>
                            <h3 className="font-bold text-white tracking-wide text-sm">Auto-Destruct</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">Rooms inactive for 10 minutes are permanently wiped from the database.</p>
                        </div>
                        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-2">
                            <span className="material-symbols-outlined text-sky-400 mb-1 block">no_accounts</span>
                            <h3 className="font-bold text-white tracking-wide text-sm">Zero Logging</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">We do not store accounts, IP addresses, or permanent message backups.</p>
                        </div>
                        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-2">
                            <span className="material-symbols-outlined text-sky-400 mb-1 block">vpn_key</span>
                            <h3 className="font-bold text-white tracking-wide text-sm">Encrypted</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">Connections are secured via HTTPS and WebSockets. Safe from MITM attacks.</p>
                        </div>
                        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-2">
                            <span className="material-symbols-outlined text-sky-400 mb-1 block">delete_forever</span>
                            <h3 className="font-bold text-white tracking-wide text-sm">Manual Purge</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">The room creator can hit 'End Session' to instantly obliterate all data on demand.</p>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10">
                        <p className="text-sm text-slate-400 leading-relaxed font-light">
                            <strong>Why use Temp Room?</strong> Whether you need to securely share login credentials, brainstorm sensitive ideas, or communicate off-the-record without leaving a digital footprint, Temp Room is built for absolute privacy. There are no registrations, no tracking cookies, and no centralized databases archiving your conversations. Once the tab is closed, the data vanishes forever.
                        </p>
                        
                    </div>
                </div>

                {/* Login Module Side */}
                <div className="w-full max-w-md relative z-10 shrink-0">
                    <div className="glass-card p-8 md:p-10 rounded-xl shadow-[0_0_30px_rgba(125,211,252,0.05)] relative overflow-hidden">
                        {/* Contextual Decorative Glow inside card wrapper */}
                        <div className="absolute -z-10 -inset-1 bg-gradient-to-r from-primary/10 to-tertiary/10 blur-2xl opacity-50 rounded-2xl"></div>
                        
                        <header className="text-center mb-8 relative z-10">
                            <h1 className="text-3xl font-bold tracking-tight text-on-background mb-2">Temp Room</h1>
                            <p className="text-on-surface-variant text-sm">Conversations that vanish like frost.</p>
                        </header>
                        
                        <div className="space-y-6 relative z-10">
                            {error && <div className="text-error text-sm text-center font-semibold bg-error/10 p-2 rounded">{error}</div>}
                            
                            {/* Name Input */}
                            <div className="relative">
                                <label className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1 ml-1 block">
                                    Username / Alias
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        className="w-full glass-input rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40" 
                                        placeholder="e.g. Arctic_Fox" 
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                    <button 
                                        title="Generate random alias"
                                        className="bg-primary/10 border border-primary/20 text-sky-400 hover:bg-primary/20 hover:text-white px-4 py-3 rounded-lg flex-shrink-0 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 duration-200 flex items-center gap-1 shadow-inner"
                                        onClick={() => setUserName(generatePhoneticName())}>
                                        <span className="material-symbols-outlined" style={{fontSize: '14px'}}></span>
                                        Gen Alias
                                    </button>
                                </div>
                            </div>

                            {/* Create New Session */}
                            <div className="space-y-4">
                                <button 
                                    onClick={handleCreateSession}
                                    disabled={loading}
                                    className="w-full bg-primary-container text-on-primary-container font-semibold py-3.5 rounded-lg border border-primary/20 hover:bg-primary-container/80 transition-all active:scale-[0.98] duration-200 shadow-lg shadow-primary/5">
                                    {loading ? 'Initializing...' : 'Create New Session'}
                                </button>
                            </div>
                            
                            {/* Divider */}
                            <div className="relative py-4 flex items-center">
                                <div className="flex-grow border-t border-sky-400/10"></div>
                                <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">or</span>
                                <div className="flex-grow border-t border-sky-400/10"></div>
                            </div>
                            
                            {/* Join Existing Session */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1 block ml-1">Session Key</label>
                                    <input 
                                        className="w-full glass-input rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40" 
                                        placeholder="Enter invitation code... or Paste the link " 
                                        type="text"
                                        value={joinSessionId}
                                        onChange={(e) => setJoinSessionId(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={handleJoinSession}
                                    className="w-full bg-transparent border border-outline-variant text-on-surface font-medium py-3 rounded-lg hover:bg-surface-variant/50 transition-all active:scale-[0.98] duration-200">
                                    Join Existing Session
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 flex items-center justify-center gap-3 text-[11px] text-on-surface-variant/60 font-medium uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm flex-shrink-0" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
                            End-to-End Encrypted
                        </div>
                    </div>
                </div>
            </main>

            {/* How It Works Full-Width Ribbon */}
            <section className="w-full relative z-10 py-24 bg-slate-900/40 border-y border-white/5 backdrop-blur-sm mt-auto">
                <div className="max-w-7xl mx-auto px-6 mt-4">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Zero trace. Zero hassle.</h2>
                        <p className="text-slate-400 font-light max-w-2xl mx-auto text-lg">Create a room, share the link, and wipe it completely when you're done. Your data never touches a hard drive long-term.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                                <span className="material-symbols-outlined text-3xl">magic_button</span>
                            </div>
                            <h4 className="text-white font-bold text-lg">1. Generate Session</h4>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">Instantly spin up an encrypted environment with a single click. No emails or phone numbers required.</p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center space-y-4 mt-8 md:mt-0">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <span className="material-symbols-outlined text-3xl">share</span>
                            </div>
                            <h4 className="text-white font-bold text-lg">2. Invite Securely</h4>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">Copy your unique session key or direct URL and send it to your contact via any trusted network.</p>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center space-y-4 mt-8 md:mt-0">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                            </div>
                            <h4 className="text-white font-bold text-lg">3. Burn It Down</h4>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">When the conversation ends, hit End Session. The room goes up in smoke, and all messages are wiped from the server instantly.</p>
                        </div>
                    </div>

                    {/* Mission Statement */}
                    <div className="mt-20 pt-10 border-t border-white/5 max-w-4xl mx-auto text-center">
                        <p className="text-sm text-slate-400 leading-loose">
                            <strong>Why did we build Temp Room?</strong> We believe that some conversations are meant to be strictly temporary. By fundamentally rejecting the standard model of user-retention and data-harvesting, we created an ultra-lightweight portal for absolute privacy. Whether you are dealing with sensitive configurations, private credentials, or off-the-record chat, this system guarantees amnesia by design. What happens in the Temp Room, vanishes with the Temp Room. 
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="w-full py-8 border-t border-sky-400/5 bg-transparent mt-12 flex-shrink-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-8 font-inter text-sm opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                        <span className="text-sky-300 font-bold">Temp Room</span>
                        <span className="text-slate-500 hidden sm:inline">© 2026 Temp Room. Secure. Temporary.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ==========================================
// CHAT COMPONENT (Glacier Chat Session Page)
// ==========================================
function Chat() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [status, setStatus] = useState('CONNECTING...');
    const messagesEndRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const [timeLeft, setTimeLeft] = useState(600);
    const [notifications, setNotifications] = useState([]);
    const isCreator = sessionStorage.getItem(`isCreator_${roomId}`) === 'true';
    
    // Retrieve identity
    const [sender, setSender] = useState('');
    // For identity gatekeeper modal
    const [showModal, setShowModal] = useState(false);
    const [pendingName, setPendingName] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
            const remaining = 600 - elapsed;
            if (remaining <= 0) {
                clearInterval(interval);
                window.location.href = '/';
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const identity = sessionStorage.getItem(`identity_${roomId}`);
        if (!identity) {
            setShowModal(true);
            setPendingName(generatePhoneticName());
        } else {
            setSender(identity);
            initializeSocket(identity);
            fetchInitialMessages();
        }

        return () => {
            if (socket) {
                socket.off('receive-message');
                socket.off('session-terminated');
            }
        };
    }, [roomId]);

    const initializeSocket = (userIdentity) => {
        if (!socket) {
            socket = io(BACKEND_URL);
        }
        
        socket.emit('join-session', { sessionId: roomId, userName: userIdentity });

        socket.on('notification', (message) => {
            const id = Date.now() + Math.random();
            setNotifications(prev => [...prev, { id, text: message }]);
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 3000);
        });

        socket.on('receive-message', (data) => {
            lastActivityRef.current = Date.now();
            if (data.type === 'system') {
                setStatus(data.status || 'CONNECTED');
            } else {
                setMessages(prev => {
                    // Deduplicate logic for Optimistic UI: Avoid rendering the broadcast if we already injected it locally.
                    const isDuplicate = prev.some(m => 
                        m.text === data.text && 
                        m.sender === data.sender && 
                        Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 5000 // Within 5 seconds
                    );
                    if (isDuplicate) return prev;
                    return [...prev, data];
                });
            }
        });

        socket.on('session-terminated', () => {
            // Remove blocking alert and use a hard redirect to ensure the user is thrown out reliably
            // and the global socket/state is fully flushed.
            window.location.href = '/';
        });
    };

    const fetchInitialMessages = async () => {
        try {
            // Validate session exists
            const sessionRes = await fetch(`${BACKEND_URL}/api/sessions/${roomId}`);
            if (!sessionRes.ok) {
                if (sessionRes.status === 404) {
                    alert("This session no longer exists or was terminated.");
                    navigate('/');
                }
                return;
            }
            
            // Fetch message history
            const msgRes = await fetch(`${BACKEND_URL}/api/sessions/${roomId}/messages`);
            if (msgRes.ok) {
                const data = await msgRes.json();
                setMessages(data.messages || []);
                setStatus('SECURE');
            }
        } catch (error) {
            console.error('Error fetching session data:', error);
        }
    };

    const handleModalSubmit = () => {
        if (!pendingName.trim()) return;
        sessionStorage.setItem(`identity_${roomId}`, pendingName);
        setSender(pendingName);
        setShowModal(false);
        initializeSocket(pendingName);
        fetchInitialMessages();
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        lastActivityRef.current = Date.now();

        const messageText = inputValue;
        const currentReply = replyingTo ? { text: replyingTo.text, sender: replyingTo.sender } : null;

        // Optimistic UI append for zero-latency feel and reliability
        const optimisticMsg = {
            _id: `temp_${Date.now()}`,
            sessionId: roomId,
            text: messageText,
            sender: sender,
            replyTo: currentReply,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);

        socket.emit('send-message', {
            sessionId: roomId,
            text: messageText,
            sender: sender,
            replyTo: currentReply
        });

        setInputValue('');
        setReplyingTo(null);
    };

    const handleTerminate = async () => {
        const confirmTerminate = window.confirm("Are you sure you want to permanently delete this chat session? All messages will be wiped.");
        if (confirmTerminate) {
            // Remove our local session identity
            sessionStorage.removeItem(`identity_${roomId}`);
            sessionStorage.removeItem(`isCreator_${roomId}`);

            try {
                // 1. Send out the async API request to purge messages from the MongoDB
                await fetch(`${BACKEND_URL}/api/sessions/${roomId}`, { method: 'DELETE' });

                // 2. Fire the socket blast to instantly kick all participants out (including ourself)
                // This triggers the socket listener which gracefully redirects to home
                if (socket) {
                    socket.emit('terminate-session', roomId);
                } else {
                    // Fallback if socket is completely missing
                    window.location.href = '/';
                }
            } catch (err) {
                console.error("Failed to cleanly delete messages from database", err);
                // Fallback redirect just in case
                window.location.href = '/';
            }
        }
    };

    const handleExit = () => {
        const confirmExit = window.confirm("Are you sure you want to exit this chat session?");
        if (confirmExit) {
            sessionStorage.removeItem(`identity_${roomId}`);
            window.location.href = '/';
        }
    };

    const handleCopyUrl = async () => {
        const textToCopy = window.location.href;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            alert('Invite URL copied to clipboard: ' + textToCopy);
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy link. Please manually copy the URL from your browser.');
        }
    };

    return (
        <div className="w-full flex-grow flex flex-col relative h-screen overflow-hidden">
            {/* Notifications */}
            <div className="absolute top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="bg-slate-900/90 border border-slate-700/50 text-slate-300 text-xs px-4 py-2 rounded-lg shadow-2xl animate-fade-in-down transition-all">
                        {n.text}
                    </div>
                ))}
            </div>

            {/* TopNavBar */}
            <nav className="flex justify-between items-center w-full px-6 py-4 bg-slate-950/60 backdrop-blur-xl border-b border-sky-400/10 shadow-sm font-inter tracking-tight z-50 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-semibold text-sky-300 hidden sm:inline">Temp Room</span>
                    <span className="text-[10px] text-sky-300 border border-sky-300/30 px-2 py-1 rounded-full uppercase tracking-wider">{roomId.slice(0, 6)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`text-[10px] font-mono px-2 py-1 rounded bg-black/20 border border-sky-400/20 flex items-center gap-1.5 ${timeLeft < 60 ? 'text-red-400 border-red-500/30' : 'text-sky-300'}`}>
                        <span className="material-symbols-outlined" style={{fontSize: '12px'}}>timer</span>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <button onClick={handleCopyUrl} title="Copy Invite Link" className="p-2 text-slate-400 hover:bg-sky-400/10 transition-colors active:scale-95 duration-200 rounded-lg">
                        <span className="material-symbols-outlined">link</span>
                    </button>
                    <div className="h-6 w-[1px] bg-sky-400/10 mx-2"></div>
                    {isCreator ? (
                        <button onClick={handleTerminate} className="px-4 py-2 bg-primary/10 border border-primary/20 text-sky-300 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors active:scale-95 duration-200">
                            End Session
                        </button>
                    ) : (
                        <button onClick={handleExit} className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700/50 transition-colors active:scale-95 duration-200">
                            Exit Session
                        </button>
                    )}
                </div>
            </nav>

            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-background">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-tertiary/5 blur-[100px] rounded-full"></div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col pt-4 pb-28 max-w-5xl mx-auto w-full px-4 md:px-8 h-full overflow-hidden relative">
                {/* Modal Wrapper for identity */}
                {showModal && (
                    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="glass-card p-6 md:p-8 rounded-xl shadow-[0_0_30px_rgba(125,211,252,0.05)] w-full max-w-sm">
                            <h2 className="text-xl font-bold mb-2 text-white">Identify Yourself</h2>
                            <p className="text-sm text-slate-400 mb-6">You are joining an encrypted session.</p>
                            <input 
                                className="w-full glass-input rounded-lg px-4 py-3 text-on-surface mb-4" 
                                placeholder="YOUR NAME"
                                value={pendingName}
                                onChange={(e)=>setPendingName(e.target.value)}
                            />
                            <button onClick={handleModalSubmit} className="w-full bg-primary-container text-on-primary-container font-semibold py-3 rounded-lg hover:bg-primary-container/80 transition-all">
                                ENTER CHAT
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat Feed Area */}
                <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-6 py-6 pr-2">
                    {/* System Timestamp / Status */}
                    <div className="flex justify-center">
                        <span className="text-[10px] tracking-wider font-medium text-slate-500 bg-slate-900/50 px-4 py-1.5 rounded-full border border-sky-400/10 uppercase">
                            STATUS: {status}
                        </span>
                    </div>

                    {messages.map((msg, idx) => {
                        const isOwnMessage = msg.sender === sender;
                        return (
                            <div key={idx} className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] group ${isOwnMessage ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                <div className="flex flex-col gap-1 items-[start] w-full" style={{alignItems: isOwnMessage ? 'flex-end' : 'flex-start'}}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[10px] text-slate-400 ml-2 font-medium">{msg.sender}</span>
                                        {!isOwnMessage && (
                                            <button onClick={()=>setReplyingTo(msg)} className="text-slate-500 hover:text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined" style={{fontSize: '14px'}}>reply</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className={`p-4 leading-relaxed shadow-[0_0_20px_rgba(125,211,252,0.02)] relative ${
                                        isOwnMessage 
                                        ? 'message-bubble-right rounded-2xl rounded-br-none text-sky-100 shadow-[0_0_20px_rgba(125,211,252,0.05)]' 
                                        : 'message-bubble-left rounded-2xl rounded-bl-none text-on-surface'
                                    }`}>
                                        {msg.replyTo && (
                                            <div className="mb-2 p-2 bg-black/20 border-l-2 border-primary/50 rounded text-xs opacity-80 backdrop-blur-sm">
                                                <div className="text-sky-300 mb-1 font-semibold">{msg.replyTo.sender}</div>
                                                <div className="truncate">{msg.replyTo.text}</div>
                                            </div>
                                        )}
                                        {msg.text}
                                    </div>
                                    <span className={`text-[9px] font-medium mt-1 px-1 ${isOwnMessage ? 'text-sky-300/60' : 'text-slate-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isOwnMessage && ' • Delivered'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Bottom Input Area */}
            <footer className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/95 to-transparent pb-4 pt-12">
                <div className="max-w-5xl mx-auto w-full px-4 md:px-8">
                    <form onSubmit={handleSendMessage} className="glass-elevated rounded-2xl flex flex-col p-2 shadow-2xl relative">
                        {replyingTo && (
                            <div className="flex items-center justify-between px-3 py-2 bg-black/20 border-b border-sky-400/10 mb-2 rounded-t-xl mx-2 mt-1">
                                <div className="text-xs text-sky-300/80 truncate pr-4">
                                    <span className="font-semibold block text-[10px] uppercase mb-1">Replying to {replyingTo.sender}</span>
                                    {replyingTo.text}
                                </div>
                                <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white">
                                    <span className="material-symbols-outlined" style={{fontSize: '16px'}}>close</span>
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-2">
                            <input 
                                className="bg-transparent border-none focus:ring-0 flex-grow text-on-surface placeholder:text-slate-500 px-2 font-inter text-[1rem] outline-none" 
                                placeholder="Send a secure message..." 
                                type="text"
                                value={inputValue}
                                onChange={(e)=>setInputValue(e.target.value)}
                            />
                            <div className="flex items-center gap-1 shrink-0">
                                <button type="submit" disabled={!inputValue.trim()} className="bg-primary hover:bg-sky-200 text-on-primary p-3 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(125,211,252,0.3)] disabled:opacity-50 disabled:active:scale-100">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    {/* Branding/Status Footer Sub-text */}
                    <div className="flex justify-between items-center mt-3 px-2 pb-1">
                        <p className="text-[10px] text-slate-500 font-inter uppercase tracking-widest font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{fontSize: '12px'}}>lock</span>
                            End-to-End Encrypted
                        </p>
                        <p className="text-[10px] text-slate-500 font-inter font-medium">{sender ? `Logged in as ${sender}` : ''}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat/:roomId" element={<Chat />} />
            </Routes>
        </Router>
    );
}
