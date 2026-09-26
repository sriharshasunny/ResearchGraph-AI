import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { searchPapers } from '../../services/api';
import type { ChatMessage, Paper } from '../../types';
import { Send, Sparkles, HelpCircle, Terminal, Trash2, ListFilter, BrainCircuit, Network, BookMarked, MessageSquare } from 'lucide-react';
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
      let paperList: Paper[] = [];
      let codeSnippet: { language: string; code: string } | undefined;
      let table: { headers: string[]; rows: string[][] } | undefined;
      let relatedConcepts: string[] = [];

      const lowerText = textToSend.toLowerCase();

      if (lowerText.includes('explain') && (lowerText.includes('vision') || lowerText.includes('vit'))) {
        content = `The Vision Transformer (ViT) was introduced by Google Research in 2021 [1]. It represents a milestone in computer vision, removing convolutional operations completely and running standard NLP self-attention layers on 16x16 pixel patches of input images.\n\nHere is how it divides an image:\n- Divides image into patches: $x \\in \\mathbb{R}^{H \\times W \\times C} \\to x_p \\in \\mathbb{R}^{N \\times (P^2 \\cdot C)}$ where patch size $P=16$.\n- Flattens patches and projects them linearily into a hidden size $D$.\n- Prepends a learnable \`[class]\` token to collect visual representations.\n- Adds standard 1D positional encodings.\n- Feeds sequence through standard Transformer encoder layers.`;
        relatedConcepts = ['Vision Transformer', 'Self-Attention', 'Patch Embedding', 'Image Classification'];
        codeSnippet = {
          language: 'python',
          code: `import torch\nimport torch.nn as nn\n\nclass PatchEmbedding(nn.Module):\n    def __init__(self, img_size=224, patch_size=16, in_chans=3, embed_dim=768):\n        super().__init__()\n        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)\n\n    def forward(self, x):\n        # x shape: [B, C, H, W] -> proj [B, D, H/16, W/16] -> flatten [B, D, N] -> transpose [B, N, D]\n        return self.proj(x).flatten(2).transpose(1, 2)`
        };
      } else if (lowerText.includes('compare') && (lowerText.includes('clip') || lowerText.includes('dino'))) {
        content = `Comparing CLIP (Weakly Supervised Contrastive Learning) and DINOv2 (Self-Supervised Self-Distillation) reveals fundamental trade-offs in downstream task performance [1, 2]. \n\n* CLIP excels at semantic zero-shot classification and text-image bridges because it was trained with weak captions.\n* DINOv2 excels at dense downstream tasks (monocular depth, segmentation, semantic boundary alignment) because it optimizes local pixel details via masked image modeling.`;
        relatedConcepts = ['Contrastive Learning', 'Self-Supervised Learning', 'Zero-shot Transfer', 'Knowledge Distillation'];
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
        content = `I have compiled a semantic review of the top Vision models in the index. The analysis focuses on the transition from Supervised Transformer training to Multimodal contrastive and Self-supervised representations [1, 2, 3].\n\nThese papers set the foundation for the visual foundation backbones widely used today in robotics, agent models, and synthesis pipelines.`;
        relatedConcepts = ['Literature Review', 'Foundation Models', 'Computer Vision Evolution'];
      } else {
        content = `Based on the active paper index, your query relates to key challenges in model scale, optimization bottlenecks, and dataset bias [1]. Many recent papers resolve this by applying self-attention mechanisms or contrastive pre-training to specialize representations.\n\nCould you specify which papers or benchmarks you would like to cross-reference?`;
        relatedConcepts = ['Model Scaling', 'Optimization', 'Self-Attention'];
      }

      // Try to resolve papers asynchronously based on the topic
      const resolvePapers = async () => {
        try {
          if (lowerText.includes('vit') || lowerText.includes('transformer')) {
            const results = await searchPapers('vision transformer');
            paperList = results.slice(0, 1);
            if (paperList.length > 0) citations = [{ id: paperList[0].id, index: 1, title: paperList[0].title }];
          } else if (lowerText.includes('clip') || lowerText.includes('dino')) {
            const results = await searchPapers('clip dinov2');
            paperList = results.slice(0, 2);
            citations = paperList.map((p, i) => ({ id: p.id, index: i + 1, title: p.title }));
          } else if (lowerText.includes('literature review')) {
            const results = await searchPapers('computer vision foundation models');
            paperList = results.slice(0, 3);
            citations = paperList.map((p, i) => ({ id: p.id, index: i + 1, title: p.title }));
          } else {
            const results = await searchPapers('attention is all you need');
            paperList = results.slice(0, 1);
            if (paperList.length > 0) citations = [{ id: paperList[0].id, index: 1, title: paperList[0].title }];
          }
        } catch (e) {
          console.error("Failed to fetch papers for chat", e);
        }

        addChatMessage({
          id: `chat-${Date.now()}-a`,
          sender: 'assistant',
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations,
          papers: paperList,
          codeSnippet,
          table,
          relatedConcepts
        });
        setIsTyping(false);
      };

      resolvePapers();

    }, 500);
  };

  // Derive latest context for the right panel
  const latestContextMsg = [...chatMessages].reverse().find(msg => msg.sender === 'assistant' && ((msg.papers && msg.papers.length > 0) || (msg.relatedConcepts && msg.relatedConcepts.length > 0)));
  const currentSources = latestContextMsg?.papers || [];
  const currentConcepts = latestContextMsg?.relatedConcepts || [];

  return (
    <div className="flex h-[calc(100vh-100px)] w-full mx-auto rounded-2xl border border-brand-border/40 bg-brand-bg overflow-hidden shadow-2xl shadow-brand-bg/50">
      
      {/* Left Panel: Conversation History */}
      <aside className="w-64 border-r border-brand-border/40 flex flex-col justify-between hidden lg:flex flex-shrink-0 bg-brand-surface/30 backdrop-blur-md">
        <div className="p-5 flex items-center justify-between border-b border-brand-border/40 flex-shrink-0">
          <span className="text-[12px] font-bold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            Sessions
          </span>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="text-brand-textMuted hover:text-brand-accent transition-colors p-1.5 hover:bg-brand-accent/10 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {conversationHistory.map((item, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all flex items-start gap-3 group ${
                item.active
                  ? 'bg-brand-accent/10 border border-brand-accent/30 text-brand-text shadow-sm'
                  : 'text-brand-textMuted hover:bg-brand-surface border border-transparent'
              }`}
            >
              <MessageSquare className={`h-4 w-4 mt-0.5 shrink-0 ${item.active ? 'text-brand-accent' : 'text-brand-textMuted group-hover:text-brand-text'} transition-colors`} />
              <div className="flex-1 min-w-0">
                <div className={`truncate ${item.active ? 'font-semibold text-brand-accent' : 'font-medium group-hover:text-brand-text'}`}>{item.title}</div>
                <div className="text-[11px] opacity-60 mt-0.5">{item.date}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Center Panel: Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-surface/60 backdrop-blur-md relative">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-brand-border/40 flex items-center px-8 flex-shrink-0 bg-brand-surface/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]">
               <BrainCircuit className="h-4 w-4 text-brand-accent" />
            </div>
            <div>
               <h2 className="text-[14px] font-bold text-brand-text leading-tight">ResearchGraph AI</h2>
               <p className="text-[11px] text-brand-textMuted font-medium tracking-wide">ACADEMIC RESEARCH ASSISTANT</p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scrollbar-thin">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {chatMessages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 flex justify-end"
                    >
                      <div className="max-w-[85%] bg-brand-surface border border-brand-border/50 rounded-2xl rounded-tr-sm px-5 py-4 shadow-md">
                        <h3 className="text-[11px] font-bold text-brand-textMuted uppercase tracking-wider mb-1">You</h3>
                        <div className="text-[15px] font-medium text-brand-text leading-snug">
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-10 flex justify-start"
                    >
                      <div className="max-w-[95%]">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="h-6 w-6 rounded-md bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30">
                              <Sparkles className="h-3 w-3 text-brand-accent" />
                           </div>
                           <h3 className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">ResearchGraph AI</h3>
                        </div>
                        
                        <div className="text-[15px] text-brand-text/90 leading-relaxed whitespace-pre-line mb-6 pl-8">
                          {msg.content}
                        </div>

                        <div className="pl-8">
                          {/* Code Block */}
                          {msg.codeSnippet && (
                            <div className="mb-6 rounded-xl border border-brand-border/40 overflow-hidden bg-brand-bg/80 backdrop-blur-sm shadow-sm font-mono text-[13px]">
                              <div className="px-4 py-2 bg-brand-surface/80 border-b border-brand-border/40 flex items-center justify-between text-brand-textMuted">
                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                                  <Terminal className="h-3.5 w-3.5" />
                                  {msg.codeSnippet.language}
                                </div>
                              </div>
                              <pre className="p-4 overflow-x-auto text-brand-text">
                                <code>{msg.codeSnippet.code}</code>
                              </pre>
                            </div>
                          )}

                          {/* Comparison Table */}
                          {msg.table && (
                            <div className="mb-6 overflow-x-auto rounded-xl border border-brand-border/40 shadow-sm">
                              <table className="w-full text-[13px] text-left border-collapse">
                                <thead>
                                  <tr className="bg-brand-surface border-b border-brand-border/40">
                                    {msg.table.headers.map((h, i) => (
                                      <th key={i} className="p-3 font-semibold text-brand-text">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {msg.table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-brand-border/30 last:border-0 hover:bg-brand-bg transition-colors">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-3 text-brand-textMuted leading-normal">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>

            {/* Typing animation block */}
            {isTyping && (
              <div className="mb-10 flex justify-start">
                 <div className="max-w-[95%]">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-6 w-6 rounded-md bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30">
                          <Sparkles className="h-3 w-3 text-brand-accent" />
                       </div>
                       <h3 className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">ResearchGraph AI</h3>
                    </div>
                    <div className="pl-8 flex items-center gap-1.5 h-6 mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce"></span>
                    </div>
                 </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Suggested Questions Grid (Only visible if chat is fresh or just welcome message) */}
        {chatMessages.length === 1 && !isTyping && (
          <div className="px-8 pb-4 w-full">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-textMuted uppercase tracking-wider mb-3">
                <HelpCircle className="h-3.5 w-3.5" />
                Research Suggestions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samplePrompts.map((promptObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(promptObj.text)}
                    className="text-left p-4 rounded-xl border border-brand-border/40 bg-brand-surface/40 hover:border-brand-accent/50 hover:bg-brand-surface hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/0 via-brand-accent/5 to-brand-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="text-[13px] font-bold text-brand-text group-hover:text-brand-accent transition-colors mb-1">{promptObj.text}</div>
                      <div className="text-[12px] text-brand-textMuted leading-relaxed">{promptObj.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-6 border-t border-brand-border/40 bg-brand-surface/80 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(prompt);
            }}
            className="relative flex items-center max-w-3xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/0 via-brand-accent/10 to-brand-accent/0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Ask your research assistant..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-14 pl-5 pr-14 rounded-xl border border-brand-border/50 bg-brand-bg text-[15px] text-brand-text placeholder-brand-textMuted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-brand-accent text-brand-bg hover:bg-brand-accentHover flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,209,255,0.3)] disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel: Context & Knowledge Graph */}
      <aside className="w-72 border-l border-brand-border/40 hidden xl:flex flex-col bg-brand-surface/30 backdrop-blur-md flex-shrink-0">
        <div className="p-5 border-b border-brand-border/40">
          <span className="text-[12px] font-bold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
            <Network className="h-4 w-4" />
            Active Context
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {currentSources.length > 0 || currentConcepts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Citations / Sources */}
              {currentSources.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-brand-text uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookMarked className="h-3.5 w-3.5 text-brand-accent" />
                    Cited Papers
                  </h4>
                  <div className="space-y-2">
                    {currentSources.map((paper, idx) => (
                      <div
                        key={paper.id}
                        onClick={() => handlePaperClick(paper.id)}
                        className="group p-3 rounded-xl border border-brand-border/40 bg-brand-surface/50 hover:bg-brand-surface hover:border-brand-accent/40 cursor-pointer transition-all hover:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-[10px] font-bold text-brand-bg bg-brand-accent px-1.5 rounded-sm mt-0.5">[{idx + 1}]</span>
                          <span className="text-[13px] font-semibold text-brand-text group-hover:text-brand-accent transition-colors line-clamp-2 leading-tight">
                            {paper.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-brand-textMuted pl-7 line-clamp-1">
                          {paper.authors[0]} et al. • {paper.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Concepts (Knowledge Graph Preview) */}
              {currentConcepts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-brand-text uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Network className="h-3.5 w-3.5 text-brand-violet" />
                    Knowledge Graph
                  </h4>
                  <div className="p-4 rounded-xl border border-brand-border/40 bg-brand-surface/50 flex flex-wrap gap-2">
                    {currentConcepts.map((concept, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-[11px] font-medium text-brand-textMuted bg-brand-bg border border-brand-border/50 rounded-md hover:border-brand-violet hover:text-brand-violet cursor-pointer transition-colors">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
              <BrainCircuit className="h-10 w-10 text-brand-textMuted mb-3" />
              <p className="text-[13px] text-brand-textMuted">
                Context will appear here as the assistant retrieves papers and builds the knowledge graph.
              </p>
            </div>
          )}
        </div>
      </aside>

    </div>
  );
};
