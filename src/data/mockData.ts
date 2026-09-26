import type { Paper } from '../types';

export const mockPapers: Paper[] = [
  {
    id: "p1",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"],
    year: 2017,
    citations: 89452,
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    venue: "NeurIPS",
    url: "https://arxiv.org/abs/1706.03762"
  },
  {
    id: "p2",
    title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
    authors: ["Alexey Dosovitskiy", "Lucas Beyer", "Alexander Kolesnikov", "Dirk Weissenborn", "Xiaohua Zhai"],
    year: 2020,
    citations: 21304,
    abstract: "While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place. We show that this reliance on CNNs is not necessary and a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks.",
    venue: "ICLR",
    url: "https://arxiv.org/abs/2010.11929"
  },
  {
    id: "p3",
    title: "DINOv2: Learning Robust Visual Features without Supervision",
    authors: ["Maxime Oquab", "Timothée Darcet", "Théo Moutakanni", "Huy Vo", "Marc Szafraniec", "Vasil Khalilov", "Pierre Fernandez", "Alaaeldin El-Nouby", "François Fagan", "Mido Assran"],
    year: 2023,
    citations: 1850,
    abstract: "The recent breakthroughs in natural language processing for model pretraining on large quantities of data have opened the way for similar foundation models in computer vision. We introduce a self-supervised method to learn robust visual features that can be used directly for a wide range of downstream tasks without any fine-tuning.",
    venue: "ArXiv",
    url: "https://arxiv.org/abs/2304.07193"
  },
  {
    id: "p4",
    title: "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
    authors: ["Alec Radford", "Jong Wook Kim", "Chris Hallacy", "Aditya Ramesh", "Gabriel Goh", "Sandhini Agarwal", "Girish Sastry", "Amanda Askell"],
    year: 2021,
    citations: 15420,
    abstract: "State-of-the-art computer vision systems are trained to predict a fixed set of predetermined object categories. This restricted form of supervision limits their generality and usability since additional labeled data is needed to specify any other visual concept. We demonstrate that the simple pre-training task of predicting which caption goes with which image is an efficient and scalable way to learn SOTA image representations from scratch on a dataset of 400 million (image, text) pairs collected from the internet.",
    venue: "ICML",
    url: "https://arxiv.org/abs/2103.00020"
  },
  {
    id: "p5",
    title: "Graph Neural Networks: A Review of Methods and Applications",
    authors: ["Jie Zhou", "Ganqu Cui", "Shengding Hu", "Zhengyan Zhang", "Cheng Yang", "Zhiyuan Liu", "Lifeng Wang", "Changcheng Li", "Maosong Sun"],
    year: 2020,
    citations: 8940,
    abstract: "Lots of learning tasks require dealing with graph data which contains rich relation information among elements. Modeling physics systems, learning molecular fingerprints, predicting protein interface, and classifying diseases require a model to learn from graph inputs. In this paper, we propose a general architecture for graph neural networks and provide a comprehensive review of existing models.",
    venue: "AI Open",
    url: "https://arxiv.org/abs/1812.08434"
  }
];
