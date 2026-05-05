import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tutorApi } from '../services/api';
import { Card, Button } from '../components/ui/index.jsx';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

const SUBJECTS = ['General', 'Mathematics', 'AI & ML', 'Computer Vision', 'Programming', 'Robotics', 'Physics', 'Chemistry'];

const STARTERS = [
  'Explain neural networks like I\'m a beginner',
  'What is gradient descent and how does it work?',
  'How does a convolutional neural network process images?',
  'Explain the difference between supervised and unsupervised learning',
  'How does backpropagation work?',
  'What is the transformer architecture?',
];

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>
        <Bot size={16} color="#fff" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ background: '#1E2535', border: '1px solid #2A3345' }}>
        <span className="typing-dot text-xl" style={{ color: '#6C63FF' }}>•</span>
        <span className="typing-dot text-xl ml-1" style={{ color: '#6C63FF' }}>•</span>
        <span className="typing-dot text-xl ml-1" style={{ color: '#6C63FF' }}>•</span>
      </div>
    </div>
  );
}

export default function TutorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [subject, setSubject]   = useState('General');
  const [loading, setLoading]   = useState(false);
  const [sessionId]             = useState(() => `sess_${Date.now()}`);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await tutorApi.chat(
        newMessages, user?.id, sessionId, subject
      );
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please check your API key configuration.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl" style={{ color: '#E8EAED' }}>AI Tutor</h1>
            <p className="text-xs" style={{ color: '#8B92A5' }}>Powered by Claude AI · Always ready to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED' }}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={reset} title="New conversation"
            className="p-2 rounded-xl transition-all"
            style={{ background: '#1E2535', color: '#8B92A5' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-5 mb-4"
        style={{ background: '#161B27', border: '1px solid #1E2535' }}>

        {messages.length === 0 ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #6C63FF22, #00D4AA22)' }}>
              <Sparkles size={28} style={{ color: '#6C63FF' }} />
            </div>
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#E8EAED' }}>
              Your AI Tutor is ready!
            </h2>
            <p className="text-sm mb-8 max-w-md" style={{ color: '#8B92A5' }}>
              Ask me anything about {subject === 'General' ? 'any subject' : subject}. I can explain concepts, solve problems, and guide your learning journey.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#B8BFCC' }}>
                  <BookOpen size={14} className="inline mr-2" style={{ color: '#6C63FF' }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="space-y-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 mb-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  m.role === 'user' ? '' : ''
                }`}
                  style={m.role === 'user'
                    ? { background: '#1E2535', color: '#E8EAED' }
                    : { background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }
                  }>
                  {m.role === 'user'
                    ? <User size={16} color="#E8EAED" />
                    : <Bot size={16} color="#fff" />
                  }
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    m.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                  }`}
                  style={m.role === 'user'
                    ? { background: '#6C63FF', color: '#fff' }
                    : { background: '#1E2535', border: '1px solid #2A3345' }
                  }>
                  {m.role === 'assistant'
                    ? <div className="prose-dark"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                    : <p style={{ color: '#fff' }}>{m.content}</p>
                  }
                </div>
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={`Ask about ${subject}...`}
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #5B53EE)', color: '#fff' }}>
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}
