import type { Paper } from '../types';

export const mockPapers: Paper[] = [
  {
    "id": "p1",
    "title": "Attention Is All You Need",
    "authors": [
      "Ashish Vaswani",
      "Noam Shazeer",
      "Niki Parmar",
      "Jakob Uszkoreit",
      "Llion Jones",
      "Aidan N. Gomez",
      "Lukasz Kaiser",
      "Illia Polosukhin"
    ],
    "year": 2017,
    "citations": 114850,
    "venue": "NeurIPS",
    "field": "Architecture & NLP",
    "tldr": "Replaced recurrence and convolutions entirely with multi-head self-attention, establishing the foundation of all modern LLMs.",
    "keyFindings": [
      "Introduces Multi-Head Attention and Scaled Dot-Product Attention.",
      "Achieves 28.4 BLEU on WMT 2014 English-to-German, setting new SOTA.",
      "Massively parallelizable training compared to RNNs and LSTMs."
    ],
    "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    "url": "https://arxiv.org/abs/1706.03762",
    "pdfUrl": "https://arxiv.org/pdf/1706.03762.pdf",
    "bibtex": "@inproceedings{vaswani2017attention,\n  title={Attention is all you need},\n  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, Lukasz and Polosukhin, Illia},\n  booktitle={NeurIPS},\n  year={2017}\n}"
  },
  {
    "id": "p2",
    "title": "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
    "authors": [
      "Alexey Dosovitskiy",
      "Lucas Beyer",
      "Alexander Kolesnikov",
      "Dirk Weissenborn",
      "Xiaohua Zhai"
    ],
    "year": 2020,
    "citations": 32410,
    "venue": "ICLR",
    "field": "Computer Vision",
    "tldr": "Directly applied standard Transformer encoders to flattened 16x16 image patches without convolutional inductive bias.",
    "keyFindings": [
      "Matches or outperforms ResNet baselines on ImageNet with sufficient pretraining (JFT-300M).",
      "Exhibits less inductive bias (locality/translation invariance) than CNNs, benefiting scaling.",
      "Early self-attention layers integrate information across entire image."
    ],
    "abstract": "While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place. We show that this reliance on CNNs is not necessary and a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks.",
    "url": "https://arxiv.org/abs/2010.11929",
    "pdfUrl": "https://arxiv.org/pdf/2010.11929.pdf",
    "bibtex": "@inproceedings{dosovitskiy2020image,\n  title={An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale},\n  author={Dosovitskiy, Alexey and Beyer, Lucas and Kolesnikov, Alexander and Weissenborn, Dirk and Zhai, Xiaohua},\n  booktitle={ICLR},\n  year={2021}\n}"
  },
  {
    "id": "p3",
    "title": "DINOv2: Learning Robust Visual Features without Supervision",
    "authors": [
      "Maxime Oquab",
      "Timothee Darcet",
      "Theo Moutakanni",
      "Huy Vo",
      "Marc Szafraniec",
      "Vasil Khalilov"
    ],
    "year": 2023,
    "citations": 2950,
    "venue": "Transactions on MLR",
    "field": "Computer Vision",
    "tldr": "Produces universal dense visual features via self-distillation on 142M curated images without text supervision.",
    "keyFindings": [
      "Self-supervised ViT-Giant model matches weakly supervised text-image models on dense tasks.",
      "Enables zero-shot monocular depth estimation and semantic segmentation out of the box.",
      "Automatic data curation pipeline eliminates noise from raw web crawls."
    ],
    "abstract": "The recent breakthroughs in natural language processing for model pretraining on large quantities of data have opened the way for similar foundation models in computer vision. We introduce a self-supervised method to learn robust visual features that can be used directly for a wide range of downstream tasks without any fine-tuning.",
    "url": "https://arxiv.org/abs/2304.07193",
    "pdfUrl": "https://arxiv.org/pdf/2304.07193.pdf",
    "bibtex": "@article{oquab2023dinov2,\n  title={DINOv2: Learning Robust Visual Features without Supervision},\n  author={Oquab, Maxime and Darcet, Timothee and Moutakanni, Theo and Vo, Huy and others},\n  journal={TMLR},\n  year={2023}\n}"
  },
  {
    "id": "p4",
    "title": "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
    "authors": [
      "Alec Radford",
      "Jong Wook Kim",
      "Chris Hallacy",
      "Aditya Ramesh",
      "Gabriel Goh",
      "Sandhini Agarwal"
    ],
    "year": 2021,
    "citations": 24800,
    "venue": "ICML",
    "field": "Multimodal",
    "tldr": "Trained dual image-text encoders with contrastive loss on 400M pairs, pioneering zero-shot visual classification.",
    "keyFindings": [
      "Zero-shot CLIP matches fully supervised ResNet-50 accuracy on ImageNet without seeing a single training label.",
      "Extremely robust to natural distribution shifts compared to standard ImageNet models.",
      "Established text-guided embeddings utilized by Stable Diffusion and multimodal RAG."
    ],
    "abstract": "State-of-the-art computer vision systems are trained to predict a fixed set of predetermined object categories. This restricted form of supervision limits their generality and usability since additional labeled data is needed to specify any other visual concept. We demonstrate that the simple pre-training task of predicting which caption goes with which image is an efficient and scalable way to learn SOTA image representations from scratch on a dataset of 400 million pairs.",
    "url": "https://arxiv.org/abs/2103.00020",
    "pdfUrl": "https://arxiv.org/pdf/2103.00020.pdf",
    "bibtex": "@inproceedings{radford2021learning,\n  title={Learning Transferable Visual Models From Natural Language Supervision},\n  author={Radford, Alec and Kim, Jong Wook and Hallacy, Chris and Ramesh, Aditya and others},\n  booktitle={ICML},\n  year={2021}\n}"
  },
  {
    "id": "p5",
    "title": "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
    "authors": [
      "DeepSeek-AI Team",
      "Daya Guo",
      "Dejian Yang",
      "Haowei Zhang",
      "Junxiao Song",
      "Ruoyu Zhang"
    ],
    "year": 2025,
    "citations": 1840,
    "venue": "ArXiv",
    "field": "Reasoning & LLMs",
    "tldr": "Demonstrated that complex mathematical and algorithmic reasoning emerges purely through large-scale RL (GRPO) without cold-start SFT.",
    "keyFindings": [
      "DeepSeek-R1-Zero develops self-verification, reflection, and long chain-of-thought without supervised human traces.",
      "DeepSeek-R1 achieves 79.8% on AIME 2024 and 97.3% on MATH-500, competitive with OpenAI o1.",
      "Successfully distills reasoning capabilities into dense models from 1.5B to 70B parameters."
    ],
    "abstract": "We introduce DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero trains directly via large-scale reinforcement learning without prior supervised fine-tuning, demonstrating emergent reasoning behaviors such as self-verification and extended chain-of-thought. DeepSeek-R1 incorporates multi-stage training and cold-start data to enhance human readability and safety while matching state-of-the-art reasoning benchmarks.",
    "url": "https://arxiv.org/abs/2501.12948",
    "pdfUrl": "https://arxiv.org/pdf/2501.12948.pdf",
    "bibtex": "@article{deepseek2025r1,\n  title={DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning},\n  author={DeepSeek-AI and Guo, Daya and Yang, Dejian and others},\n  journal={arXiv preprint arXiv:2501.12948},\n  year={2025}\n}"
  },
  {
    "id": "p6",
    "title": "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning",
    "authors": [
      "Tri Dao"
    ],
    "year": 2023,
    "citations": 1920,
    "venue": "ICLR",
    "field": "Efficient ML",
    "tldr": "Re-engineered GPU SRAM tiling and work scheduling to yield a 2-3x speedup over standard attention across sequence lengths.",
    "keyFindings": [
      "Reduces non-matmul FLOPs and splits sequence dimension across thread blocks.",
      "Reaches 50-73% of theoretical peak GPU FLOPS on NVIDIA A100/H100.",
      "Critical infrastructure enabling 32k-128k context windows in modern foundation models."
    ],
    "abstract": "Attention is the computational bottleneck in Transformers as sequence length scales. FlashAttention pioneered IO-aware exact attention by tiling memory between GPU HBM and SRAM. FlashAttention-2 redesigns thread block partitioning and work distribution, achieving up to 230 TFLOPs/s on A100 and enabling massive throughput improvements for long-context training.",
    "url": "https://arxiv.org/abs/2307.08691",
    "pdfUrl": "https://arxiv.org/pdf/2307.08691.pdf",
    "bibtex": "@inproceedings{dao2023flashattention2,\n  title={FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning},\n  author={Dao, Tri},\n  booktitle={ICLR},\n  year={2024}\n}"
  },
  {
    "id": "p7",
    "title": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
    "authors": [
      "Albert Gu",
      "Tri Dao"
    ],
    "year": 2023,
    "citations": 2180,
    "venue": "ICML",
    "field": "Architecture & NLP",
    "tldr": "Introduced input-dependent data selection into state space models, achieving 5x higher inference throughput than Transformers.",
    "keyFindings": [
      "Selective SSM filters out irrelevant information dynamically while retaining linear-time complexity O(N).",
      "Hardware-aware parallel scan algorithm keeps computations in fast SRAM.",
      "Matches or exceeds Transformer performance across language, audio, and genomics domains."
    ],
    "abstract": "Foundation models are now predominantly based on the Transformer architecture. However, Transformers fail to scale linearly with sequence length due to quadratic attention complexity. We present Mamba, a selective state space model that incorporates input-dependent time-varying parameters into recurrent continuous-time systems, running with linear time and constant memory during inference.",
    "url": "https://arxiv.org/abs/2312.00752",
    "pdfUrl": "https://arxiv.org/pdf/2312.00752.pdf",
    "bibtex": "@inproceedings{gu2023mamba,\n  title={Mamba: Linear-Time Sequence Modeling with Selective State Spaces},\n  author={Gu, Albert and Dao, Tri},\n  booktitle={ICML},\n  year={2024}\n}"
  },
  {
    "id": "p8",
    "title": "From Local to Global: A Graph RAG Approach to Query-Focused Summarization",
    "authors": [
      "Darren Edge",
      "Ha Trinh",
      "Newman Cheng",
      "Joshua Bradley",
      "Alex Chao",
      "Apurva Mody"
    ],
    "year": 2024,
    "citations": 410,
    "venue": "ArXiv",
    "field": "Graph AI & RAG",
    "tldr": "Employs LLMs to construct hierarchical knowledge graphs from documents, enabling comprehensive global corpus synthesis.",
    "keyFindings": [
      "Resolves vector search failure modes on high-level holistic queries (e.g. \"What are the main themes?\").",
      "Clusters graph into community summaries at multiple abstraction levels.",
      "Demonstrates substantial improvement in comprehensiveness and diversity over naive RAG."
    ],
    "abstract": "Retrieval-Augmented Generation (RAG) using vector similarity struggles with broad holistic queries across large text collections. We present Graph RAG, which combines LLM-derived knowledge graph extraction, community detection, and multi-level summarization to ground responses in both global corpus context and granular relational entities.",
    "url": "https://arxiv.org/abs/2404.16130",
    "pdfUrl": "https://arxiv.org/pdf/2404.16130.pdf",
    "bibtex": "@article{edge2024graphrag,\n  title={From Local to Global: A Graph RAG Approach to Query-Focused Summarization},\n  author={Edge, Darren and Trinh, Ha and Cheng, Newman and others},\n  journal={arXiv:2404.16130},\n  year={2024}\n}"
  },
  {
    "id": "p9",
    "title": "LoRA: Low-Rank Adaptation of Large Language Models",
    "authors": [
      "Edward J. Hu",
      "Yelong Shen",
      "Phillip Wallis",
      "Zeyuan Allen-Zhu",
      "Yuanzhi Li",
      "Shean Wang",
      "Lu Wang",
      "Weizhu Chen"
    ],
    "year": 2021,
    "citations": 18200,
    "venue": "ICLR",
    "field": "Efficient ML",
    "tldr": "Freezes pretrained model weights and injects trainable rank decomposition matrices, slashing trainable parameters by 10,000x.",
    "keyFindings": [
      "Reduces GPU memory footprint by 3x and trainable parameters by 99.9%.",
      "Introduces zero inference latency overhead by fusing weight delta with base parameters.",
      "Matches or exceeds full fine-tuning performance across RoBERTa, DeBERTa, and GPT-3."
    ],
    "abstract": "An important paradigm in NLP consists of large-scale pretraining followed by task-specific fine-tuning. However, full fine-tuning becomes prohibitive as model sizes grow into hundreds of billions of parameters. We propose Low-Rank Adaptation (LoRA), which freezes the pretrained weights and injects trainable rank-decomposition matrices into Transformer layers, drastically reducing storage and compute demands.",
    "url": "https://arxiv.org/abs/2106.09685",
    "pdfUrl": "https://arxiv.org/pdf/2106.09685.pdf",
    "bibtex": "@inproceedings{hu2021lora,\n  title={LoRA: Low-Rank Adaptation of Large Language Models},\n  author={Hu, Edward J and Shen, Yelong and Wallis, Phillip and others},\n  booktitle={ICLR},\n  year={2022}\n}"
  },
  {
    "id": "p10",
    "title": "Graph Neural Networks: A Review of Methods and Applications",
    "authors": [
      "Jie Zhou",
      "Ganqu Cui",
      "Shengding Hu",
      "Zhengyan Zhang",
      "Cheng Yang",
      "Zhiyuan Liu"
    ],
    "year": 2020,
    "citations": 9240,
    "venue": "AI Open",
    "field": "Graph AI & RAG",
    "tldr": "Comprehensive taxonomy and theoretical taxonomy of Graph Neural Networks, message passing, and spatial-temporal graphs.",
    "keyFindings": [
      "Unifies Recurrent GNNs, Spatial Convolutional GNNs, and Graph Autoencoders under Message Passing.",
      "Catalogs benchmark datasets and evaluation protocols for node, edge, and graph-level tasks.",
      "Highlights key open challenges in over-smoothing, expressiveness beyond 1-WL, and scalability."
    ],
    "abstract": "Lots of learning tasks require dealing with graph data which contains rich relation information among elements. Modeling physics systems, learning molecular fingerprints, predicting protein interface, and classifying diseases require a model to learn from graph inputs. In this paper, we propose a general architecture for graph neural networks and provide a comprehensive review of existing models.",
    "url": "https://arxiv.org/abs/1812.08434",
    "pdfUrl": "https://arxiv.org/pdf/1812.08434.pdf",
    "bibtex": "@article{zhou2020graph,\n  title={Graph neural networks: A review of methods and applications},\n  author={Zhou, Jie and Cui, Ganqu and Hu, Shengding and others},\n  journal={AI Open},\n  year={2020}\n}"
  },
  {
    "id": "p11",
    "title": "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    "authors": [
      "Jason Wei",
      "Xuezhi Wang",
      "Dale Schuurmans",
      "Maarten Bosma",
      "Brian Ichter",
      "Fei Xia",
      "Ed Chi",
      "Quoc Le",
      "Denny Zhou"
    ],
    "year": 2022,
    "citations": 7850,
    "venue": "NeurIPS",
    "field": "Reasoning & LLMs",
    "tldr": "Discovered that prompting LLMs to generate intermediate step-by-step reasoning steps dramatically unlocks arithmetic, commonsense, and symbolic reasoning.",
    "keyFindings": [
      "Emergent ability appearing only in models with ~100B+ parameters.",
      "Tripled GSM8K math benchmark accuracy compared to standard direct prompting.",
      "Provides human-interpretable reasoning trace showing how conclusions were deduced."
    ],
    "abstract": "We explore how generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning. In particular, we show how such reasoning abilities emerge naturally in sufficiently large language models via a simple method called chain-of-thought prompting.",
    "url": "https://arxiv.org/abs/2201.11903",
    "pdfUrl": "https://arxiv.org/pdf/2201.11903.pdf",
    "bibtex": "@inproceedings{wei2022chain,\n  title={Chain-of-thought prompting elicits reasoning in large language models},\n  author={Wei, Jason and Wang, Xuezhi and Schuurmans, Dale and others},\n  booktitle={NeurIPS},\n  year={2022}\n}"
  },
  {
    "id": "p12",
    "title": "The Llama 3 Herd of Models",
    "authors": [
      "Llama Team, Meta",
      "Hugo Touvron",
      "Louis Martin",
      "Kevin Stone",
      "Peter Albert"
    ],
    "year": 2024,
    "citations": 3410,
    "venue": "ArXiv",
    "field": "Reasoning & LLMs",
    "tldr": "Open foundation models scaling up to 405B parameters trained on over 15 trillion tokens with multimodal and tool-use capabilities.",
    "keyFindings": [
      "Llama 3 405B is the first openly available model competing directly with leading closed frontier LLMs.",
      "Emphasizes data quality filtering pipelines and extensive synthetic data generation for post-training.",
      "Supports 128K context window with grouped-query attention (GQA)."
    ],
    "abstract": "Modern artificial intelligence relies on foundation models. In this paper, we present the Llama 3 collection of models: language models natively supporting multilinguality, coding, reasoning, and tool usage. Our largest model is a 405B parameter dense Transformer trained on 15T tokens, demonstrating competitive benchmark performance against closed-source frontier models.",
    "url": "https://arxiv.org/abs/2407.21783",
    "pdfUrl": "https://arxiv.org/pdf/2407.21783.pdf",
    "bibtex": "@article{meta2024llama3,\n  title={The Llama 3 Herd of Models},\n  author={Llama Team and Touvron, Hugo and others},\n  journal={arXiv:2407.21783},\n  year={2024}\n}"
  }
];
