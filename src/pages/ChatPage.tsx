import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, BookOpen, RefreshCw, AlertTriangle, Bot, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/api';
import { ChatMessage, ChatSource } from '../types';

const SAMPLE_PROMPTS = [
  'List the top 10 problems/alarm codes documented in this manual',
  'What safety warnings (LOTO, high pressure, thermal) are documented?',
  'Summarize the maintenance schedule in this manual',
  'What error codes exist and what triggers each one?',
];

// Very small markdown-ish renderer: bold **text**, numbered/bulleted lines,
// and paragraph breaks. Groq is asked to format with plain markdown -- this
// avoids pulling in a whole markdown library for what's mostly bold + lists.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// Defensive fallback in case the model uses a markdown table despite being
// told not to (narrow chat bubbles render wide tables unreadably) -- a
// separator row like "|---|---|" is dropped, and a data row's cells are
// joined with a middle dot instead of being rendered as literal pipes.
function isTableSeparatorRow(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
}

function tableRowToPlainText(line: string): string {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)
    .join(' · ');
}

function renderChatText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;
        if (isTableSeparatorRow(line)) return null;
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          return <div key={idx}>{renderInline(tableRowToPlainText(line))}</div>;
        }
        const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
        const numberedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-black text-black/70 flex-shrink-0">{numberedMatch[1]}.</span>
              <span>{renderInline(numberedMatch[2])}</span>
            </div>
          );
        }
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-black text-black/50 flex-shrink-0">•</span>
              <span>{renderInline(bulletMatch[1])}</span>
            </div>
          );
        }
        return <div key={idx}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

export const ChatPage: React.FC = () => {
  const { machines, manuals, selectedMachine, chatManualId, setChatManualId, responseLanguage, showToast } =
    useApp();

  const [scopeMachineId, setScopeMachineId] = useState<string>(
    selectedMachine?.id || machines[0]?.id || ''
  );
  const [scopeManualId, setScopeManualId] = useState<string>(chatManualId || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatManualId) {
      setScopeManualId(chatManualId);
      const m = manuals.find((man) => man.id === chatManualId);
      if (m) setScopeMachineId(m.machineId);
      setChatManualId(null); // consumed -- don't keep forcing it on future visits
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const manualsForScope = manuals.filter((m) => m.machineId === scopeMachineId);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { id: 'u-' + Date.now(), sender: 'user', text: trimmed };
    const assistantId = 'a-' + Date.now();
    const assistantMsg: ChatMessage = { id: assistantId, sender: 'assistant', text: '', isStreaming: true };

    const history = messages.map((m) => ({ sender: m.sender, text: m.text, chatText: m.text }));

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    await chatService.streamChat(
      {
        query: trimmed,
        machineId: scopeMachineId || undefined,
        manualId: scopeManualId || undefined,
        language: responseLanguage,
        history,
      },
      {
        onToken: (delta) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m))
          );
        },
        onSources: (sources: ChatSource[]) => {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, sources } : m)));
        },
        onError: (message) => {
          showToast(message || 'Chat stream failed', 'error');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, isStreaming: false, error: true, text: m.text || 'Sorry, something went wrong answering that.' }
                : m
            )
          );
        },
        onDone: () => {
          setIsStreaming(false);
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 shadow-[5px_6px_0px_#000]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-black text-[#FED000] flex items-center justify-center border-2 border-black">
              <MessageCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
                Real-time chatbot
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-black leading-tight">
                Chat with your manuals
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-bold text-black/70 mb-3">
            Ask anything about the manuals below -- "list the top 10 problems in this manual", ask it
            to summarize a section, or explain an alarm code. Answers stream in live and cite the
            section/page they came from.
          </p>

          {/* Scope selectors */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-[#FAF8F2] border-2 border-black rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-black uppercase text-black/60">Machine:</span>
              <select
                value={scopeMachineId}
                onChange={(e) => {
                  setScopeMachineId(e.target.value);
                  setScopeManualId('');
                }}
                className="bg-transparent font-black text-xs text-black outline-none cursor-pointer"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF8F2] border-2 border-black rounded-xl px-2.5 py-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase text-black/60">Manual:</span>
              <select
                value={scopeManualId}
                onChange={(e) => setScopeManualId(e.target.value)}
                className="bg-transparent font-black text-xs text-black outline-none cursor-pointer max-w-[220px] truncate"
              >
                <option value="">All manuals for this machine</option>
                {manualsForScope.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black shadow-[5px_6px_0px_#000] flex flex-col min-h-[420px]">
          <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[55vh]">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-black/60">Try asking:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-left p-3 rounded-2xl border-2 border-black bg-[#FAF8F2] hover:bg-[#FED000]/40 text-xs font-bold transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl border-2.5 border-black p-3.5 text-sm font-bold leading-relaxed shadow-[3px_3px_0px_#000] ${
                    m.sender === 'user'
                      ? 'bg-black text-[#FED000]'
                      : m.error
                      ? 'bg-rose-100 text-black'
                      : 'bg-[#FAF8F2] text-black'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-black uppercase tracking-wider opacity-60">
                    {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span>{m.sender === 'user' ? 'You' : 'SARVA-SENSE'}</span>
                    {m.error && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                  </div>

                  {m.text ? renderChatText(m.text) : m.isStreaming ? (
                    <span className="inline-flex items-center gap-1 text-black/50">
                      <RefreshCw className="w-3 h-3 animate-spin" /> thinking...
                    </span>
                  ) : null}

                  {m.isStreaming && m.text && (
                    <span className="inline-block w-1.5 h-3.5 bg-black/70 align-middle animate-pulse ml-0.5" />
                  )}

                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-black/15 flex flex-wrap gap-1.5">
                      {m.sources.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#FED000]/60 border border-black text-[10px] font-black"
                          title={s.section}
                        >
                          p.{s.page} &middot; {s.manualTitle}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t-2.5 border-black flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the selected manual(s)..."
              disabled={isStreaming}
              className="w-full bg-[#FAF8F2] border-2 border-black rounded-2xl p-3 font-bold text-xs sm:text-sm text-black outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="neo-btn bg-black text-[#FED000] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-black disabled:opacity-50"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
