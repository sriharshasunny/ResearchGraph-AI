import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';
import {
  Send, Sparkles, Trash2,
  BrainCircuit, BookMarked, MessageSquare,
  Copy, Check, Download, Layers,
  ArrowRight, Star, Bookmark, BookmarkPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatPage: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    setActivePage,
    setSelectedPaperId,
    addToRecentlyViewed,
    savedPaperIds,
    toggleSavedPaper,
    allPapers,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [groundingScope, setGroundingScope] = useState<'all' | 'saved' | 'focus'>('all');
  const [activeSession, setActiveSession] = useState(0);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessions = [
    { title: 'Vision Transformers & DINOv2', date: 'Active' },
    { title: 'DeepSeek-R1 GRPO Reasoning', date: 'Earlier today' },
    { title: 'Linear SSMs vs Quadratic Attention', date: 'Yesterday' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // If redirected with a searchQuery, auto-trigger a synthesis
  useEffect(() => {
    if (searchQuery && searchQuery.trim() && chatMessages.length === 1) {
      handleSend(searchQuery);
      setSearchQuery('');
    }
  }, [searchQuery]);

  const handlePaperClick = (id: string) => {
    setSelectedPaperId(id);
    addToRecentlyViewed(id);
    setActivePage('details');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(id);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleExportChat = () => {
    const md = chatMessages.map(m => `### ${m.sender === 'user' ? 'Researcher' : 'ResearchGraph AI'} (${m.timestamp})\n\n${m.content}\n`).join('\n---\n\n');
    navigator.clipboard.writeText(md);
    alert('Conversation copied to clipboard as Markdown!');
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-u`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addChatMessage(userMsg);
    setPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      const q = textToSend.toLowerCase();

      // Find relevant papers from database
      const pool = groundingScope === 'saved'
        ? allPapers.filter(p => savedPaperIds.includes(p.id))
        : allPapers;

      let matchedPapers = pool.filter(p => {
        return (
          q.includes(p.title.toLowerCase()) ||
          p.title.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w)) ||
          p.authors.some(a => q.includes(a.toLowerCase())) ||
          (p.field && q.includes(p.field.toLowerCase())) ||
          (p.venue && q.includes(p.venue.toLowerCase()))
        );
      });

      if (matchedPapers.length === 0) {
        if (q.includes('vit') || q.includes('transformer') || q.includes('vision')) {
          matchedPapers = allPapers.filter(p => p.id === 'p1' || p.id === 'p2' || p.id === 'p3');
        } else if (q.includes('deepseek') || q.includes('reasoning') || q.includes('grpo') || q.includes('rl')) {
          matchedPapers = allPapers.filter(p => p.id === 'p5' || p.id === 'p11');
        } else if (q.includes('attention') || q.includes('flash') || q.includes('mamba') || q.includes('ssm')) {
          matchedPapers = allPapers.filter(p => p.id === 'p1' || p.id === 'p6' || p.id === 'p7');
        } else if (q.includes('graph') || q.includes('rag')) {
          matchedPapers = allPapers.filter(p => p.id === 'p8' || p.id === 'p10');
        } else {
          matchedPapers = allPapers.slice(0, 2);
        }
      }

      const citations = matchedPapers.map((p, idx) => ({
        id: p.id,
        index: idx + 1,
        title: p.title
      }));

      let content = '';
      let codeSnippet: { language: string; code: string } | undefined;
      let table: { headers: string[]; rows: string[][] } | undefined;
      let relatedConcepts: string[] = [];

      if (q.includes('deepseek') || q.includes('grpo') || q.includes('reasoning')) {
        content = `DeepSeek-R1 introduces a paradigm shift in eliciting complex reasoning behaviors via pure Reinforcement Learning [1, 2].

### Key Architectural & Methodological Breakthroughs:
1. **Elimination of the Critic Model (GRPO)**: Group Relative Policy Optimization samples a group of responses $\{o_1, o_2, ..., o_G\}$ from the old policy and optimizes against group-relative reward scores, saving significant GPU memory.
2. **Emergence of Self-Correction**: Without supervised human traces (in DeepSeek-R1-Zero), the model spontaneously developed reflection ("wait, let me double check..."), backtrack strategies, and elongated test-time compute.
3. **Multi-Stage Distillation**: The reasoning performance was distilled successfully into dense open weights (1.5B, 7B, 14B, 32B, 70B), maintaining high AIME and MATH-500 scores.`;

        table = {
          headers: ['Metric / Feature', 'DeepSeek-R1', 'OpenAI o1', 'Standard SFT LLM'],
          rows: [
            ['RL Algorithm', 'GRPO (Group-Relative)', 'Proprietary PPO / Search', 'PPO with Reward Models'],
            ['AIME 2024 Pass@1', '79.8%', '79.2%', '~16.0% (Llama-3-70B)'],
            ['MATH-500 Pass@1', '97.3%', '96.4%', '~52.0%'],
            ['Open Weights Available', 'Yes (MIT License)', 'No (API Only)', 'Yes']
          ]
        };

        codeSnippet = {
          language: 'python',
          code: `# Group Relative Policy Optimization (GRPO) Objective
def compute_grpo_loss(rewards_group, log_probs, ref_log_probs, epsilon=0.2):
    # Normalize rewards within group
    mean_r = rewards_group.mean(dim=-1, keepdim=True)
    std_r = rewards_group.std(dim=-1, keepdim=True) + 1e-8
    advantages = (rewards_group - mean_r) / std_r
    
    # Clipped surrogate objective
    ratio = torch.exp(log_probs - ref_log_probs)
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1 - epsilon, 1 + epsilon) * advantages
    return -torch.min(surr1, surr2).mean()`
        };

        relatedConcepts = ['GRPO', 'Test-Time Compute', 'Chain-of-Thought', 'Reward Modeling'];
      } else if (q.includes('compare') && (q.includes('dino') || q.includes('clip') || q.includes('vision'))) {
        content = `Comparing DINOv2 [1] and CLIP [2] illustrates the fundamental trade-off between **Dense Self-Supervised Distillation** versus **Weak Language-Supervised Contrastive Learning**:

- **DINOv2 (Self-Supervised)**: Optimized via DINO and iBOT losses on 142M curated images. Produces highly consistent pixel- and patch-level visual features. Exceptional for monocular depth estimation, dense segmentation, and geometric tracking.
- **CLIP (Contrastive Text-Image)**: Optimized with InfoNCE loss over 400M (image, text) pairs. Excellent for open-vocabulary zero-shot classification, text-guided retrieval, and multimodal conditioning, but lacks fine-grained geometric localization.`;

        table = {
          headers: ['Dimension', 'DINOv2 (Oquab et al.)', 'CLIP (Radford et al.)'],
          rows: [
            ['Supervision', 'Self-Distillation (Unsupervised)', 'Image-Text Contrastive (Weak)'],
            ['Patch Geometry', 'High spatial consistency & local alignment', 'Sub-optimal local localization'],
            ['Zero-Shot Semantic Tags', 'Requires k-NN / linear probe', 'Direct cosine similarity with text'],
            ['Downstream Sweet Spot', 'Depth, Segmentation, Dense Tracking', 'Classification, Image Retrieval, Stable Diffusion']
          ]
        };

        relatedConcepts = ['Self-Supervised Learning', 'Contrastive Pretraining', 'Zero-Shot Transfer', 'Dense Prediction'];
      } else if (q.includes('flash') || q.includes('attention') || q.includes('mamba') || q.includes('ssm')) {
        content = `Evaluating long-context scaling bottlenecks requires understanding the dichotomy between **Hardware-Aware Attention** [1, 2] and **Linear-Time Selective State Spaces** [3].

1. **Standard Transformer Attention**: Computes $O(N^2)$ dot products. High-bandwidth memory (HBM) read/writes dominate wall-clock time.
2. **FlashAttention-2**: Keeps computations inside fast on-chip SRAM via block-level tiling and online softmax rescaling, hitting 70% of theoretical A100 FLOPS.
3. **Mamba (Selective SSM)**: Bypasses quadratic attention entirely with dynamic state-space parameterization $B_t, C_t = f(x_t)$, achieving constant $O(1)$ inference memory per step.`;

        codeSnippet = {
          language: 'python',
          code: `# Selective State Space (Mamba) Formulation
# Continuous time:  h'(t) = A h(t) + B(t) x(t)
# Discrete time:    h_t   = A_bar * h_{t-1} + B_bar * x_t
# Output:           y_t   = C_t * h_t + D * x_t
# Key insight: B_t, C_t, and Delta_t are input-dependent projections`
        };

        table = {
          headers: ['Mechanism', 'Standard Attention', 'FlashAttention-2', 'Mamba (SSM)'],
          rows: [
            ['Training Complexity', 'O(N^2) Quadratic', 'O(N^2) with SRAM Tiling', 'O(N) Linear Time'],
            ['Inference Cache', 'O(N) KV Cache per layer', 'O(N) KV Cache', 'O(1) Fixed hidden state'],
            ['Throughput Scaling', 'Severe degradation >32k', '2-3x faster than baseline', '5x higher throughput']
          ]
        };

        relatedConcepts = ['SRAM Tiling', 'KV Cache', 'Selective State Space', 'Linear Complexity'];
      } else {
        content = `Based on the literature in your active research collection [1, 2], this inquiry connects foundational scaling laws and architectural designs.

- **Representational Efficiency**: Recent empirical benchmarks demonstrate that decoupling attention mechanisms or applying targeted low-rank updates preserves core reasoning while reducing training parameters.
- **Topological Significance**: These works serve as central citation hubs connecting over 120,000 downstream research papers in the global index.

Would you like me to construct a deeper comparative benchmark or extract mathematical formulations for these models?`;

        relatedConcepts = ['Model Scaling', 'Optimization', 'Representation Learning', 'Knowledge Topology'];
      }

      addChatMessage({
        id: `chat-${Date.now()}-a`,
        sender: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        papers: matchedPapers,
        codeSnippet,
        table,
        relatedConcepts
      });

      setIsTyping(false);
    }, 1000);
  };

  const latestContextMsg = [...chatMessages].reverse().find(
    msg => msg.sender === 'assistant' && ((msg.papers && msg.papers.length > 0) || (msg.relatedConcepts && msg.relatedConcepts.length > 0))
  );
  const currentSources = latestContextMsg?.papers || [];
  const currentConcepts = latestContextMsg?.relatedConcepts || [];

  return (
    <div className="flex h-[calc(100vh-56px)] w-full overflow-hidden bg-[#F4F7FB] relative p-4 gap-4">

      {/* ── LEFT PANEL: RESEARCH SESSIONS ──────────────────────────── */}
      <aside className="w-64 bg-white rounded-xl border border-gray-200 flex flex-col justify-between hidden lg:flex shrink-0 shadow-sm">
        <div>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[14px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              AI Assistant
            </span>
            <button
              onClick={clearChat}
              title="New Chat"
              className="text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors text-[11px] font-semibold flex items-center gap-1"
            >
              + New Chat
            </button>
          </div>

          <div className="p-3 space-y-1">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase">Recent</div>
            {sessions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSession(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2.5 ${
                  activeSession === idx
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeSession === idx ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-tight">{s.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export / Quick helper */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex items-center gap-2">
          <button
            onClick={handleExportChat}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-[12px] font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ── CENTER PANEL: CONVERSATION AREA ────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">

        {/* Top Control Filters */}
        <div className="pt-4 px-5 flex items-center justify-end z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Grounding Scope Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 p-0.5 rounded-md ml-2">
              {[
                { id: 'all', label: `Global (${allPapers.length})` },
                { id: 'saved', label: `My Library (${savedPaperIds.length})` },
              ].map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setGroundingScope(scope.id as any)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${
                    groundingScope === scope.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setPrompt('Generate a comprehensive literature matrix comparing architectures, benchmarks, and training schemes across all my saved papers.');
                inputRef.current?.focus();
              }}
              className="text-[11px] font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-all hidden md:flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Compare Models
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-thin bg-white rounded-t-xl border border-gray-200 border-b-0 shadow-sm ml-0 lg:ml-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {chatMessages.map(msg => {
                if (msg.sender === 'user') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[85%] bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                        <p className="text-[14px] text-white leading-relaxed font-medium">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-900">ResearchGraph AI</span>
                      </div>

                      <div className="pl-9 flex flex-col gap-3">
                        {/* Message Content with Markdown Formatting */}
                        <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </div>

                        {/* Interactive Table if available */}
                        {msg.table && (
                          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm my-2">
                            <div className="overflow-x-auto">
                              <table className="w-full text-[13px] text-left border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-200">
                                    {msg.table.headers.map((h, i) => (
                                      <th key={i} className="p-3 font-bold text-gray-900">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {msg.table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-3 text-gray-700">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Interactive Code Snippet */}
                        {msg.codeSnippet && (
                          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm my-2">
                            <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between text-[11px]">
                              <span className="font-mono text-gray-900 font-bold uppercase">{msg.codeSnippet.language}</span>
                              <button
                                onClick={() => handleCopyCode(msg.id, msg.codeSnippet!.code)}
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
                              >
                                {copiedCodeIdx === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="text-[11px] font-medium">{copiedCodeIdx === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto font-mono text-[13px] text-gray-800 leading-normal">
                              <code>{msg.codeSnippet.code}</code>
                            </pre>
                          </div>
                        )}

                        {/* Response Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedMsgId === msg.id ? 'Copied Answer' : 'Copy'}
                          </button>

                          {msg.papers && msg.papers.length > 0 && (
                            <button
                              onClick={() => {
                                msg.papers!.forEach(p => {
                                  if (!savedPaperIds.includes(p.id)) toggleSavedPaper(p.id);
                                });
                                alert('Added cited papers to your library!');
                              }}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 transition-colors"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              Bookmark Cited Papers ({msg.papers.length})
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>

            {isTyping && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-bold text-gray-900">ResearchGraph AI</span>
                </div>
                <div className="pl-9 flex items-center gap-1.5 h-6">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-x border-gray-200 ml-0 lg:ml-4">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(prompt); }}
            className="max-w-3xl mx-auto relative flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a research inquiry (e.g. Compare DINOv2 vs CLIP)..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full h-12 pl-4 pr-14 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT PANEL: GROUNDED SOURCES & CITATIONS ──────────────── */}
      <aside className="w-80 bg-white rounded-xl border border-gray-200 hidden xl:flex flex-col shrink-0 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[14px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-blue-600" />
            Sources
          </span>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            {currentSources.length} Papers
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {currentSources.length > 0 ? (
            currentSources.map((paper, idx) => {
              const isSaved = savedPaperIds.includes(paper.id);
              return (
                <div
                  key={paper.id}
                  className="p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col gap-2 group cursor-pointer"
                  onClick={() => handlePaperClick(paper.id)}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[9px] font-semibold">
                        [{idx + 1}] {paper.venue} {paper.year}
                      </span>
                      <span className="text-[9px] text-amber-500 font-mono flex items-center gap-0.5 font-medium">
                        <Star className="w-2.5 h-2.5" fill="currentColor" /> {(paper.citations / 1000).toFixed(1)}k
                      </span>
                    </div>

                    <h4 className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                      {paper.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{paper.authors.join(', ')}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSavedPaper(paper.id); }}
                      className={`text-[10px] font-semibold flex items-center gap-1 ${
                        isSaved ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Bookmark className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} />
                      {isSaved ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPaperId(paper.id); setActivePage('graph'); }}
                      className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
                    >
                      Graph <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4 text-gray-500">
              <BrainCircuit className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-[12px] font-bold text-gray-400">Context Grounds Here</p>
              <p className="text-[10px] text-gray-600 mt-1">
                Ask a question to see primary literature citations and evidence grounding.
              </p>
            </div>
          )}

          {/* Topological Concepts */}
          {currentConcepts.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Related Concepts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentConcepts.map((concept, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(`Explore the relationship between ${concept} and other foundation models.`);
                      inputRef.current?.focus();
                    }}
                    className="px-2 py-1 rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[10px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {concept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
