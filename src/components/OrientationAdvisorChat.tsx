import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import {
  sendOrientationMessage,
  type OrientationChatMessage,
} from '../api/orientationAdvisorApi';
import { ApiError } from '../api/authApi';
import { useLanguage } from '../context/LanguageContext';

const SUGGESTED_FR = [
  'Quelle filière choisir après un Bac S ?',
  'Quelles écoles pour le marketing digital ?',
  'Comment financer mes études à Dakar ?',
  'Quels sont les frais à l\'EPT ?',
  'Comment obtenir une bourse au Sénégal ?',
  'Quels métiers recrutent le plus ?',
] as const;

const SUGGESTED_EN = [
  'Which track after a science baccalaureate?',
  'Which schools for digital marketing?',
  'How to finance studies in Dakar?',
  'What are EPT tuition fees?',
  'How to get a scholarship in Senegal?',
  'Which careers hire the most?',
] as const;

const WELCOME_FR =
  "Bonjour ! Je suis votre conseiller en orientation scolaire et professionnelle. Je dispose d'informations vérifiées sur les écoles, programmes, frais, bourses et débouchés au Sénégal. Posez-moi vos questions — je vous guiderai dans vos choix d'études et de carrière.";

const WELCOME_EN =
  'Hello! I am your academic and career orientation advisor. I have verified information on schools, programs, fees, scholarships and career paths in Senegal. Ask me your questions — I will guide you in your study and career choices.';

type ChatEntry = OrientationChatMessage & { id: string };

const OrientationAdvisorChat = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const suggested = isEn ? SUGGESTED_EN : SUGGESTED_FR;
  const welcomeText = isEn ? WELCOME_EN : WELCOME_FR;

  const [messages, setMessages] = useState<ChatEntry[]>([
    { id: 'welcome', role: 'assistant', content: welcomeText },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      const userMsg: ChatEntry = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));

      try {
        const response = await sendOrientationMessage(trimmed, history);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.reply,
          },
        ]);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : isEn
              ? 'Unable to reach the advisor. Please try again.'
              : 'Impossible de joindre le conseiller. Réessayez.'
        );
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [isEn, loading, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleSuggestedClick = (question: string) => {
    setInput(question);
    void sendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <section className="orientation-advisor-section" aria-labelledby="orientation-advisor-title">
      <div className="container orientation-advisor-container">
        <span className="section-badge orientation-advisor-badge">
          <Sparkles size={14} aria-hidden />
          {isEn ? 'Artificial Intelligence' : 'Intelligence Artificielle'}
        </span>
        <h2 id="orientation-advisor-title" className="orientation-advisor-title">
          {isEn ? 'AI orientation advisor' : 'Conseiller IA orientation'}
        </h2>
        <p className="orientation-advisor-subtitle">
          {isEn
            ? 'Our smart assistant answers your questions using verified data on Senegalese schools.'
            : 'Notre assistant intelligent répond à vos questions à partir de données vérifiées sur les écoles sénégalaises.'}
        </p>

        <div className="orientation-suggestions" role="group" aria-label={isEn ? 'Suggested questions' : 'Questions suggérées'}>
          {suggested.map((q) => (
            <button
              key={q}
              type="button"
              className="orientation-suggestion-chip"
              onClick={() => handleSuggestedClick(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="orientation-chat-widget">
          <header className="orientation-chat-header">
            <div className="orientation-chat-avatar" aria-hidden>
              <Bot size={22} />
            </div>
            <div className="orientation-chat-header-text">
              <strong>Conseiller IA SNJobConnect</strong>
              <span className="orientation-chat-status">
                <span className="orientation-rag-dot" aria-hidden />
                RAG —{' '}
                {isEn
                  ? 'Answers from the knowledge base'
                  : 'Répond depuis la base de connaissances'}
              </span>
            </div>
          </header>

          <div className="orientation-chat-messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`orientation-message ${msg.role === 'user' ? 'orientation-message-user' : 'orientation-message-bot'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="orientation-message-avatar" aria-hidden>
                    <Bot size={18} />
                  </div>
                )}
                <div className="orientation-message-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={`${msg.id}-${i}`}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="orientation-message orientation-message-bot">
                <div className="orientation-message-avatar" aria-hidden>
                  <Bot size={18} />
                </div>
                <div className="orientation-message-bubble orientation-message-loading">
                  <Loader2 size={18} className="orientation-spinner" aria-hidden />
                  {isEn ? 'Thinking…' : 'Réflexion en cours…'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <p className="orientation-chat-error" role="alert">
              {error}
            </p>
          )}

          <form className="orientation-chat-input-row" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="orientation-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isEn
                  ? 'Ask your question about studying in Senegal…'
                  : 'Posez votre question sur les études au Sénégal…'
              }
              rows={1}
              disabled={loading}
              aria-label={isEn ? 'Your question' : 'Votre question'}
            />
            <button
              type="submit"
              className="orientation-chat-send"
              disabled={loading || !input.trim()}
              aria-label={isEn ? 'Send' : 'Envoyer'}
            >
              <Send size={20} aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default OrientationAdvisorChat;
