import type { Paper, Author, LitReview, Reference } from '../types';

export const mockAuthors: Author[] = [
  { id: '1', name: 'Yann LeCun', affiliation: 'New York University / Meta AI', hIndex: 140, citations: 245000, papersCount: 420, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '2', name: 'Geoffrey Hinton', affiliation: 'University of Toronto / Google', hIndex: 175, citations: 550000, papersCount: 350, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '3', name: 'Yoshua Bengio', affiliation: 'MILA / University of Montreal', hIndex: 165, citations: 480000, papersCount: 610, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '4', name: 'Andrew Ng', affiliation: 'Stanford University / Landing AI', hIndex: 132, citations: 280000, papersCount: 290, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '5', name: 'Fei-Fei Li', affiliation: 'Stanford University', hIndex: 120, citations: 220000, papersCount: 310, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '6', name: 'Kaiming He', affiliation: 'Meta AI / MIT', hIndex: 115, citations: 430000, papersCount: 95, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '7', name: 'Ashish Vaswani', affiliation: 'Adequate AI', hIndex: 45, citations: 125000, papersCount: 35, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '8', name: 'Alexey Dosovitskiy', affiliation: 'Google Research', hIndex: 58, citations: 98000, papersCount: 72, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '9', name: 'Alec Radford', affiliation: 'OpenAI', hIndex: 42, citations: 145000, papersCount: 28, avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: '10', name: 'Mostafa Dehghani', affiliation: 'Google DeepMind', hIndex: 38, citations: 42000, papersCount: 65, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' }
];

// 5 Core detailed papers
const corePapers: Paper[] = [
  {
    id: 'vit-2021',
    title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale',
    authors: ['Alexey Dosovitskiy', 'Lucas Beyer', 'Alexander Kolesnikov', 'Dirk Weissenborn', 'Mostafa Dehghani'],
    abstract: 'While the Transformer architecture has become the de facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place. We show that this reliance on CNNs is not necessary and a pure Transformer applied directly to sequences of image patches can perform very well on image classification tasks. When pre-trained on large amounts of data and transferred to multiple mid-sized or small image recognition benchmarks (ImageNet, CIFAR-100, VTAB, etc.), Vision Transformer (ViT) attains excellent results compared to state-of-the-art convolutional networks while requiring substantially fewer computational resources to train.',
    keywords: ['Vision Transformer', 'Self-Attention', 'Image Classification', 'Transfer Learning'],
    publication: 'ICLR 2021',
    year: 2021,
    citationCount: 42050,
    dataset: 'ImageNet-21k, JFT-300M',
    method: 'Patch Projection, Self-Attention',
    model: 'ViT-H/14',
    accuracy: '88.55% Top-1 on ImageNet',
    advantages: [
      'Eliminates convolutional inductive bias, enabling higher capacity on large datasets.',
      'Highly parallelizable architecture leading to significantly lower training costs.',
      'Learns global visual relations from the very first layer via self-attention.'
    ],
    limitations: [
      'Requires extremely large pre-training datasets to outperform CNNs due to lack of inductive bias.',
      'Quadratic complexity of self-attention with respect to the number of patches limits application on high-resolution images.'
    ],
    futureWork: [
      'Investigate self-supervised pre-training objectives suited specifically for visual Transformers.',
      'Develop linear complexity attention mechanisms for high-resolution dense prediction tasks like segmentation.'
    ],
    pdfUrl: '#',
    references: [
      { title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017 },
      { title: 'ImageNet: A Large-Scale Hierarchical Image Database', authors: 'Deng et al.', year: 2009 },
      { title: 'Deep Residual Learning for Image Recognition', authors: 'Kaiming He et al.', year: 2016 }
    ],
    relatedPapers: ['clip-2021', 'dinov2-2023', 'transformer-2017'],
    citations: ['clip-2021', 'dinov2-2023'],
    figures: ['Figure 1: ViT Model Architecture', 'Figure 2: Attention Map Visualizations', 'Figure 3: Performance vs Dataset Size Scale Chart'],
    timeline: [
      { year: 2020, event: 'First preprint uploaded to arXiv demonstrating CNN-free visual Transformers' },
      { year: 2021, event: 'Accepted as Oral presentation at ICLR 2021' },
      { year: 2022, event: 'Surpassed 10,000 citations, triggering a complete paradigm shift in Computer Vision research' }
    ],
    metrics: { citationVelocity: 8500, influentialCitations: 1420 }
  },
  {
    id: 'clip-2021',
    title: 'Learning Transferable Visual Models From Natural Language Supervision',
    authors: ['Alec Radford', 'Jong Wook Kim', 'Aditya Ramesh', 'Gabriel Goh', 'Ilya Sutskever'],
    abstract: 'State-of-the-art computer vision systems are trained to predict a fixed set of predetermined object categories. This restricted form of supervision limits their generality and usability since additional labeled data is needed to specify any other visual concept. Learning directly from raw text about images is a promising alternative which leverages a much broader source of supervision. We demonstrate that the simple pre-training task of predicting which caption goes with which image is an efficient and scalable way to learn SOTA image representations from scratch on a dataset of 400 million (image, text) pairs collected from the internet. After pre-training, natural language is used to reference learned visual concepts (or describe new ones) enabling zero-shot transfer of the model to downstream tasks.',
    keywords: ['Contrastive Learning', 'Multimodal', 'Zero-Shot Learning', 'Language-Image Embedding'],
    publication: 'ICML 2021',
    year: 2021,
    citationCount: 31200,
    dataset: 'WIT (WebImageText) 400M',
    method: 'Contrastive Language-Image Pre-training',
    model: 'CLIP-ViT-L/14',
    accuracy: '76.2% Zero-Shot on ImageNet',
    advantages: [
      'Excellent zero-shot generalization capabilities to completely unseen domains.',
      'Joint representation space bridges natural language and visual concepts seamlessly.',
      'Robustness to common distribution shifts compared to supervised classifiers.'
    ],
    limitations: [
      'Very poor fine-grained classification performance (e.g. distinguishing car models or flower species).',
      'Extremely high dataset curation cost and potential social biases inherited from raw web crawls.'
    ],
    futureWork: [
      'Exploring text-to-image synthesis using the aligned embedding space as a feedback/guidance mechanism.',
      'Extending contrastive training to video-audio-text modalities for general video understanding.'
    ],
    pdfUrl: '#',
    references: [
      { title: 'An Image is Worth 16x16 Words', authors: 'Dosovitskiy et al.', year: 2021 },
      { title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', year: 2018 }
    ],
    relatedPapers: ['vit-2021', 'dinov2-2023', 'transformer-2017'],
    citations: ['dinov2-2023'],
    figures: ['Figure 1: Contrastive Pre-training Loop', 'Figure 2: Zero-shot Classification Details', 'Figure 3: Robustness Comparison Under Out-Of-Distribution datasets'],
    timeline: [
      { year: 2021, event: 'Released by OpenAI alongside DALL-E, bridging text and images' },
      { year: 2023, event: 'Integrated as the primary vision encoder in stable diffusion models' }
    ],
    metrics: { citationVelocity: 6800, influentialCitations: 980 }
  },
  {
    id: 'dinov2-2023',
    title: 'DINOv2: Learning Robust Visual Features without Supervision',
    authors: ['Maxime Oquab', 'Timothée Darcet', 'Théo Moutakanni', 'Kaiming He', 'Jakob Verbeek'],
    abstract: 'Recent breakthroughs in document-level LLMs have been fueled by self-supervised pre-training. In computer vision, while self-supervised methods like DINO or iBOT have shown promising results, they are usually trained on small curated datasets. In this paper, we explore whether visual features can be learned without supervision on massive uncurated image collections. We propose a pipeline to curate a diverse dataset of 142 million images from public repositories, and train ViT models scaling up to 1.1 Billion parameters. We introduce several architectural and optimization improvements to stabilize training at this scale. The resulting models, called DINOv2, learn robust, general-purpose visual features that achieve state-of-the-art results on multiple visual tasks including depth estimation, semantic segmentation, and image retrieval without fine-tuning.',
    keywords: ['Self-Supervised Learning', 'Vision Transformer', 'Dense Prediction', 'Feature Representation'],
    publication: 'NeurIPS 2023',
    year: 2023,
    citationCount: 8400,
    dataset: 'LVD-142M (Uncurated Visual Database)',
    method: 'Self-distillation with multi-crop, masked image modeling',
    model: 'DINOv2-ViT-g (1.1B params)',
    accuracy: '86.5% Linear Probe on ImageNet',
    advantages: [
      'Learns local details (e.g. depth, boundaries) alongside global semantics.',
      'Outperforms weakly supervised models (like CLIP) on dense downstream tasks.',
      'Extremely stable representation space, ideal as a general-purpose vision backbone.'
    ],
    limitations: [
      'Massive computational footprint during training (requires thousands of GPU hours).',
      'Feature outputs can be sensitive to specific image aspect ratios and resolutions.'
    ],
    futureWork: [
      'Scale self-supervised visual features to video datasets to capture temporal dynamics.',
      'Investigate hardware-efficient distillation techniques to run ViT-g models on edge devices.'
    ],
    pdfUrl: '#',
    references: [
      { title: 'Emerging Properties in Self-Supervised Vision Transformers', authors: 'Caron et al.', year: 2021 },
      { title: 'An Image is Worth 16x16 Words', authors: 'Dosovitskiy et al.', year: 2021 }
    ],
    relatedPapers: ['vit-2021', 'clip-2021'],
    citations: [],
    figures: ['Figure 1: DINOv2 Self-Supervised Paradigm', 'Figure 2: Dense Feature Maps Visualizations', 'Figure 3: Semantic Segmentation and Monocular Depth Maps Outputs'],
    timeline: [
      { year: 2023, event: 'Published in NeurIPS 2023, open sourced by Meta AI' },
      { year: 2024, event: 'Became the default visual feature extractor for robotic manipulation and medical imaging UIs' }
    ],
    metrics: { citationVelocity: 3500, influentialCitations: 540 }
  },
  {
    id: 'transformer-2017',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Yoshua Bengio'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU.',
    keywords: ['Self-Attention', 'Transformer', 'Sequence-to-Sequence', 'Machine Translation'],
    publication: 'NeurIPS 2017',
    year: 2017,
    citationCount: 125400,
    dataset: 'WMT 2014',
    method: 'Multi-Head Attention, Scaled Dot-Product Attention',
    model: 'Transformer-Base',
    accuracy: '28.4 BLEU (EN-DE)',
    advantages: [
      'Replaces sequential recurrent loops with parallelizable self-attention layers.',
      'Reduces maximum path length between any two words to O(1), facilitating long-range dependency modeling.',
      'Extremely computationally efficient, setting a new foundation for modern large language models.'
    ],
    limitations: [
      'Quadratic compute and memory complexity O(N^2) with respect to sequence length N.',
      'Lacks any implicit order or spatial awareness, requiring manual positional encodings.'
    ],
    futureWork: [
      'Extend self-attention to other modalities such as audio, images, and video.',
      'Explore memory-efficient, linear-complexity approximations of self-attention.'
    ],
    pdfUrl: '#',
    references: [
      { title: 'Neural Machine Translation by Jointly Learning to Align and Translate', authors: 'Bahdanau et al.', year: 2014 }
    ],
    relatedPapers: ['vit-2021', 'clip-2021', 'llama3-2024'],
    citations: ['vit-2021', 'clip-2021', 'llama3-2024'],
    figures: ['Figure 1: Transformer - Model Architecture Grid', 'Figure 2: Multi-head Attention Layout Details', 'Figure 3: Attention Map Visualizations for Syntactic Dependencies'],
    timeline: [
      { year: 2017, event: 'Presented at NeurIPS 2017, introducing the Transformer' },
      { year: 2018, event: 'Sparks creation of BERT and GPT models' },
      { year: 2023, event: 'Surpasses 100,000 citations, cementing it as one of the most influential CS papers in history' }
    ],
    metrics: { citationVelocity: 22000, influentialCitations: 18500 }
  },
  {
    id: 'gcn-2017',
    title: 'Semi-Supervised Classification with Graph Convolutional Networks',
    authors: ['Thomas N. Kipf', 'Max Welling'],
    abstract: 'We present a scalable approach for semi-supervised learning on graph-structured data that is based on an efficient variant of convolutional neural networks which operate directly on graphs. We motivate the choice of our convolutional architecture via a localized first-order approximation of spectral graph convolutions. Our model scales linearly in the number of graph edges and learns hidden layer representations that encode both local graph structure and features of nodes. On citation networks and a knowledge graph dataset, our approach outperforms related methods by a significant margin while maintaining high computational efficiency.',
    keywords: ['Graph Neural Networks', 'Graph Convolutional Networks', 'Semi-Supervised Learning', 'Spectral Graph Theory'],
    publication: 'ICLR 2017',
    year: 2017,
    citationCount: 28500,
    dataset: 'Cora, Citeseer, Pubmed',
    method: 'First-order Spectral Graph Approximation',
    model: 'GCN (2-layer)',
    accuracy: '81.5% Accuracy on Cora',
    advantages: [
      'Efficiently aggregates neighborhood features using a localized spectral filter.',
      'Scales linearly with the number of edges, making it suitable for large networks.',
      'Learns powerful representations combining node attributes and topological context.'
    ],
    limitations: [
      'Prone to over-smoothing when stacking more than 2-3 layers, losing discriminative power.',
      'Assumes a static graph structure, making it difficult to generalize to dynamic graphs.'
    ],
    futureWork: [
      'Develop GNN models that can scale to dynamic graphs with changing topologies.',
      'Explore attention-based graph layers to adaptively weight neighboring nodes (Graph Attention Networks).'
    ],
    pdfUrl: '#',
    references: [
      { title: 'Convolutional Neural Networks on Graphs with Fast Localized Spectral Filtering', authors: 'Defferrard et al.', year: 2016 }
    ],
    relatedPapers: ['transformer-2017'],
    citations: [],
    figures: ['Figure 1: Graph Convolutional Aggregation Process', 'Figure 2: Node Feature Space t-SNE Clustering'],
    timeline: [
      { year: 2017, event: 'Published at ICLR 2017, establishing Graph Convolutional Networks (GCNs)' },
      { year: 2020, event: 'Integrated into industrial recommendation systems and chemical property prediction platforms' }
    ],
    metrics: { citationVelocity: 4200, influentialCitations: 2100 }
  }
];

// Dynamically generate the remaining 100+ papers
const generateMockPapers = (): Paper[] => {
  const list: Paper[] = [...corePapers];
  const domains = ['NLP', 'Computer Vision', 'Generative AI', 'Graph Machine Learning', 'Reinforcement Learning', 'Medical AI'];
  const methods = ['Contrastive Learning', 'Diffusion Models', 'Supervised Fine-Tuning', 'Direct Preference Optimization', 'Low-Rank Adaptation (LoRA)', 'Retrieval-Augmented Generation (RAG)', 'Mixture of Experts (MoE)', 'Masked Autoencoders'];
  const models = ['GPT-4o', 'Claude 3.5 Sonnet', 'Mistral-Large', 'Stable Diffusion XL', 'Whisper Speech Encoder', 'Gemini 1.5 Pro', 'Llama-3-8B', 'Chinchilla', 'BERT-Large'];
  const datasets = ['ImageNet', 'MS COCO', 'PubMed Central', 'SQuAD v2', 'RedPajama', 'LAION-5B', 'WikiText-103', 'MMLU Benchmark', 'HumanEval'];
  
  const titleTemplates = [
    'Scaling Laws for {method} in {domain}',
    'Emergent Abilities of {model} on {dataset}',
    'Improving {domain} using {method} and {model}',
    'A Comprehensive Study of {method} on {dataset}',
    'Robust Feature Extraction in {domain} using {model}',
    'Efficient {method} for High-Resolution {domain}',
    'The Impact of {dataset} Scale on {model} Generalization',
    'Solving Complex Tasks in {domain} with Graph {method}',
    'Adaptive Learning Rates for Training {model} at Scale',
    'Aligning {model} with {method} on Custom Research Datasets'
  ];

  const abstracts = [
    'In this work, we investigate the empirical scaling behavior of modern deep neural network architectures. We run comprehensive experiments showing that as we scale computation, parameter counts, and training tokens, performance improves in a predictable power-law fashion. We show that scaling visual networks using specific architectures outperforms previous state-of-the-art systems while using a fraction of the computational budget. Our results provide guidance for future large-scale pre-training pipelines.',
    'Training models with self-supervision has emerged as a dominant paradigm in deep learning. However, current setups suffer from training instabilities and high resource requirements. We present an optimized training framework that addresses these challenges through a combination of gradient scaling, model partitioning, and data augmentation. Our experiments show significant convergence speedups and state-of-the-art results across several downstream tasks.',
    'Large pre-trained language models exhibit surprising capabilities on diverse reasoning tasks. However, their internal knowledge can become stale or lead to hallucinations. To mitigate this, we propose an integrated framework combining semantic graph structures with vector databases to enable real-time information retrieval. Our evaluation demonstrates that this approach dramatically improves output factual accuracy and citation consistency.',
    'Analyzing graph-structured data is fundamental to tasks like social network analysis, drug discovery, and citation tracking. We introduce a novel attention-based message passing neural network designed to capture both local configurations and global structures. Our model achieves competitive accuracy while optimizing memory layout, allowing scaling to graphs containing billions of nodes.'
  ];

  const authorPool = mockAuthors.map(a => a.name).concat([
    'Ilya Sutskever', 'Andrej Karpathy', 'Demis Hassabis', 'Shane Legg', 'David Silver', 
    'Christian Szegedy', 'Quoc V. Le', 'Oriol Vinyals', 'Samy Bengio', 'Jeff Dean',
    'Christopher Manning', 'Danqi Chen', 'Richard Socher', 'Percy Liang', 'Jitendra Malik'
  ]);

  const publications = ['NeurIPS', 'ICML', 'CVPR', 'ICLR', 'ACL', 'SIGKDD', 'Nature Machine Intelligence', 'arXiv preprint'];

  // Seeded random number generator for reproducibility
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(random() * arr.length)];
  const getRandomSubset = <T>(arr: T[], size: number): T[] => {
    const shuffled = [...arr].sort(() => random() - 0.5);
    return shuffled.slice(0, size);
  };

  for (let i = 1; i <= 105; i++) {
    const domain = getRandomItem(domains);
    const method = getRandomItem(methods);
    const model = getRandomItem(models);
    const dataset = getRandomItem(datasets);
    const titleTemplate = getRandomItem(titleTemplates);
    const pub = getRandomItem(publications);
    const year = Math.floor(random() * 9) + 2018; // 2018 - 2026

    const title = titleTemplate
      .replace('{domain}', domain)
      .replace('{method}', method)
      .replace('{model}', model)
      .replace('{dataset}', dataset);

    const paperId = `paper-gen-${i}`;
    const authorsCount = Math.floor(random() * 4) + 2; // 2 - 5 authors
    const selectedAuthors = getRandomSubset(authorPool, authorsCount);

    const citationCount = Math.floor(random() * random() * 4500) + 12; // Skewed towards smaller citation numbers
    const accuracyValue = (random() * 15 + 80).toFixed(1) + '%';

    const advantages = [
      `Achieves high efficiency by using ${method} constraints.`,
      `Significantly lowers pre-training sample complexity compared to base ${model} variants.`,
      `Demonstrates strong robustness on domain out-of-distribution tests.`
    ];

    const limitations = [
      `Incurs overhead during graph aggregation phase.`,
      `Performance degrades slightly on highly noisy partitions of ${dataset}.`
    ];

    const futureWork = [
      `Extend ${model} architecture to handle multi-modal inputs directly.`,
      `Investigate quantization schemes to compress weights down to 4-bits.`
    ];

    const references: Reference[] = Array.from({ length: 3 }).map(() => ({
      title: getRandomItem(titleTemplates)
        .replace('{domain}', getRandomItem(domains))
        .replace('{method}', getRandomItem(methods))
        .replace('{model}', getRandomItem(models))
        .replace('{dataset}', getRandomItem(datasets)),
      authors: getRandomSubset(authorPool, 2).join(' and '),
      year: year - (Math.floor(random() * 5) + 1)
    }));

    list.push({
      id: paperId,
      title,
      authors: selectedAuthors,
      abstract: getRandomItem(abstracts) + ' Evaluated rigorously on ' + dataset + ' using ' + model + ' backbones.',
      keywords: [domain, method, model],
      publication: `${pub} ${year}`,
      year,
      citationCount,
      dataset,
      method,
      model,
      accuracy: `${accuracyValue} on ${dataset}`,
      advantages,
      limitations,
      futureWork,
      pdfUrl: '#',
      references,
      relatedPapers: [], // Will populate later
      citations: [],
      figures: [`Figure 1: ${method} pipeline diagram`, `Figure 2: Empirical results on ${dataset}`],
      timeline: [
        { year: year - 1, event: 'Development and training phase' },
        { year, event: `Published at ${pub}` }
      ],
      metrics: {
        citationVelocity: Math.floor(citationCount / (2027 - year)),
        influentialCitations: Math.floor(citationCount * 0.08)
      }
    });
  }

  // Cross-link papers randomly for relatedness and citations
  for (let i = 0; i < list.length; i++) {
    const paper = list[i];
    const relatedCount = 3;
    const offset = i + 1;
    for (let r = 0; r < relatedCount; r++) {
      const idx = (offset + r) % list.length;
      if (list[idx] && list[idx].id !== paper.id) {
        paper.relatedPapers.push(list[idx].id);
        list[idx].citations.push(paper.id);
      }
    }
  }

  return list;
};

export const mockPapers = generateMockPapers();

// Build knowledge graph nodes & edges for visual graph page
export const generateGraphData = () => {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  // Pick first 30 papers to display in the graph to avoid layout clutter
  const samplePapers = mockPapers.slice(0, 32);
  const categories = {
    paper: 'Paper',
    author: 'Author',
    dataset: 'Dataset',
    method: 'Method',
    model: 'Model'
  };

  const addedNodes = new Set<string>();

  const addNode = (id: string, label: string, category: string) => {
    if (addedNodes.has(id)) return;
    addedNodes.add(id);
    
    // Choose coordinate positions on circular concentric rings
    let x = 0;
    let y = 0;
    const count = addedNodes.size;
    const radius = category === 'Paper' ? 250 : category === 'Author' ? 450 : 650;
    const angle = (count * 15 * Math.PI) / 180;
    
    x = Math.cos(angle) * radius + 500;
    y = Math.sin(angle) * radius + 500;

    nodes.push({
      id,
      type: 'customNode',
      data: { label, category, id },
      position: { x, y }
    });
  };

  samplePapers.forEach((paper) => {
    // Add paper node
    addNode(paper.id, paper.title.substring(0, 35) + '...', categories.paper);

    // Add author nodes (max 2 per paper to prevent exploding sizes)
    paper.authors.slice(0, 2).forEach((authorName) => {
      const authorId = `author-${authorName.replace(/\s+/g, '-').toLowerCase()}`;
      addNode(authorId, authorName, categories.author);
      edges.push({
        id: `e-${authorId}-${paper.id}`,
        source: authorId,
        target: paper.id,
        label: 'WRITTEN_BY',
        animated: false
      });
    });

    // Add dataset node
    if (paper.dataset) {
      const datasetId = `dataset-${paper.dataset.split(/[\s,]+/)[0].toLowerCase()}`;
      addNode(datasetId, paper.dataset.split(/[\s,]+/)[0], categories.dataset);
      edges.push({
        id: `e-${paper.id}-${datasetId}`,
        source: paper.id,
        target: datasetId,
        label: 'TESTED_ON',
        animated: true
      });
    }

    // Add method node
    if (paper.method) {
      const methodId = `method-${paper.method.split(/[\s,]+/)[0].toLowerCase()}`;
      addNode(methodId, paper.method.split(/[\s,]+/)[0], categories.method);
      edges.push({
        id: `e-${paper.id}-${methodId}`,
        source: paper.id,
        target: methodId,
        label: 'USES',
        animated: false
      });
    }

    // Add model node
    if (paper.model) {
      const modelId = `model-${paper.model.split(/[\s,]+/)[0].toLowerCase()}`;
      addNode(modelId, paper.model.split(/[\s,]+/)[0], categories.model);
      edges.push({
        id: `e-${paper.id}-${modelId}`,
        source: paper.id,
        target: modelId,
        label: 'IMPROVES',
        animated: true
      });
    }
  });

  // Add citations between sample papers
  samplePapers.forEach((paper) => {
    paper.relatedPapers.forEach((relId) => {
      if (samplePapers.some(p => p.id === relId)) {
        edges.push({
          id: `e-cite-${paper.id}-${relId}`,
          source: paper.id,
          target: relId,
          label: 'CITES',
          animated: false,
          style: { stroke: '#818cf8', strokeWidth: 1.5, strokeDasharray: '4 4' }
        });
      }
    });
  });

  return { nodes, edges };
};

export const graphData = generateGraphData();

// Mock literature reviews pre-computed
export const mockLiteratureReviews: LitReview[] = [
  {
    id: 'lr-1',
    topic: 'Vision Transformers and Self-Supervised Learning in Vision',
    summary: 'This literature review synthesizes the paradigm shift from Convolutional Neural Networks (CNNs) to Vision Transformers (ViTs) under self-supervised objectives. Since the introduction of the ViT architecture in 2021, self-supervised learning algorithms like DINO, iBOT, and CLIP have revolutionized visual representation learning. By combining patch-based sequence inputs with multi-head self-attention, these models achieve competitive accuracies while gaining a global receptive field and remarkable zero-shot robustness across downstream visual benchmarks.',
    papers: mockPapers.slice(0, 3), // ViT, CLIP, DINOv2
    comparisonTable: {
      headers: ['Paper', 'Year', 'Pre-training Dataset', 'Objective', 'Accuracy Metric', 'Core Advantage'],
      rows: [
        ['Vision Transformer (ViT)', '2021', 'JFT-300M (Supervised)', 'Classification cross-entropy', '88.55% Top-1 (ImageNet)', 'Eliminates convolutional bias; scales well.'],
        ['CLIP', '2021', 'WIT-400M (Weakly-supervised)', 'Contrastive language-image matching', '76.2% Zero-Shot (ImageNet)', 'Seamless text-image embedding space.'],
        ['DINOv2', '2023', 'LVD-142M (Self-supervised)', 'Distillation + Masked image modeling', '86.5% Linear probe (ImageNet)', 'Excellent local features for segmentation/depth.']
      ]
    },
    gaps: [
      { gap: 'High-Resolution Dense Predictions', description: 'Self-attention scales quadratically O(N^2) with the number of patches, making ViTs computationally heavy for high-resolution images in segmentation and object detection.', impact: 'High' },
      { gap: 'Small-Dataset Data Efficiency', description: 'Without convolutional inductive biases, visual transformers overfit quickly on small datasets, demanding huge pre-training databases.', impact: 'Medium' }
    ],
    futureWork: [
      'Investigate linear self-attention variations (like Swin Transformers or FlashAttention for vision) to allow pixel-level attention on ultra-high-resolution images.',
      'Develop robust multi-modal models combining vision, audio, text, and sensor data in unified embedding spaces.'
    ],
    references: [
      { title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', authors: 'Dosovitskiy et al.', year: 2021 },
      { title: 'Learning Transferable Visual Models From Natural Language Supervision', authors: 'Radford et al.', year: 2021 },
      { title: 'DINOv2: Learning Robust Visual Features without Supervision', authors: 'Oquab et al.', year: 2023 }
    ]
  }
];

// Pre-computed analytics stats
export const analyticsStats = {
  publicationsPerYear: [
    { year: '2018', papers: 5 },
    { year: '2019', papers: 9 },
    { year: '2020', papers: 14 },
    { year: '2021', papers: 21 },
    { year: '2022', papers: 18 },
    { year: '2023', papers: 25 },
    { year: '2024', papers: 28 },
    { year: '2025', papers: 32 },
    { year: '2026', papers: 36 }
  ],
  topResearchTopics: [
    { topic: 'Generative AI', count: 42, color: '#818cf8' },
    { topic: 'Computer Vision', count: 35, color: '#3b82f6' },
    { topic: 'NLP', count: 28, color: '#a78bfa' },
    { topic: 'Graph ML', count: 18, color: '#ec4899' },
    { topic: 'Reinforcement Learning', count: 12, color: '#f59e0b' }
  ],
  datasetUsage: [
    { name: 'ImageNet', usage: 48 },
    { name: 'MS COCO', usage: 35 },
    { name: 'PubMed', usage: 22 },
    { name: 'SQuAD v2', usage: 18 },
    { name: 'LAION-5B', usage: 15 }
  ],
  modelPopularity: [
    { name: 'Transformers', score: 95 },
    { name: 'Diffusion', score: 78 },
    { name: 'CNNs', score: 45 },
    { name: 'Graph Nets', score: 38 },
    { name: 'MLPs', score: 15 }
  ]
};
