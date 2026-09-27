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
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-[#070b14] relative">

      {/* ── LEFT PANEL: RESEARCH SESSIONS ──────────────────────────── */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between hidden lg:flex shrink-0 bg-[#090d18]">
        <div>
          <div className="p-4 border-b border-white/8 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Inquiry Sessions
            </span>
            <button
              onClick={clearChat}
              title="Clear Session"
              className="text-gray-500 hover:text-rose-400 p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-1">
            {sessions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSession(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all flex items-center gap-2.5 ${
                  activeSession === idx
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-tight">{s.title}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{s.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export / Quick helper */}
        <div className="p-3 border-t border-white/8 bg-black/20">
          <button
            onClick={handleExportChat}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Chat as Markdown
          </button>
        </div>
      </aside>

      {/* ── CENTER PANEL: CONVERSATION AREA ────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">

        {/* Top Control HUD */}
        <div className="h-14 border-b border-white/10 px-5 flex items-center justify-between bg-[#080d19]/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-[13px] font-bold text-white">Literature Synthesis Copilot</span>
            </div>

            {/* Grounding Scope Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 ml-2">
              {[
                { id: 'all', label: `Global (${allPapers.length})` },
                { id: 'saved', label: `My Library (${savedPaperIds.length})` },
              ].map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setGroundingScope(scope.id as any)}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    groundingScope === scope.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPrompt('Generate a comprehensive literature matrix comparing architectures, benchmarks, and training schemes across all my saved papers.');
                inputRef.current?.focus();
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-cyan-300 px-2 py-1 rounded bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all hidden md:flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              Generate Comparison Matrix
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-thin">
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
                      <div className="max-w-[85%] bg-[#0e172a] border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg shadow-cyan-500/5">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Researcher</span>
                          <span className="text-[9px] text-gray-500 font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="text-[13px] text-white leading-relaxed font-medium">
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
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-300">ResearchGraph AI</span>
                        <span className="text-[9px] text-gray-600 font-mono">{msg.timestamp}</span>
                      </div>

                      <div className="pl-8 flex flex-col gap-3">
                        {/* Message Content with Markdown Formatting */}
                        <div className="text-[13px] text-gray-200 leading-relaxed whitespace-pre-line bg-[#090e1c] border border-white/8 rounded-2xl p-4 shadow-md">
                          {msg.content}
                        </div>

                        {/* Interactive Table if available */}
                        {msg.table && (
                          <div className="rounded-xl border border-white/10 overflow-hidden bg-[#050810] shadow-md">
                            <div className="overflow-x-auto">
                              <table className="w-full text-[12px] text-left border-collapse">
                                <thead>
                                  <tr className="bg-white/5 border-b border-white/10">
                                    {msg.table.headers.map((h, i) => (
                                      <th key={i} className="p-2.5 font-bold text-cyan-300 text-[11px]">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {msg.table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-2.5 text-gray-300">{cell}</td>
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
                          <div className="rounded-xl border border-white/10 overflow-hidden bg-[#04060c] shadow-lg">
                            <div className="px-3.5 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px]">
                              <span className="font-mono text-cyan-400 font-bold uppercase">{msg.codeSnippet.language}</span>
                              <button
                                onClick={() => handleCopyCode(msg.id, msg.codeSnippet!.code)}
                                className="flex items-center gap-1 text-gray-400 hover:text-white"
                              >
                                {copiedCodeIdx === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span className="text-[10px]">{copiedCodeIdx === msg.id ? 'Copied' : 'Copy Code'}</span>
                              </button>
                            </div>
                            <pre className="p-3.5 overflow-x-auto font-mono text-[11px] text-gray-300 leading-normal">
                              <code>{msg.codeSnippet.code}</code>
                            </pre>
                          </div>
                        )}

                        {/* Response Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white px-2 py-1 rounded bg-white/4 border border-white/8 transition-colors"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
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
                              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 transition-colors"
                            >
                              <BookmarkPlus className="w-3 h-3" />
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
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">Synthesizing Literature...</span>
                </div>
                <div className="pl-8 flex items-center gap-1.5 h-6">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-[#080d19]/90 backdrop-blur-md">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(prompt); }}
            className="max-w-3xl mx-auto relative flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a research inquiry (e.g. Compare DINOv2 vs CLIP, explain DeepSeek-R1 GRPO)..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full h-12 pl-4 pr-14 rounded-xl border border-white/15 bg-[#050811] text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-lg"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT PANEL: GROUNDED SOURCES & CITATIONS ──────────────── */}
      <aside className="w-80 border-l border-white/10 hidden xl:flex flex-col bg-[#090d18] shrink-0">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
            Grounded Citations
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
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
                  className="p-3 rounded-xl border border-white/8 bg-[#050811] hover:border-cyan-500/40 transition-all flex flex-col gap-2 group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] font-black">
                        [{idx + 1}] {paper.venue} {paper.year}
                      </span>
                      <span className="text-[9px] text-amber-400 font-mono flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" fill="currentColor" /> {(paper.citations / 1000).toFixed(1)}k
                      </span>
                    </div>

                    <h4
                      onClick={() => handlePaperClick(paper.id)}
                      className="text-[12px] font-bold text-gray-200 group-hover:text-white cursor-pointer line-clamp-2 leading-snug"
                    >
                      {paper.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{paper.authors.join(', ')}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => toggleSavedPaper(paper.id)}
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        isSaved ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} />
                      {isSaved ? 'In Library' : 'Save'}
                    </button>

                    <button
                      onClick={() => { setSelectedPaperId(paper.id); setActivePage('graph'); }}
                      className="text-[10px] font-bold text-gray-400 hover:text-cyan-300 flex items-center gap-1"
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
            <div className="pt-3 border-t border-white/8">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Topological Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentConcepts.map((concept, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(`Explore the relationship between ${concept} and other foundation models.`);
                      inputRef.current?.focus();
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/4 hover:bg-cyan-500/10 border border-white/8 hover:border-cyan-500/30 text-[10px] text-gray-300 hover:text-cyan-300 transition-colors"
                  >
                    #{concept}
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
