import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ChatMessage, Paper } from '../../types';
import {
  Send, Sparkles, Plus, MessageSquare, 
  Trash2, Download, ExternalLink, ChevronDown, ChevronUp,
  Database, Network, BookOpen, Layers, Square, Copy, Check,
  Pin, Edit2, RotateCcw, X, GitCompare, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionItem {
  id: string;
  title: string;
  date: string;
  pinned: boolean;
}

export const ChatPage: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    setActivePage,
    setSelectedPaperId,
    searchQuery,
    setSearchQuery,
    allPapers,
    comparisonPaperIds,
    toggleComparisonPaper
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [showMobileSources, setShowMobileSources] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState('s1');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeCitationPopover, setActiveCitationPopover] = useState<{ id: string; x: number; y: number } | null>(null);
  
  // Research Context Papers
  const [contextPaperIds, setContextPaperIds] = useState<string[]>(['p3', 'p4', 'p2']);
  const [isAddContextModalOpen, setIsAddContextModalOpen] = useState(false);

  // Sessions state with Pin, Rename, Delete
  const [sessions, setSessions] = useState<SessionItem[]>([
    { id: 's1', title: 'DINOv2 vs MAE Comparison', date: 'Today, 21:42', pinned: true },
    { id: 's2', title: 'RAG in Education Systems', date: 'Today, 19:15', pinned: false },
    { id: 's3', title: 'Plant Disease Detection with ViTs', date: 'Yesterday', pinned: false },
    { id: 's4', title: 'Graph Neural Networks Topology', date: '3 days ago', pinned: false },
  ]);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping, isStreaming]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  // Handle incoming query from other pages
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      handleSendMessage(searchQuery);
      setSearchQuery('');
    }
  }, [searchQuery]);

  const sources: Record<string, { title: string; authors: string; year: number; match: string; type: string; quote: string; paperId: string }> = {
    '[1]': {
      title: 'DINOv2: Learning Robust Visual Features without Supervision',
      authors: 'M. Oquab et al.',
      year: 2023,
      match: '95%',
      type: 'Model & Architecture',
      quote: 'Self-distillation directly produces task-agnostic dense representations superior to supervised baselines on linear probing without fine-tuning.',
      paperId: 'p3'
    },
    '[2]': {
      title: 'Masked Autoencoders Are Scalable Vision Learners (MAE)',
      authors: 'K. He et al.',
      year: 2022,
      match: '92%',
      type: 'Pre-training Strategy',
      quote: 'Masking a high ratio (75%) of random visual patches enables accelerated, scalable pre-training that transfers with fine-tuning to SOTA accuracy.',
      paperId: 'p4'
    },
    '[3]': {
      title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition',
      authors: 'A. Dosovitskiy et al.',
      year: 2020,
      match: '88%',
      type: 'Foundational Baseline',
      quote: 'When pre-trained on large amounts of data and transferred to mid-size or small image recognition benchmarks, ViT achieves excellent results.',
      paperId: 'p2'
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || prompt;
    if (!content.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(userMsg);
    setPrompt('');
    setIsTyping(true);

    let targetAiContent = `Based on literature indexing across the research corpus, **DINOv2** and **MAE** represent distinct self-supervised paradigms for Vision Transformers:

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
If you require frozen visual embeddings without fine-tuning, **DINOv2** is superior. For downstream fine-tuning with limited labeled data, **MAE** offers simpler compute scaling [3].`;

    if (content.toLowerCase().includes('rag')) {
      targetAiContent = `Retrieval-Augmented Generation (RAG) integrates non-parametric vector retrieval with parametric autoregressive generators:

### 1. Architectural Foundations
- **Dense Vector Retrieval:** Queries are mapped to dense embeddings using encoders fine-tuned on contrastive semantic relevance [1].
- **GraphRAG Subgraph Traversal:** Injects topological relationships and community clusters to resolve synthesis queries that naive semantic search misses [2].

### 2. Empirical Reliability
Grounded RAG pipelines reduce hallucinations by enforcing explicit attribution constraints, ensuring every synthesized claim cites a verifiable peer-reviewed DOI.`;
    } else if (content.toLowerCase().includes('attention') || content.toLowerCase().includes('transformer')) {
      targetAiContent = `The Multi-Head Attention mechanism formalizes sequence mapping as:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

- **Computational Scaling:** Evaluates all pairwise token dependencies in parallel ($O(N^2)$ memory and compute) [3].
- **Multi-Head Projections:** Computes $h$ independent subspaces, allowing the model to jointly attend to information from different representation subspaces at different positions.`;
    }

    // Prepare assistant message and stream
    setTimeout(() => {
      setIsTyping(false);
      setIsStreaming(true);

      const assistantMsgId = `ai-${Date.now()}`;
      const words = targetAiContent.split(' ');
      let currentWordIndex = 0;
      let streamedText = '';

      const initialAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addChatMessage(initialAssistantMsg);

      streamTimerRef.current = setInterval(() => {
        if (currentWordIndex < words.length) {
          streamedText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          currentWordIndex++;
          
          // Update in-place
          addChatMessage({
            id: assistantMsgId,
            sender: 'assistant',
            content: streamedText,
            timestamp: initialAssistantMsg.timestamp
          });
        } else {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current);
          setIsStreaming(false);
        }
      }, 35);
    }, 600);
  };

  const handleStopStreaming = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
    setIsTyping(false);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExportChat = () => {
    const text = chatMessages
      .map(m => `### ${m.sender.toUpperCase()} (${m.timestamp})\n\n${m.content}\n`)
      .join('\n---\n\n');
    const header = `# ResearchGraph AI - Session Export\nGenerated: ${new Date().toLocaleString()}\n\n---\n\n`;
    const blob = new Blob([header + text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResearchGraph-Session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintChat = () => {
    window.print();
  };

  const handleOpenSource = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActivePage('details');
  };

  // Session Management Actions
  const handlePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev =>
      prev
        .map(s => (s.id === id ? { ...s, pinned: !s.pinned } : s))
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    );
  };

  const handleStartRename = (session: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editingTitle.trim() } : s));
    }
    setEditingSessionId(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setSessionToDelete(null);
    if (activeSessionId === id) {
      clearChat();
    }
  };

  // Context Management Actions
  const handleRemoveContextPaper = (id: string) => {
    setContextPaperIds(prev => prev.filter(pId => pId !== id));
  };

  const handleAddContextPaper = (paper: Paper) => {
    if (!contextPaperIds.includes(paper.id)) {
      setContextPaperIds(prev => [...prev, paper.id]);
    }
    setIsAddContextModalOpen(false);
  };

  const suggestedPrompts = [
    {
      title: 'Compare DINOv2 vs MAE',
      desc: 'Self-distillation vs masked autoencoding representations',
      icon: <GitCompare className="w-4 h-4 text-cyan-500" />
    },
    {
      title: 'Explain Transformer Attention',
      desc: 'Mathematical formulation of Scaled Dot-Product Attention',
      icon: <Database className="w-4 h-4 text-indigo-500" />
    },
    {
      title: 'Research Gaps in GNNs',
      desc: 'Identify bottlenecks in over-smoothing and scalability',
      icon: <Network className="w-4 h-4 text-purple-500" />
    },
    {
      title: 'How LoRA Fine-Tuning Works',
      desc: 'Low-rank matrix decomposition for efficient adaptation',
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />
    }
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] w-full overflow-hidden bg-[#F7FAFC]">
      
      {/* ── LEFT PANEL: RESEARCH SESSIONS (260px) ── */}
      <aside className="w-64 shrink-0 bg-white dark:bg-[#111D35] border-r border-gray-200 dark:border-white/[0.06] flex flex-col justify-between hidden md:flex">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-gray-900 dark:text-white">
              Research Sessions
            </h2>
            <button
              onClick={() => {
                clearChat();
                const newId = `s-${Date.now()}`;
                setSessions(prev => [{ id: newId, title: 'New Academic Inquest', date: 'Just now', pinned: false }, ...prev]);
                setActiveSessionId(newId);
              }}
              title="Start New Research Session"
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              clearChat();
              const newId = `s-${Date.now()}`;
              setSessions(prev => [{ id: newId, title: 'New Academic Inquest', date: 'Just now', pinned: false }, ...prev]);
              setActiveSessionId(newId);
            }}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Session</span>
          </button>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-thin pt-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`group relative w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  activeSessionId === s.id
                    ? 'bg-blue-50/80 border border-blue-200 text-blue-900 shadow-sm'
                    : 'hover:bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-200 border border-transparent'
                }`}
              >
                {editingSessionId === s.id ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveRename(s.id);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      autoFocus
                      className="flex-1 px-1.5 py-0.5 text-[12px] bg-white dark:bg-[#111D35] border border-blue-400 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(s.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {s.pinned ? (
                          <Pin className="w-3.5 h-3.5 text-blue-600 shrink-0 fill-current" />
                        ) : (
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === s.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                        <span className="text-[13px] font-semibold truncate leading-tight">{s.title}</span>
                      </div>
                      
                      {/* Session action buttons on hover */}
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handlePinSession(s.id, e)}
                          title={s.pinned ? 'Unpin' : 'Pin session'}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleStartRename(s, e)}
                          title="Rename session"
                          className="p-1 text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(s.id);
                          }}
                          title="Delete session"
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 pl-5.5 font-medium">{s.date}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-white/[0.04] flex items-center gap-1.5 bg-gray-50 dark:bg-white/[0.04]/50">
          <button
            onClick={handleExportChat}
            className="flex-1 py-1.5 px-2 rounded-lg hover:bg-gray-200/60 text-gray-600 dark:text-gray-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title="Export as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>
          <button
            onClick={handlePrintChat}
            className="py-1.5 px-2 rounded-lg hover:bg-gray-200/60 text-gray-600 dark:text-gray-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
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
        <div className="px-6 py-3.5 bg-white dark:bg-[#111D35] border-b border-gray-200 dark:border-white/[0.06] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Research Assistant
            </h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Ask questions, compare studies, explore empirical findings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileSources(!showMobileSources)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 dark:text-gray-200 text-[11px] font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Sources ({Object.keys(sources).length})</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grounded in Peer-Reviewed Index
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* EMPTY STATE SUGGESTED PROMPTS */}
          {chatMessages.length <= 1 && (
            <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">How can I assist your research today?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Synthesize literature, extract methodology trade-offs, and map citations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {suggestedPrompts.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(item.title)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-lg bg-gray-50 dark:bg-white/[0.04] group-hover:bg-blue-50 transition-colors">
                        {item.icon}
                      </div>
                      <h4 className="text-[13px] font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-7 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-[13px] sm:text-[14px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] text-gray-800 rounded-bl-none shadow-sm font-sans'
                }`}
              >
                {/* Assistant Label Header */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-600 tracking-wider">
                        ResearchGraph Intelligence
                      </span>
                      <span className="text-[11px] text-gray-400">· {msg.timestamp}</span>
                    </div>

                    {/* Message Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:text-gray-200 rounded transition-colors"
                        title="Copy message"
                      >
                        {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleSendMessage(prompt || 'Regenerate synthesis')}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Regenerate response"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Formatted Markdown Content */}
                <div className="space-y-3 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((block, i) => {
                    if (block.startsWith('|')) {
                      return (
                        <div key={i} className="my-3 overflow-x-auto">
                          <pre className="font-mono text-[12px] bg-gray-50 dark:bg-white/[0.04] p-3 rounded-xl border border-gray-200 dark:border-white/[0.06] text-gray-800">
                            {block}
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <p key={i}>
                        {block.split(/(\[\d+\])/g).map((chunk, j) => {
                          if (chunk === '[1]' || chunk === '[2]' || chunk === '[3]') {
                            const src = sources[chunk];
                            return (
                              <span key={j} className="relative inline-block mx-0.5">
                                <button
                                  onClick={() => handleOpenSource(src?.paperId || 'p1')}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setActiveCitationPopover({ id: chunk, x: rect.left, y: rect.top });
                                  }}
                                  onMouseLeave={() => setActiveCitationPopover(null)}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold font-mono text-[11px] hover:bg-blue-200 cursor-pointer transition-colors"
                                  title={src?.title}
                                >
                                  {chunk} {src?.authors || 'Citation'}
                                </button>
                              </span>
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
              <div className="bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                  Retrieving papers, cross-referencing citations &amp; generating synthesis...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── EDITABLE RESEARCH CONTEXT BAR ── */}
        <div className="px-4 sm:px-6 pt-2 shrink-0">
          <div className="bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowContextDetails(!showContextDetails)}
                className="flex items-center gap-2 text-[12px] font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Research Context: {contextPaperIds.length} papers active</span>
                {showContextDetails ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              <button
                onClick={() => setIsAddContextModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add paper</span>
              </button>
            </div>

            <AnimatePresence>
              {showContextDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2.5 mt-2 border-t border-gray-100 dark:border-white/[0.04] space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {contextPaperIds.map(pId => {
                      const paperObj = allPapers.find(p => p.id === pId);
                      return (
                        <span
                          key={pId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] text-[11px] text-gray-700 dark:text-gray-200"
                        >
                          <BookOpen className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="max-w-[180px] truncate font-medium">{paperObj?.title || pId}</span>
                          <button
                            onClick={() => handleRemoveContextPaper(pId)}
                            className="p-0.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                            title="Remove from context"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-blue-600" />
                      <span>Vector Retrieval: Top-k dense embeddings enabled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Network className="w-3 h-3 text-purple-600" />
                      <span>Knowledge Graph: 2-hop topological traversal enabled</span>
                    </div>
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
            className="relative flex items-center bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <textarea
              rows={1}
              placeholder="Ask a research inquiry (e.g. Compare DINOv2 vs MAE loss, explain Attention equations)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 px-3 py-2 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 bg-transparent resize-none focus:outline-none max-h-32"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[12px] flex items-center gap-1.5 transition-all shrink-0 border border-red-200"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim() || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm ${
                  prompt.trim() && !isTyping
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title="Send inquiry (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
          <div className="text-[11px] text-gray-400 text-right mt-1.5 pr-2">
            Press <span className="font-mono bg-gray-100 px-1 rounded">Enter</span> to send, <span className="font-mono bg-gray-100 px-1 rounded">Shift + Enter</span> for new line
          </div>
        </div>

      </main>

      {/* ── RIGHT PANEL: GROUNDED SOURCES (300px) ── */}
      <aside className={`w-72 shrink-0 bg-white dark:bg-[#111D35] border-l border-gray-200 dark:border-white/[0.06] p-5 flex flex-col justify-between overflow-y-auto scrollbar-thin ${
        showMobileSources ? 'fixed inset-y-0 right-0 z-40 shadow-2xl block' : 'hidden lg:flex'
      }`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.04]">
            <h2 className="text-[13px] font-bold text-gray-900 dark:text-white">
              Sources &amp; Grounding
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {Object.keys(sources).length} VERIFIED
              </span>
              {showMobileSources && (
                <button
                  onClick={() => setShowMobileSources(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-gray-700 dark:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Every statement generated by the assistant is grounded in indexed academic papers:
          </p>

          <div className="space-y-3">
            {Object.entries(sources).map(([citeKey, src]) => (
              <div
                key={citeKey}
                className="p-3.5 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04]/70 hover:bg-white dark:bg-[#111D35] hover:border-blue-300 hover:shadow-sm transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-extrabold text-blue-600 bg-white dark:bg-[#111D35] px-2 py-0.5 rounded-md border border-gray-200 dark:border-white/[0.06]">
                    {citeKey} {src.match} MATCH
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">{src.year}</span>
                </div>

                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  {src.title}
                </h4>

                <p className="text-[11px] text-gray-500 dark:text-gray-400">{src.authors}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-medium text-gray-400">{src.type}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleComparisonPaper(src.paperId)}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      {comparisonPaperIds.includes(src.paperId) ? 'In Compare' : '+ Compare'}
                    </button>
                    <button
                      onClick={() => handleOpenSource(src.paperId)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-white/[0.04]">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Academic Verification</span>
            Answers are grounded in peer-reviewed literature. Verify critical findings before publication.
          </div>
        </div>
      </aside>

      {/* ── MODAL: DELETE SESSION CONFIRMATION ── */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D35] rounded-3xl max-w-sm w-full border border-gray-200 dark:border-white/[0.06] shadow-2xl p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">Delete research session?</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              This will remove the conversation history for this inquest. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-[12px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(sessionToDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[12px] font-semibold transition-colors shadow-sm"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PAPER TO CONTEXT ── */}
      {isAddContextModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D35] rounded-3xl max-w-md w-full border border-gray-200 dark:border-white/[0.06] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.04]">
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Add Paper to Research Context
              </h3>
              <button
                onClick={() => setIsAddContextModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
              {allPapers.map(p => {
                const isAlreadyIn = contextPaperIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => !isAlreadyIn && handleAddContextPaper(p)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isAlreadyIn
                        ? 'bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.06] opacity-60 cursor-default'
                        : 'bg-white dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer'
                    }`}
                  >
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-900 dark:text-white line-clamp-1">{p.title}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{p.authors[0]} et al. · {p.year}</p>
                    </div>
                    {isAlreadyIn ? (
                      <span className="text-[11px] text-gray-400 font-semibold">Active</span>
                    ) : (
                      <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold">
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CITATION POPOVER ON HOVER ── */}
      {activeCitationPopover && sources[activeCitationPopover.id] && (
        <div
          className="fixed z-50 bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-2xl shadow-xl p-4 max-w-sm pointer-events-none transition-all"
          style={{
            left: `${Math.min(activeCitationPopover.x, window.innerWidth - 320)}px`,
            top: `${Math.max(activeCitationPopover.y - 120, 20)}px`
          }}
        >
          <div className="text-[10px] font-mono font-bold text-blue-600 uppercase mb-1">
            {sources[activeCitationPopover.id].match} Match · {sources[activeCitationPopover.id].year}
          </div>
          <h4 className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
            {sources[activeCitationPopover.id].title}
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {sources[activeCitationPopover.id].authors}
          </p>
          <p className="text-[11px] text-gray-700 dark:text-gray-200 italic bg-gray-50 dark:bg-white/[0.04] p-2 rounded-lg mt-2 border border-gray-100 dark:border-white/[0.04]">
            "{sources[activeCitationPopover.id].quote}"
          </p>
        </div>
      )}

    </div>
  );
};
