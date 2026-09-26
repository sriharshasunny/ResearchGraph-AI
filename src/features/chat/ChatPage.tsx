import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { searchPapers } from '../../services/api';
import type { ChatMessage, Paper } from '../../types';
import { Send, Sparkles, HelpCircle, Terminal, Trash2, ListFilter, BrainCircuit, Network, BookMarked, MessageSquare, Activity } from 'lucide-react';
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
      let content = '';
      let citations: { id: string; index: number; title: string }[] = [];
      let paperList: Paper[] = [];
      let codeSnippet: { language: string; code: string } | undefined;
      let table: { headers: string[]; rows: string[][] } | undefined;
      let relatedConcepts: string[] = [];

      const lowerText = textToSend.toLowerCase();

      if (lowerText.includes('explain') && (lowerText.includes('vision') || lowerText.includes('vit'))) {
        content = `The Vision Transformer (ViT) was introduced by Google Research in 2021 [1]. It represents a milestone in computer vision, removing convolutional operations completely and running standard NLP self-attention layers on 16x16 pixel patches of input images.\n\nHere is how it divides an image:\n- Divides image into patches.\n- Flattens patches and projects them linearily into a hidden size $D$.\n- Prepends a learnable \`[class]\` token to collect visual representations.\n- Adds standard 1D positional encodings.\n- Feeds sequence through standard Transformer encoder layers.`;
        relatedConcepts = ['Vision Transformer', 'Self-Attention', 'Patch Embedding', 'Image Classification'];
        codeSnippet = {
          language: 'python',
          code: `import torch\nimport torch.nn as nn\n\nclass PatchEmbedding(nn.Module):\n    def __init__(self, img_size=224, patch_size=16, in_chans=3, embed_dim=768):\n        super().__init__()\n        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)\n\n    def forward(self, x):\n        return self.proj(x).flatten(2).transpose(1, 2)`
        };
      } else if (lowerText.includes('compare') && (lowerText.includes('clip') || lowerText.includes('dino'))) {
        content = `Comparing CLIP and DINOv2 reveals fundamental trade-offs in downstream task performance [1, 2]. \n\n* CLIP excels at semantic zero-shot classification.\n* DINOv2 excels at dense downstream tasks.`;
        relatedConcepts = ['Contrastive Learning', 'Self-Supervised Learning', 'Zero-shot Transfer', 'Knowledge Distillation'];
        table = {
          headers: ['Metric / Feature', 'CLIP (Radford et al.)', 'DINOv2 (Oquab et al.)'],
          rows: [
            ['Training Supervision', 'Weak Language-Image Contrastive', 'Unsupervised Self-Distillation'],
            ['Ideal Tasks', 'Zero-shot classification', 'Depth estimation, Segmentation'],
            ['Visual Resolution', 'Optimized for global tags', 'Superb local patch consistency']
          ]
        };
      } else if (lowerText.includes('literature review')) {
        content = `I have compiled a semantic review of the top Vision models in the index. The analysis focuses on the transition from Supervised Transformer training to Multimodal contrastive and Self-supervised representations [1, 2, 3].`;
        relatedConcepts = ['Literature Review', 'Foundation Models', 'Computer Vision Evolution'];
      } else {
        content = `Based on the active paper index, your query relates to key challenges in model scale and dataset bias [1]. Many recent papers resolve this by applying self-attention mechanisms or contrastive pre-training.\n\nCould you specify which papers you would like to cross-reference?`;
        relatedConcepts = ['Model Scaling', 'Optimization', 'Self-Attention'];
      }

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
    }, 1500); // Increased latency for realism
  };

  const latestContextMsg = [...chatMessages].reverse().find(msg => msg.sender === 'assistant' && ((msg.papers && msg.papers.length > 0) || (msg.relatedConcepts && msg.relatedConcepts.length > 0)));
  const currentSources = latestContextMsg?.papers || [];
  const currentConcepts = latestContextMsg?.relatedConcepts || [];

  return (
    <div className="flex h-[calc(100vh-140px)] w-full mx-auto rounded-3xl border border-white/10 bg-[#070b14]/80 backdrop-blur-2xl shadow-2xl mx-4 my-2 overflow-hidden relative">
      
      {/* Sci-Fi Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

      {/* Left Panel: Conversation History */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between hidden lg:flex flex-shrink-0 bg-[#0a0f1c]/50">
        <div className="p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            Sessions
          </span>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="text-gray-500 hover:text-cyan-400 transition-colors p-1.5 hover:bg-white/5 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {conversationHistory.map((item, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all flex items-start gap-3 group border ${
                item.active
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'text-gray-400 hover:bg-white/5 border-transparent hover:border-white/10'
              }`}
            >
              <MessageSquare className={`h-4 w-4 mt-0.5 shrink-0 ${item.active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`} />
              <div className="flex-1 min-w-0">
                <div className={`truncate ${item.active ? 'font-bold' : 'font-medium group-hover:text-white'}`}>{item.title}</div>
                <div className="text-[11px] opacity-70 mt-0.5">{item.date}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Center Panel: Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-10">
        <div className="h-16 border-b border-white/10 flex items-center px-8 flex-shrink-0 bg-[#070b14]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                 <BrainCircuit className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                 <h2 className="text-[14px] font-bold text-white leading-tight">ResearchGraph Core</h2>
                 <p className="text-[11px] text-cyan-400/80 font-mono tracking-wide">RAG SYNTHESIS UPLINK</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
               <Activity className="w-3 h-3 animate-pulse" /> SYSTEM ONLINE
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scrollbar-thin">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {chatMessages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-end">
                      <div className="max-w-[85%] bg-[#0c1427] border border-cyan-500/20 rounded-2xl rounded-tr-sm px-5 py-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">Researcher</h3>
                        <div className="text-[15px] font-medium text-white leading-snug">{msg.content}</div>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex justify-start">
                      <div className="max-w-[95%]">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="h-6 w-6 rounded-md bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                              <Sparkles className="h-3 w-3 text-purple-400" />
                           </div>
                           <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">ResearchGraph AI</h3>
                        </div>
                        
                        <div className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-line mb-6 pl-8 font-light">
                          {msg.content}
                        </div>

                        <div className="pl-8">
                          {msg.codeSnippet && (
                            <div className="mb-6 rounded-xl border border-white/10 overflow-hidden bg-[#05080f] shadow-lg font-mono text-[13px]">
                              <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                                  <Terminal className="h-3.5 w-3.5" /> {msg.codeSnippet.language}
                                </div>
                              </div>
                              <pre className="p-4 overflow-x-auto text-gray-300"><code>{msg.codeSnippet.code}</code></pre>
                            </div>
                          )}
                          {msg.table && (
                            <div className="mb-6 overflow-x-auto rounded-xl border border-white/10 shadow-lg bg-[#05080f]">
                              <table className="w-full text-[13px] text-left border-collapse">
                                <thead>
                                  <tr className="bg-white/5 border-b border-white/10">
                                    {msg.table.headers.map((h, i) => <th key={i} className="p-3 font-semibold text-gray-200">{h}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  {msg.table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                                      {row.map((cell, cIdx) => <td key={cIdx} className="p-3 text-gray-400 leading-normal">{cell}</td>)}
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

            {isTyping && (
              <div className="mb-10 flex justify-start">
                 <div className="max-w-[95%]">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-6 w-6 rounded-md bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                          <Sparkles className="h-3 w-3 text-purple-400" />
                       </div>
                       <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">ResearchGraph AI</h3>
                    </div>
                    <div className="pl-8 flex items-center gap-1.5 h-6 mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {chatMessages.length === 1 && !isTyping && (
          <div className="px-8 pb-4 w-full">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-3">
                <HelpCircle className="h-3.5 w-3.5" /> Research Suggestions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samplePrompts.map((promptObj, idx) => (
                  <button key={idx} onClick={() => handleSend(promptObj.text)} className="text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all">
                    <div className="text-[13px] font-bold text-white hover:text-cyan-300 transition-colors mb-1">{promptObj.text}</div>
                    <div className="text-[12px] text-gray-400 leading-relaxed">{promptObj.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-white/10 bg-[#070b14]/50 backdrop-blur-md">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(prompt); }} className="relative flex items-center max-w-3xl mx-auto group">
            <div className="relative w-full flex items-center">
              <input type="text" placeholder="Initiate RAG synthesis query..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-14 pl-5 pr-14 rounded-xl border border-white/15 bg-[#0a0f1c] text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-lg" />
              <button type="submit" disabled={!prompt.trim()} className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel: Context & Graph */}
      <aside className="w-72 border-l border-white/10 hidden xl:flex flex-col bg-[#0a0f1c]/50 flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <span className="text-[12px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Network className="h-4 w-4" /> Active Context
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {currentSources.length > 0 || currentConcepts.length > 0 ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              {currentSources.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookMarked className="h-3.5 w-3.5 text-cyan-400" /> Cited Papers
                  </h4>
                  <div className="space-y-2">
                    {currentSources.map((paper, idx) => (
                      <div key={paper.id} onClick={() => handlePaperClick(paper.id)} className="group p-3 rounded-xl border border-white/10 bg-[#070b14] hover:border-cyan-500/50 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#070b14] bg-cyan-400 px-1.5 rounded-sm mt-0.5 font-mono">[{idx + 1}]</span>
                          <span className="text-[13px] font-bold text-gray-200 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">{paper.title}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 pl-7 line-clamp-1 font-medium">{paper.authors[0]} et al. • {paper.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentConcepts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Network className="h-3.5 w-3.5 text-purple-400" /> Topologies
                  </h4>
                  <div className="p-4 rounded-xl border border-white/10 bg-[#070b14] flex flex-wrap gap-2 shadow-sm">
                    {currentConcepts.map((concept, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 rounded-md hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer transition-colors shadow-sm">{concept}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
              <BrainCircuit className="h-10 w-10 text-cyan-500/50 mb-3 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              <p className="text-[13px] text-gray-500 font-medium">Context will map here as the RAG engine synthesizes research topologies.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
