import { useState, useRef, useEffect } from 'react';
import { askAIWithContext } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: 'user', text: question };
    setMessages([...messages, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await askAIWithContext(question);
      const aiMessage = { role: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Section */}
        <div className="lg:col-span-2 h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">🤖 Medical AI Assistant</h1>
            <p className="text-sm text-teal-100">Ask about symptoms, tests & hospitals</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <div className="text-5xl mb-4">💬</div>
                <p>Ask me about:</p>
                <p className="text-sm mt-2">• Symptoms & tests needed</p>
                <p className="text-sm">• Hospital recommendations</p>
                <p className="text-sm">• Test procedures & prices</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about symptoms, tests..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Hospitals Sidebar */}
        <div className="bg-white rounded-3xl shadow-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏥 Recommended Hospitals</h2>
          
          {hospitals.length === 0 ? (
            <p className="text-gray-400 text-sm">Ask AI for hospital recommendations</p>
          ) : (
            <div className="space-y-4">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition">
                  <h3 className="font-bold text-gray-900">{hospital.name}</h3>
                  
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p>⭐ Rating: <span className="font-bold text-amber-600">{hospital.rating}</span></p>
                    <p>📍 {hospital.address}</p>
                    <p>📞 {hospital.phone || 'N/A'}</p>
                  </div>

                  {hospital.tests?.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-bold text-gray-700 mb-2">Available Tests:</p>
                      <div className="space-y-1">
                        {hospital.tests.slice(0, 3).map((test) => (
                          <p key={test.id} className="text-xs text-gray-600">
                            • {test.testName} - ₹{test.price}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
