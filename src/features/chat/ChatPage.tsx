import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { searchPapers } from '../../services/api';
import type { ChatMessage, Paper } from '../../types';
import { Send, Sparkles, BookOpen, ChevronRight, HelpCircle, Terminal, Trash2, ListFilter } from 'lucide-react';
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

  return (
    <div className="flex h-[calc(100vh-100px)] max-w-6xl mx-auto rounded-xl border border-brand-border bg-brand-surface overflow-hidden select-none">
      
      {/* Left Chat History Panel (Desktop) */}
      <aside className="w-64 border-r border-brand-border flex flex-col justify-between hidden md:flex flex-shrink-0 bg-brand-bg/50">
        <div className="p-5 flex items-center justify-between border-b border-brand-border flex-shrink-0">
          <span className="text-[13px] font-semibold text-brand-text uppercase tracking-wider flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-brand-textMuted" />
            History
          </span>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="text-brand-textMuted hover:text-brand-accent transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {conversationHistory.map((item, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                item.active
                  ? 'bg-brand-surface border border-brand-border text-brand-text font-medium shadow-sm'
                  : 'text-brand-textMuted hover:bg-brand-border/30 border border-transparent'
              }`}
            >
              <div className="truncate">{item.title}</div>
              <div className="text-[11px] text-brand-textMuted/70 mt-1">{item.date}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-surface relative">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-brand-border flex items-center px-8 flex-shrink-0 bg-brand-surface/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-brand-accent" />
            <h2 className="text-[15px] font-semibold text-brand-text">Research Assistant</h2>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {chatMessages.map((msg) => {
                // Group pairs of user/assistant if they follow each other, but for this layout
                // we'll just render them sequentially as blocks.
                
                if (msg.sender === 'user') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-10"
                    >
                      <h3 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider mb-3">User Question</h3>
                      <div className="text-[17px] font-medium text-brand-text leading-snug pl-4 border-l-2 border-brand-accent/50 py-1">
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-12 pb-12 border-b border-brand-border/40 last:border-0"
                    >
                      <h3 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                        AI Answer
                      </h3>
                      
                      <div className="text-[15px] text-brand-text leading-relaxed whitespace-pre-line mb-8">
                        {msg.content}
                      </div>

                      {/* Code Block */}
                      {msg.codeSnippet && (
                        <div className="mb-8 rounded-lg border border-brand-border overflow-hidden bg-brand-bg font-mono text-[13px]">
                          <div className="px-4 py-2 bg-brand-surface border-b border-brand-border flex items-center justify-between text-brand-textMuted">
                            <div className="flex items-center gap-2">
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
                        <div className="mb-8 overflow-x-auto rounded-lg border border-brand-border">
                          <table className="w-full text-[13px] text-left border-collapse">
                            <thead>
                              <tr className="bg-brand-bg border-b border-brand-border">
                                {msg.table.headers.map((h, i) => (
                                  <th key={i} className="p-3 font-semibold text-brand-text">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {msg.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-brand-border last:border-0 hover:bg-brand-bg/50 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3 text-brand-textMuted leading-normal">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Sources */}
                      {msg.papers && msg.papers.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Sources
                          </h4>
                          <div className="flex flex-col gap-2">
                            {msg.papers.map((paper) => (
                              <div
                                key={paper.id}
                                onClick={() => handlePaperClick(paper.id)}
                                className="group flex items-center gap-3 px-3 py-2 -mx-3 rounded-lg hover:bg-brand-bg cursor-pointer transition-colors"
                              >
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                  <span className="text-[14px] font-medium text-brand-text group-hover:text-brand-accent transition-colors truncate">
                                    {paper.title}
                                  </span>
                                  <span className="text-[12px] text-brand-textMuted truncate">
                                    {paper.authors[0]} et al. · {paper.year}
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-brand-border group-hover:text-brand-accent transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Concepts */}
                      {msg.relatedConcepts && msg.relatedConcepts.length > 0 && (
                        <div>
                          <h4 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider mb-3">
                            Related Concepts
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[13px] text-brand-text">
                            {msg.relatedConcepts.map((concept, idx) => (
                              <React.Fragment key={idx}>
                                <span className="px-3 py-1 bg-brand-bg border border-brand-border rounded-full hover:border-brand-accent hover:text-brand-accent cursor-pointer transition-colors">
                                  {concept}
                                </span>
                                {idx < msg.relatedConcepts!.length - 1 && (
                                  <ChevronRight className="h-3.5 w-3.5 text-brand-textMuted" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>

            {/* Typing animation block */}
            {isTyping && (
              <div className="mb-12">
                <h3 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                  AI Answer
                </h3>
                <div className="flex items-center gap-1.5 h-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce"></span>
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
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-textMuted uppercase tracking-wider mb-3">
                <HelpCircle className="h-3.5 w-3.5" />
                Suggested Queries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samplePrompts.map((promptObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(promptObj.text)}
                    className="text-left p-4 rounded-xl border border-brand-border bg-brand-bg hover:border-brand-accent/50 hover:bg-brand-surface transition-all group"
                  >
                    <div className="text-[14px] font-medium text-brand-text group-hover:text-brand-accent transition-colors">{promptObj.text}</div>
                    <div className="text-[12px] text-brand-textMuted mt-1">{promptObj.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-6 border-t border-brand-border bg-brand-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(prompt);
            }}
            className="relative flex items-center max-w-3xl mx-auto group"
          >
            <input
              type="text"
              placeholder="Ask a question about research concepts, methodologies, or specific papers..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-14 pl-5 pr-14 rounded-xl border border-brand-border bg-brand-bg text-[15px] text-brand-text placeholder-brand-textMuted focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-brand-text hover:bg-brand-textMuted text-brand-surface flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
