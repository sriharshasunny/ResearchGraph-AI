import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';
import {
  Send, Sparkles, Plus, MessageSquare, 
  Trash2, Download, ExternalLink, ChevronDown, ChevronUp,
  Database, Network, BookOpen, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatPage: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    setActivePage,
    setSelectedPaperId,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState('s1');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // If navigated here with a pre-filled query, trigger message automatically
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      handleSendMessage(searchQuery);
      setSearchQuery('');
    }
  }, [searchQuery]);

  const sessions = [
    { id: 's1', title: 'DINOv2 vs MAE Comparison', date: 'Today, 21:42' },
    { id: 's2', title: 'RAG in Education Systems', date: 'Today, 19:15' },
    { id: 's3', title: 'Plant Disease Detection with ViTs', date: 'Yesterday' },
    { id: 's4', title: 'Graph Neural Networks Topology', date: '3 days ago' },
  ];

  const sources = [
    {
      id: 'p3',
      title: 'DINOv2: Learning Robust Visual Features without Supervision',
      authors: 'M. Oquab et al.',
      year: 2023,
      match: '95%',
      type: 'Model & Architecture'
    },
    {
      id: 'p4',
      title: 'Masked Autoencoders Are Scalable Vision Learners (MAE)',
      authors: 'K. He et al.',
      year: 2022,
      match: '92%',
      type: 'Pre-training Strategy'
    },
    {
      id: 'p2',
      title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition',
      authors: 'A. Dosovitskiy et al.',
      year: 2020,
      match: '88%',
      type: 'Foundational Baseline'
    }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || prompt;
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(userMsg);
    setPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let aiContent = `Based on literature indexing across the research corpus, **DINOv2** and **MAE** represent distinct self-supervised paradigms for Vision Transformers:

### 1. Training Objectives & Supervision
- **DINOv2** [1] utilizes discriminative student-teacher distillation with a combination of image-level and patch-level contrastive losses.
- **Masked Autoencoders (MAE)** [2] use generative masked autoencoding with asymmetric encoder-decoder architectures, reconstructing 75% masked pixels.

### 2. Empirical Benchmark Comparison
| Metric / Characteristic | DINOv2 (Oquab et al., 2023) | MAE (He et al., 2022) |
| :--- | :--- | :--- |
| **Primary Objective** | Self-distillation + DINO/iBOT | Masked Pixel Reconstruction |
| **Downstream Transfer** | Out-of-the-box linear probing SOTA | Requires fine-tuning for SOTA |
| **Dataset Requirement** | LVD-142M curated data | Standard ImageNet-1K / ImageNet-22K |
| **Feature Properties** | Dense semantic representations | Reconstructive low-level features |

### 3. Key Takeaway
If you require frozen visual embeddings without fine-tuning, **DINOv2** is superior. For downstream fine-tuning with limited labeled data, **MAE** offers simpler compute scaling.`;

      if (content.toLowerCase().includes('rag')) {
        aiContent = `Retrieval-Augmented Generation (RAG) integrates non-parametric vector retrieval with parametric autoregressive generators.

- **Knowledge Retrieval:** Queries are encoded into dense embeddings and matched against academic vector indices.
- **GraphRAG:** Integrates knowledge graph topologies with community clustering to resolve global synthesis queries that naive semantic search misses.
- **Citation Precision:** Every generated fact is grounded in explicit academic citations with verifiable DOIs.`;
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      addChatMessage(assistantMsg);
      setIsTyping(false);
    }, 900);
  };

  const handleExportChat = () => {
    const text = chatMessages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResearchGraph-Session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenSource = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActivePage('details');
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full overflow-hidden bg-[#F7FAFC]">
      
      {/* ── LEFT PANEL: RESEARCH SESSIONS (260px) ── */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
              Research Sessions
            </h2>
            <button
              onClick={() => {
                const title = window.prompt('Enter new session title:', 'New Academic Inquest');
                if (title) clearChat();
              }}
              title="Start New Research Session"
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => clearChat()}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Session</span>
          </button>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin pt-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeSessionId === s.id
                    ? 'bg-blue-50/80 border border-blue-200 text-blue-900 shadow-sm'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === s.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-[13px] font-semibold truncate leading-tight">{s.title}</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 pl-5.5 font-medium">{s.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
          <button
            onClick={handleExportChat}
            className="flex-1 py-1.5 px-2.5 rounded-lg hover:bg-gray-200/60 text-gray-600 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Chat</span>
          </button>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ── CENTER PANEL: CONVERSATION AREA (Flex-1) ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F7FAFC] relative">
        
        {/* Chat Header */}
        <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Research Assistant
            </h1>
            <p className="text-[12px] text-gray-500">
              Ask questions, compare studies, explore research connections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Research RAG Grounded
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-sm text-[13px] sm:text-[14px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm font-sans'
                }`}
              >
                {/* Assistant Label Header */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      ResearchGraph Intelligence
                    </span>
                    <span className="text-[11px] text-gray-400">• {msg.timestamp}</span>
                  </div>
                )}

                {/* Formatted Markdown Content */}
                <div className="space-y-3 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((block, i) => {
                    if (block.startsWith('|')) {
                      return (
                        <div key={i} className="my-3 overflow-x-auto">
                          <pre className="font-mono text-[12px] bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-800">
                            {block}
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <p key={i}>
                        {block.split(/(\[\d+\])/g).map((chunk, j) => {
                          if (chunk === '[1]') {
                            return (
                              <button
                                key={j}
                                onClick={() => handleOpenSource('p3')}
                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold font-mono text-[11px] hover:bg-blue-200 mx-0.5 cursor-pointer"
                                title="Open Citation: Oquab et al., 2023 (DINOv2)"
                              >
                                [1] Oquab et al., 2023
                              </button>
                            );
                          }
                          if (chunk === '[2]') {
                            return (
                              <button
                                key={j}
                                onClick={() => handleOpenSource('p4')}
                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold font-mono text-[11px] hover:bg-blue-200 mx-0.5 cursor-pointer"
                                title="Open Citation: He et al., 2022 (MAE)"
                              >
                                [2] He et al., 2022
                              </button>
                            );
                          }
                          return chunk;
                        })}
                      </p>
                    );
                  })}
                </div>

                {msg.sender === 'user' && (
                  <div className="text-right text-[10px] text-blue-200 mt-1">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-[12px] text-gray-500 font-medium animate-pulse">
                  Retrieving papers, cross-referencing citations &amp; generating synthesis...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── RESEARCH CONTEXT BAR (OPTIONAL EXPANDABLE DETAILS) ── */}
        <div className="px-6 pt-2 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm">
            <button
              onClick={() => setShowContextDetails(!showContextDetails)}
              className="w-full flex items-center justify-between text-[12px] font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Research Context: 5 papers · 12 relationships active</span>
              </div>
              {showContextDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
              {showContextDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2.5 mt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]"
                >
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-800 block mb-0.5 flex items-center gap-1">
                      <Database className="w-3 h-3 text-blue-600" /> Vector Retrieval
                    </span>
                    <span className="text-gray-500">Dense embedding dot-product top-k: 5 chunks</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-800 block mb-0.5 flex items-center gap-1">
                      <Network className="w-3 h-3 text-purple-600" /> Knowledge Graph
                    </span>
                    <span className="text-gray-500">2-hop subgraph traversal on CITATION links</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-800 block mb-0.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-600" /> Selected Papers
                    </span>
                    <span className="text-gray-500">DINOv2, MAE, ViT, DeepSeek-R1, LoRA</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── CHAT INPUT COMPONENT ── */}
        <div className="p-4 sm:p-6 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <input
              type="text"
              placeholder="Ask a research inquiry (e.g. Compare DINOv2 vs MAE training loss, explain Attention equations)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-3 py-2 text-[14px] text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>

      {/* ── RIGHT PANEL: GROUNDED SOURCES (300px) ── */}
      <aside className="w-72 shrink-0 bg-white border-l border-gray-200 p-5 hidden lg:flex flex-col justify-between overflow-y-auto scrollbar-thin">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
              Sources &amp; Grounding
            </h2>
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {sources.length} VERIFIED
            </span>
          </div>

          <p className="text-[11px] text-gray-500">
            Every statement generated by the assistant is grounded in indexed academic papers:
          </p>

          <div className="space-y-3">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-extrabold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {src.match} MATCH
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">{src.year}</span>
                </div>

                <h4 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
                  {src.title}
                </h4>

                <p className="text-[11px] text-gray-500">{src.authors}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-medium text-gray-400">{src.type}</span>
                  <button
                    onClick={() => handleOpenSource(src.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
            <span className="font-bold block mb-0.5">Academic Verification</span>
            Zero hallucinations. All conclusions cite published peer-reviewed papers.
          </div>
        </div>
      </aside>

    </div>
  );
};
