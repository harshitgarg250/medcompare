import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import styles from './AIChat.module.css'

const AIChat = () => {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadingConversations, setLoadingConversations] = useState(true)

  const messagesEndRef = useRef(null)
  const API_BASE = 'http://localhost:5001'

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE}/api/ai/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(response.data.conversations)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  // Fetch conversation messages
  const fetchConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE}/api/ai/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setActiveConversation(response.data.conversation)
      setMessages(response.data.conversation.messages)
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
    }
  }

  // Create new conversation
  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/api/ai/conversations`,
        { title: 'New Conversation' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      const newConversation = response.data.conversation
      setConversations([newConversation, ...conversations])
      setActiveConversation(newConversation)
      setMessages([])
      setQuestion('')
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  // Delete conversation
  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this conversation permanently?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE}/api/ai/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const updated = conversations.filter(c => c.id !== conversationId)
      setConversations(updated)

      if (activeConversation?.id === conversationId) {
        setActiveConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  // Send message to AI
  const handleAskAI = async (e) => {
    e.preventDefault()
    if (!question.trim() || !activeConversation) return

    const userMessage = {
      role: 'user',
      message: question,
      createdAt: new Date()
    }

    setMessages([...messages, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/api/ai/conversations/${activeConversation.id}/ask`,
        { question: question.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const aiMessage = {
        role: 'assistant',
        message: response.data.answer,
        language: response.data.language,
        createdAt: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      fetchConversations()
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage = {
        role: 'assistant',
        message: error.response?.data?.error || 'Sorry, something went wrong. Please try again.',
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>💬 AI Chat</h2>
          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            ✕
          </button>
        </div>

        <button className={styles.newChatBtn} onClick={createNewConversation}>
          ✨ New Chat
        </button>

        <div className={styles.conversationsList}>
          {loadingConversations ? (
            <div className={styles.loading}>Loading...</div>
          ) : conversations.length === 0 ? (
            <p className={styles.empty}>No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`${styles.conversationItem} ${
                  activeConversation?.id === conv.id ? styles.active : ''
                }`}
                onClick={() => fetchConversation(conv.id)}
                title={conv.title}
              >
                <div className={styles.convTitle}>{conv.title}</div>
                <div className={styles.convMeta}>
                  <span className={styles.convTime}>
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </span>
                  <span className={styles.convCount}>
                    {conv._count?.messages || 0}
                  </span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => deleteConversation(conv.id, e)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.chatArea}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>{activeConversation?.title || 'MedCompare AI Assistant'}</h1>
        </div>

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {!activeConversation ? (
            <div className={styles.noConversation}>
              <div className={styles.emptyState}>
                <h2>🏥 MedCompare AI Assistant</h2>
                <p>Ask about hospitals, medical tests, and health information</p>
                <button
                  className={styles.startBtn}
                  onClick={createNewConversation}
                >
                  Start Chatting
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className={styles.emptyChat}>
                  <p>Start your conversation by asking about hospitals or health!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                    <div className={styles.messageContent}>{msg.message}</div>
                    <div className={styles.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typing}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form */}
        {activeConversation && (
          <form className={styles.inputForm} onSubmit={handleAskAI}>
            <input
              type="text"
              placeholder="Ask about hospitals, tests, health..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              title={!question.trim() ? 'Type a question first' : 'Send'}
            >
              {loading ? '⏳' : '→'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AIChat