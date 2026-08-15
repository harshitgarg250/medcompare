import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { askAIWithContext } from '../services/api';

const suggestions = [
  {
    icon: '🩺',
    title: 'Symptoms',
    text: 'I have a headache and mild fever. What should I do?',
  },
  {
    icon: '🧪',
    title: 'Medical Tests',
    text: 'Which tests are commonly recommended for weakness?',
  },
  {
    icon: '💪',
    title: 'Health & Fitness',
    text: 'How can I gain healthy weight?',
  },
  {
    icon: '🏥',
    title: 'Hospitals',
    text: 'Can you recommend a hospital for a medical test?',
  },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendQuestion = async (text) => {
    const trimmedQuestion = text.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await askAIWithContext(trimmedQuestion);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to get AI response. Please try again.');
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendQuestion(question);
  };

  const handleSuggestion = async (text) => {
    await sendQuestion(text);
  };

  const clearChat = () => {
    setMessages([]);
    setHospitals([]);
    setQuestion('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-6">

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* =====================================================
              CHAT SECTION
          ====================================================== */}
          <section className="flex h-[calc(100vh-120px)] min-h-[620px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-5 py-5 text-white sm:px-7">

              {/* Background decoration */}
              <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl" />

              <div className="relative flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-inner backdrop-blur">
                    🤖
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-bold sm:text-xl">
                        Medical AI Assistant
                      </h1>

                      <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline-block">
                        AI
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                      Your intelligent health & hospital assistant
                    </p>
                  </div>

                </div>

                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    Clear
                  </button>
                )}

              </div>
            </div>

            {/* =================================================
                MESSAGES
            ================================================== */}
            <div className="flex-1 overflow-y-auto bg-white px-3 py-5 sm:px-6">

              {messages.length === 0 ? (

                /* ================= WELCOME SCREEN ================= */
                <div className="flex min-h-full flex-col items-center justify-center px-2 py-8">

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-100 to-blue-100 text-4xl shadow-sm"
                  >
                    🤖
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      How can I help you?
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Ask me about symptoms, medical tests, hospitals,
                      health information, or test prices.
                    </p>
                  </motion.div>

                  {/* Suggestion cards */}
                  <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">

                    {suggestions.map((item, index) => (
                      <motion.button
                        key={item.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        onClick={() => handleSuggestion(item.text)}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-teal-50">
                            {item.icon}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800">
                              {item.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {item.text}
                            </p>
                          </div>

                        </div>
                      </motion.button>
                    ))}

                  </div>

                  <div className="mt-7 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>🔒</span>
                    <span>AI provides general health information</span>
                  </div>

                </div>

              ) : (

                /* ================= CHAT MESSAGES ================= */
                <div className="mx-auto max-w-4xl space-y-6">

                  <AnimatePresence initial={false}>

                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >

                        {/* AI Avatar */}
                        {msg.role === 'ai' && (
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-sm shadow-sm">
                            🤖
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] sm:max-w-[75%] ${
                            msg.role === 'user'
                              ? 'items-end'
                              : 'items-start'
                          }`}
                        >

                          <div
                            className={`rounded-2xl px-4 py-3.5 text-sm leading-7 shadow-sm ${
                              msg.role === 'user'
                                ? 'rounded-br-md bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                          </div>

                          <p
                            className={`mt-1.5 px-1 text-[10px] text-slate-400 ${
                              msg.role === 'user'
                                ? 'text-right'
                                : 'text-left'
                            }`}
                          >
                            {msg.role === 'user'
                              ? 'You'
                              : 'MedCompare Assistant'}
                          </p>

                        </div>

                        {/* User Avatar */}
                        {msg.role === 'user' && (
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">
                            You
                          </div>
                        )}

                      </motion.div>
                    ))}

                  </AnimatePresence>

                  {/* Typing indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-sm">
                        🤖
                      </div>

                      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-5 py-4">

                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>

                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />

                </div>
              )}

            </div>

            {/* =================================================
                INPUT
            ================================================== */}
            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">

              <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-4xl"
              >

                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm transition focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-50">

                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about symptoms, tests, hospitals..."
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />

                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <span>Send</span>
                    <span className="hidden sm:inline">➤</span>
                  </button>

                </div>

                <p className="mt-2 text-center text-[10px] text-slate-400">
                  MedCompare AI can make mistakes. For medical concerns,
                  consult a qualified healthcare professional.
                </p>

              </form>

            </div>

          </section>

          {/* =====================================================
              HOSPITAL SIDEBAR
          ====================================================== */}
          <aside className="h-fit lg:sticky lg:top-6">

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.07)]">

              {/* Sidebar Header */}
              <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏥</span>

                      <h2 className="text-base font-bold text-slate-900">
                        Recommended Hospitals
                      </h2>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Hospitals available in MedCompare
                    </p>
                  </div>

                  {hospitals.length > 0 && (
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700">
                      {hospitals.length} found
                    </span>
                  )}

                </div>

              </div>

              {/* Hospitals */}
              <div className="p-4">

                {hospitals.length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">

                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      🏥
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      No recommendations yet
                    </p>

                    <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
                      Ask the AI about hospitals or medical tests to see recommendations here.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {hospitals.map((hospital, index) => (

                      <motion.div
                        key={hospital.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 text-xl">
                            🏥
                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {hospital.name}
                            </h3>

                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-xs">⭐</span>

                              <span className="text-xs font-bold text-amber-600">
                                {hospital.rating ?? 'N/A'}
                              </span>
                            </div>

                          </div>

                        </div>

                        <div className="mt-3 space-y-2">

                          <div className="flex items-start gap-2 text-xs text-slate-500">
                            <span>📍</span>
                            <span className="line-clamp-2">
                              {hospital.address || 'Address unavailable'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>📞</span>
                            <span>
                              {hospital.phone || 'Phone unavailable'}
                            </span>
                          </div>

                        </div>

                        {/* Tests */}
                        {hospital.tests?.length > 0 && (
                          <div className="mt-3 border-t border-slate-100 pt-3">

                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Popular Tests
                              </p>

                              <span className="text-[10px] font-semibold text-teal-600">
                                {hospital.tests.length}+
                              </span>
                            </div>

                            <div className="space-y-1.5">

                              {hospital.tests.slice(0, 3).map((test) => (
                                <div
                                  key={test.id}
                                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2"
                                >
                                  <span className="truncate text-[11px] font-medium text-slate-600">
                                    {test.testName}
                                  </span>

                                  <span className="shrink-0 text-[11px] font-bold text-teal-700">
                                    ₹{test.price}
                                  </span>
                                </div>
                              ))}

                            </div>

                          </div>
                        )}

                        <button
                          className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-teal-600"
                        >
                          View Hospital
                        </button>

                      </motion.div>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* Safety card */}
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex gap-3">

                <div className="text-lg">ℹ️</div>

                <div>
                  <p className="text-xs font-bold text-blue-900">
                    Medical information
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-700/80">
                    AI responses are for general information only and should
                    not replace professional medical advice.
                  </p>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}