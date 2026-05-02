import { useState, useRef, useEffect } from 'react'
import { 
  Loader2, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2,
  ArrowUp,
  MessageSquare,
  Trash2
} from 'lucide-react'
import type { PageId } from '../navigation'
import { chatGeneral, type ChatMessage } from '../lib/aiGateway'
import { 
  getChats, 
  getChatMessages, 
  createChat, 
  saveMessage, 
  deleteChat,
  type WsChat 
} from '../lib/chatData'

export default function ChatPage({ onPageChange }: { onPageChange?: (page: PageId) => void }) {
  void onPageChange
  const [chats, setChats] = useState<WsChat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Initial Load: Fetch Chat History
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      const data = await getChats()
      setChats(data)
      setIsLoading(false)
    }
    void loadHistory()
  }, [])

  // 2. Load Messages when Active Chat Changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([{ role: 'assistant', text: 'Hello! How can I assist you today?' }])
      return
    }

    const loadMessages = async () => {
      const data = await getChatMessages(activeChatId)
      if (data.length > 0) {
        setMessages(data)
      } else {
        setMessages([{ role: 'assistant', text: 'Hello! How can I assist you today?' }])
      }
    }
    void loadMessages()
  }, [activeChatId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const startNewChat = () => {
    setActiveChatId(null)
    setMessages([{ role: 'assistant', text: 'Hello! How can I assist you today?' }])
    setError(null)
    setInputText('')
  }

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteChat(id)
    setChats(prev => prev.filter(c => c.id !== id))
    if (activeChatId === id) startNewChat()
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || isTyping) return

    const userMsg = inputText.trim()
    setInputText('')
    setError(null)
    
    let chatId = activeChatId
    
    try {
      // 1. Create chat if it doesn't exist
      if (!chatId) {
        const newChat = await createChat(userMsg.slice(0, 30) + '...')
        if (!newChat) throw new Error('Failed to create chat session')
        chatId = newChat.id
        setActiveChatId(chatId)
        setChats(prev => [newChat, ...prev])
      }

      // 2. Save user message to DB
      await saveMessage(chatId, 'user', userMsg)

      // 3. Update local UI
      const updatedMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }]
      setMessages(updatedMessages)
      
      // 4. Start typing animation
      setIsTyping(true)

      // 5. Call AI Gateway
      const response = await chatGeneral(userMsg, updatedMessages)
      
      // 6. Save AI response to DB
      await saveMessage(chatId, 'assistant', response.reply)

      // 7. Update local UI
      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      console.error('Chat error:', err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Chat History Sidebar */}
      <div 
        className={`bg-surface border-r border-border flex flex-col transition-all duration-300 overflow-hidden ${
          isHistoryOpen ? 'w-72' : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Chat History</h2>
          <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
            <MessageSquare size={18} className="text-foreground-secondary" />
          </button>
        </div>

        <div className="px-4 mb-4">
          <div className="relative flex items-center bg-surface-hover border border-border rounded-xl px-3 h-10 group focus-within:border-brand-primary transition-all">
            <Search size={16} className="text-foreground-muted mr-2" />
            <input 
              type="text" 
              placeholder="Search Chats" 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground-muted"
              onChange={() => {}} // Placeholder to make it not technically uncontrolled in a way that might trigger warnings
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          <div>
            <div className="px-3 py-1 text-[10px] font-black text-foreground-muted uppercase tracking-widest">Recent Chats</div>
            <div className="mt-1 space-y-1">
              {isLoading ? (
                <div className="p-4 flex justify-center"><Loader2 size={20} className="animate-spin text-foreground-muted" /></div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-xs text-foreground-muted">No chats yet</div>
              ) : chats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    activeChatId === chat.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-foreground-secondary hover:bg-surface-hover'
                  }`}
                >
                  <span className="truncate text-sm font-medium">{chat.title}</span>
                  <Trash2 
                    size={14} 
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-red-500 transition-all shrink-0" 
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 z-10">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border text-foreground-secondary hover:text-foreground transition-all hover:scale-105 active:scale-95"
          >
            {isHistoryOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={startNewChat}
              className="h-10 px-4 flex items-center gap-2 rounded-full bg-brand-primary text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border text-foreground-secondary hover:text-foreground transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-10"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center'} max-w-4xl mx-auto w-full`}
            >
              <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-center'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex flex-col items-center gap-4 w-full max-w-2xl animate-in fade-in slide-in-from-bottom duration-500">
                    <p className="text-lg leading-relaxed text-foreground text-center">
                      {msg.text}
                    </p>
                    <div className="flex items-center gap-4 text-foreground-muted">
                      <button className="hover:text-foreground transition-colors"><Copy size={16} /></button>
                      <button className="hover:text-foreground transition-colors"><ThumbsUp size={16} /></button>
                      <button className="hover:text-foreground transition-colors"><ThumbsDown size={16} /></button>
                      <button className="hover:text-foreground transition-colors"><Volume2 size={16} /></button>
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="bg-surface-active px-4 py-2 rounded-2xl text-foreground text-sm border border-border shadow-sm animate-in fade-in slide-in-from-right duration-500">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-center w-full animate-in fade-in duration-300">
              <div className="bg-surface border border-border px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-8 pb-12 flex justify-center">
          <form 
            onSubmit={handleSend}
            className="w-full max-w-2xl relative flex items-center group"
          >
            <div className="absolute inset-0 bg-brand-primary/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <button 
              type="button"
              className="absolute left-3 p-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <Plus size={20} />
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              placeholder="Type your question here"
              disabled={isTyping}
              rows={1}
              className="w-full bg-surface border border-border rounded-2xl pl-12 pr-12 py-4 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all placeholder:text-foreground-muted shadow-2xl resize-none min-h-[56px] max-h-32 overflow-y-auto"
            />
            
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className={`absolute right-3 p-2 rounded-full transition-all ${
                !inputText.trim() || isTyping
                  ? 'text-foreground-muted bg-transparent'
                  : 'bg-foreground text-background hover:scale-105 active:scale-95'
              }`}
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
