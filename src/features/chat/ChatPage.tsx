import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import type { ChatMessage } from '../../types';
import { Send, Sparkles, BookOpen, Quote, HelpCircle, Terminal, Trash2, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatPage: React.FC = () => {
  const { chatMessages, addChatMessage, clearChat, setActivePage, setSelectedPaperId, addToRecentlyViewed } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { text: 'Explain Vision Transformer.', desc: 'Understand ViT core architecture' },
    { text: 'Compare DINOv2 and CLIP.', desc: 'SSL visual features vs Contrastive learning' },
    { text: 'Generate literature review.', desc: 'Compile summaries of core visual models' },
    { text: 'Find research gaps in Dense Vision.', desc: 'Explore resolution and scaling limitations' }
  ];

  const conversationHistory = [
    { title: 'Vision Transformer Arch', active: true, date: 'Today' },
    { title: 'CLIP Zero-Shot Evaluation', active: false, date: 'Today' },
    { title: 'DINOv2 Feature Space Distillation', active: false, date: 'Yesterday' },
    { title: 'Attention vs Convolutions', active: false, date: '3 days ago' }
  ];

  // Auto-scroll chat area
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handlePaperClick = (id: string) => {
    setSelectedPaperId(id);
    addToRecentlyViewed(id);
    setActivePage('details');
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // User Message
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-u`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addChatMessage(userMsg);
    setPrompt('');
    setIsTyping(true);

    // Simulate Research AI response
    setTimeout(() => {
      let content = '';
      let citations: { id: string; index: number; title: string }[] = [];
      let paperList: typeof mockPapers = [];
      let codeSnippet: { language: string; code: string } | undefined;
      let table: { headers: string[]; rows: string[][] } | undefined;

      const lowerText = textToSend.toLowerCase();

      if (lowerText.includes('explain') && (lowerText.includes('vision') || lowerText.includes('vit'))) {
        content = `The **Vision Transformer (ViT)** was introduced by Google Research in 2021 [1]. It represents a milestone in computer vision, removing convolutional operations completely and running standard NLP self-attention layers on 16x16 pixel patches of input images.\n\nHere is how it divides an image:\n- Divides image into patches: $x \\in \\mathbb{R}^{H \\times W \\times C} \\to x_p \\in \\mathbb{R}^{N \\times (P^2 \\cdot C)}$ where patch size $P=16$.\n- Flattens patches and projects them linearily into a hidden size $D$.\n- Prepends a learnable \`[class]\` token to collect visual representations.\n- Adds standard 1D positional encodings.\n- Feeds sequence through standard Transformer encoder layers.`;
        citations = [{ id: 'vit-2021', index: 1, title: 'An Image is Worth 16x16 Words' }];
        paperList = [mockPapers.find(p => p.id === 'vit-2021')].filter(Boolean) as any;
        codeSnippet = {
          language: 'python',
          code: `import torch
import torch.nn as nn

class PatchEmbedding(nn.Module):
    def __init__(self, img_size=224, patch_size=16, in_chans=3, embed_dim=768):
        super().__init__()
        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        # x shape: [B, C, H, W] -> proj [B, D, H/16, W/16] -> flatten [B, D, N] -> transpose [B, N, D]
        return self.proj(x).flatten(2).transpose(1, 2)`
        };
      } else if (lowerText.includes('compare') && (lowerText.includes('clip') || lowerText.includes('dino'))) {
        content = `Comparing **CLIP** (Weakly Supervised Contrastive Learning) and **DINOv2** (Self-Supervised Self-Distillation) reveals fundamental trade-offs in downstream task performance [1, 2]. \n\n* **CLIP** excels at semantic zero-shot classification and text-image bridges because it was trained with weak captions.\n* **DINOv2** excels at dense downstream tasks (monocular depth, segmentation, semantic boundary alignment) because it optimizes local pixel details via masked image modeling.`;
        citations = [
          { id: 'clip-2021', index: 1, title: 'Learning Transferable Visual Models' },
          { id: 'dinov2-2023', index: 2, title: 'DINOv2: Robust Visual Features without Supervision' }
        ];
        paperList = mockPapers.filter(p => p.id === 'clip-2021' || p.id === 'dinov2-2023');
        table = {
          headers: ['Metric / Feature', 'CLIP (Radford et al.)', 'DINOv2 (Oquab et al.)'],
          rows: [
            ['Training Supervision', 'Weak Language-Image Contrastive (400M pairs)', 'Unsupervised Self-Distillation (142M images)'],
            ['Ideal Tasks', 'Zero-shot classification, Text-to-Image queries', 'Depth estimation, Semantic segmentation, Part discovery'],
            ['Visual Resolution', 'Optimized for global image tags', 'Superb local patch consistency (pixel-level embeddings)'],
            ['Backbone', 'ViT or ResNet variants', 'ViT only (distilled up to 1.1B parameters)']
          ]
        };
      } else if (lowerText.includes('literature review')) {
        content = `I have compiled a semantic review of the top Vision models in the index. The analysis focuses on the transition from **Supervised Transformer training** to **Multimodal contrastive** and **Self-supervised representations** [1, 2, 3].\n\nThese papers set the foundation for the visual foundation backbones widely used today in robotics, agent models, and synthesis pipelines.`;
        citations = [
          { id: 'vit-2021', index: 1, title: 'An Image is Worth 16x16 Words' },
          { id: 'clip-2021', index: 2, title: 'Learning Transferable Visual Models' },
          { id: 'dinov2-2023', index: 3, title: 'DINOv2: Robust Visual Features without Supervision' }
        ];
        paperList = mockPapers.slice(0, 3);
      } else {
        content = `Based on the active paper index, **"${textToSend}"** relates to key challenges in model scale, optimization bottlenecks, and dataset bias [1]. Many recent papers resolve this by applying self-attention mechanisms or contrastive pre-training to specialize representations.\n\nCould you specify which papers or benchmarks you would like to cross-reference?`;
        citations = [{ id: 'transformer-2017', index: 1, title: 'Attention Is All You Need' }];
        paperList = [mockPapers.find(p => p.id === 'transformer-2017')].filter(Boolean) as any;
      }

      addChatMessage({
        id: `chat-${Date.now()}-a`,
        sender: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        papers: paperList,
        codeSnippet,
        table
      });
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] max-w-7xl mx-auto px-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm overflow-hidden select-none">
      
      {/* Left Chat History Panel (Desktop) */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/40 flex flex-col justify-between hidden md:flex flex-shrink-0 bg-slate-50/20 dark:bg-slate-950/10">
        <div className="p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/30 flex-shrink-0">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ListFilter className="h-4.5 w-4.5 text-indigo-500" />
            Conversations
          </span>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5">
          {conversationHistory.map((item, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                item.active
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200/60 dark:border-slate-800 shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'
              }`}
            >
              <div className="truncate">{item.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.date}</div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/30 text-[10px] text-slate-400 text-center leading-normal">
          Chat history is cached in your local active workspace.
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/10 dark:bg-slate-900/10">
        
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200/60 dark:border-slate-800/30 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Semantic Co-pilot</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200/30 dark:border-slate-800/30">
            GPT-4o Synthesizer
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <AnimatePresence>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-4xl ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-black shadow shadow-indigo-600/20">
                    AI
                  </div>
                )}

                <div className="space-y-3">
                  {/* Bubble body */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed max-w-2xl border ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                        : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {/* Render basic custom markup (bullet points, bolding) */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.content}
                    </div>
                  </div>

                  {/* Optional Assistant Renderables (Table, Code block, Papers cards) */}
                  {msg.sender === 'assistant' && (
                    <div className="space-y-4 ml-1">
                      {/* Comparison Table */}
                      {msg.table && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md max-w-2xl shadow-sm">
                          <table className="w-full text-[11px] text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/40">
                                {msg.table.headers.map((h, i) => (
                                  <th key={i} className="p-3 font-bold text-slate-700 dark:text-slate-350">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {msg.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-150/40 dark:border-slate-800/20 hover:bg-slate-50/20">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3 text-slate-650 dark:text-slate-350 leading-normal">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Code Block */}
                      {msg.codeSnippet && (
                        <div className="rounded-xl border border-slate-250/80 dark:border-slate-800/60 bg-slate-950 text-slate-100 max-w-2xl overflow-hidden font-mono shadow-md">
                          <div className="h-8 bg-slate-900/80 px-4 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-850">
                            <span className="flex items-center gap-1.5">
                              <Terminal className="h-3.5 w-3.5" />
                              {msg.codeSnippet.language}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(msg.codeSnippet!.code)}
                              className="hover:text-white font-semibold transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 text-[10.5px] leading-relaxed overflow-x-auto">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        </div>
                      )}

                      {/* Related Papers Cards */}
                      {msg.papers && msg.papers.length > 0 && (
                        <div className="space-y-2 max-w-xl">
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Cited Papers in index
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.papers.map((paper) => (
                              <div
                                key={paper.id}
                                onClick={() => handlePaperClick(paper.id)}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 hover:border-indigo-500/20 cursor-pointer shadow-sm group transition-all"
                              >
                                <div className="space-y-0.5 truncate pr-4">
                                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors truncate">
                                    {paper.title}
                                  </div>
                                  <div className="text-[10px] text-slate-450 dark:text-slate-450 truncate">
                                    {paper.authors.join(', ')} &bull; {paper.publication}
                                  </div>
                                </div>
                                <span className="flex-shrink-0 flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/10">
                                  <Quote className="h-2.5 w-2.5" />
                                  {paper.citationCount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-[9px] text-slate-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80"
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing animation block */}
          {isTyping && (
            <div className="flex gap-4 mr-auto">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-black shadow">
                AI
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/50 rounded-tl-none flex items-center gap-1 min-h-[36px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Grid (Only visible if chat is fresh or just welcome message) */}
        {chatMessages.length === 1 && !isTyping && (
          <div className="px-6 pb-2 pt-4 border-t border-slate-200/30 dark:border-slate-800/20 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
              <HelpCircle className="h-3.5 w-3.5" />
              Suggested Queries
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((promptObj, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(promptObj.text)}
                  className="text-left p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 hover:border-indigo-500/20 transition-all shadow-sm"
                >
                  <div className="text-xs font-bold text-slate-850 dark:text-slate-200">{promptObj.text}</div>
                  <div className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{promptObj.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-6 border-t border-slate-200/60 dark:border-slate-800/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(prompt);
            }}
            className="relative flex items-center max-w-4xl mx-auto"
          >
            <input
              type="text"
              placeholder="Ask a question about vision models or explain papers..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-12 pl-4 pr-14 rounded-xl border border-slate-200/85 dark:border-slate-800/85 bg-white dark:bg-slate-950/40 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-inner"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-755 text-white flex items-center justify-center transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
