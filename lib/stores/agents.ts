import { create } from 'zustand'
import { type Node, type Edge } from 'reactflow'
import { type AgentNode, type AgentEdge } from '@/lib/types/agent'
import { useChatStore } from './chat'
import { useStore as useDocumentStore } from './documents'

interface AgentsState {
  nodes: Node<AgentNode['data']>[]
  edges: Edge<AgentEdge['data']>[]
  isProcessing: boolean
  currentStep: number
  setNodes: (nodes: Node<AgentNode['data']>[] | ((prev: Node<AgentNode['data']>[]) => Node<AgentNode['data']>[])) => void
  setEdges: (edges: Edge<AgentEdge['data']>[] | ((prev: Edge<AgentEdge['data']>[]) => Edge<AgentEdge['data']>[])) => void
  startProcessing: (projectDescription: string) => void
  stopProcessing: () => void
  resetNodes: () => void
  processNextStep: () => void
}

const initialNodes: Node<AgentNode['data']>[] = [
  {
    id: 'prd-agent',
    type: 'agent',
    position: { x: 250, y: 50 },
    data: {
      name: 'Requirements Agent',
      description: 'Analyzes project requirements and plans documentation',
      type: 'document',
      status: 'idle',
      actionLog: [],
    },
  },
  {
    id: 'technical-agent',
    type: 'agent',
    position: { x: 100, y: 200 },
    data: {
      name: 'Technical Agent',
      description: 'Validates technical specifications and requirements',
      type: 'technical',
      status: 'idle',
      actionLog: [],
    },
  },
  {
    id: 'compliance-agent',
    type: 'agent',
    position: { x: 400, y: 200 },
    data: {
      name: 'Compliance Agent',
      description: 'Ensures compliance with building codes and regulations',
      type: 'compliance',
      status: 'idle',
      actionLog: [],
    },
  },
  {
    id: 'cost-agent',
    type: 'agent',
    position: { x: 250, y: 350 },
    data: {
      name: 'Cost Analysis Agent',
      description: 'Analyzes costs and prepares budgets',
      type: 'cost',
      status: 'idle',
      actionLog: [],
    },
  },
  {
    id: 'document-agent',
    type: 'agent',
    position: { x: 250, y: 500 },
    data: {
      name: 'Document Creation Agent',
      description: 'Generates final project documentation',
      type: 'document',
      status: 'idle',
      actionLog: [],
    },
  },
]

const initialEdges: Edge<AgentEdge['data']>[] = [
  {
    id: 'prd-technical',
    source: 'prd-agent',
    target: 'technical-agent',
    data: { type: 'data', status: 'inactive' },
  },
  {
    id: 'prd-compliance',
    source: 'prd-agent',
    target: 'compliance-agent',
    data: { type: 'data', status: 'inactive' },
  },
  {
    id: 'technical-cost',
    source: 'technical-agent',
    target: 'cost-agent',
    data: { type: 'data', status: 'inactive' },
  },
  {
    id: 'compliance-cost',
    source: 'compliance-agent',
    target: 'cost-agent',
    data: { type: 'data', status: 'inactive' },
  },
  {
    id: 'cost-document',
    source: 'cost-agent',
    target: 'document-agent',
    data: { type: 'data', status: 'inactive' },
  },
]

const workflowSteps = [
  {
    agent: 'prd-agent',
    task: 'Analyzing requirements and planning documentation',
    duration: 15000,
    actions: [
      'Analyzing project scope and requirements',
      'Identifying key stakeholders and constraints',
      'Defining project deliverables',
      'Creating documentation roadmap',
    ],
  },
  {
    agent: 'technical-agent',
    task: 'Validating technical specifications',
    duration: 20000,
    actions: [
      'Reviewing construction methodology',
      'Validating material specifications',
      'Assessing technical feasibility',
      'Checking engineering requirements',
    ],
  },
  {
    agent: 'compliance-agent',
    task: 'Checking regulatory compliance',
    duration: 25000,
    actions: [
      'Reviewing building codes and regulations',
      'Checking permit requirements',
      'Assessing safety compliance',
      'Validating environmental requirements',
    ],
  },
  {
    agent: 'cost-agent',
    task: 'Analyzing costs and preparing budget',
    duration: 20000,
    actions: [
      'Calculating material costs',
      'Estimating labor requirements',
      'Assessing equipment needs',
      'Preparing detailed budget breakdown',
    ],
  },
  {
    agent: 'document-agent',
    task: 'Generating final documentation',
    duration: 30000,
    actions: [
      'Creating project specification document',
      'Preparing technical documentation',
      'Generating compliance reports',
      'Finalizing budget documentation',
    ],
  },
]

export const useAgentsStore = create<AgentsState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  isProcessing: false,
  currentStep: 0,

  setNodes: (nodes) => set((state) => ({
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
  })),

  setEdges: (edges) => set((state) => ({
    edges: typeof edges === 'function' ? edges(state.edges) : edges,
  })),

  startProcessing: (projectDescription: string) => {
    const addMessage = useChatStore.getState().addMessage
    const resetDocuments = useDocumentStore.getState().resetDocuments

    // Reset everything
    set({ isProcessing: true, currentStep: 0 })
    resetDocuments()

    // Initial response from PRD agent
    addMessage({
      role: 'assistant',
      content: 'I will analyze your project requirements and coordinate with our specialized agents to create comprehensive documentation.',
    })

    get().processNextStep()
  },

  stopProcessing: () => {
    set({ isProcessing: false })
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, status: 'idle', currentTask: undefined, progress: undefined },
      })),
      edges: state.edges.map((edge) => ({
        ...edge,
        data: { ...edge.data, status: 'inactive' },
      })),
    }))
  },

  resetNodes: () => {
    set({
      nodes: initialNodes,
      edges: initialEdges,
      isProcessing: false,
      currentStep: 0,
    })
  },

  processNextStep: () => {
    const state = get()
    const { currentStep, isProcessing } = state
    const addMessage = useChatStore.getState().addMessage
    const addDocument = useDocumentStore.getState().addDocument

    if (!isProcessing || currentStep >= workflowSteps.length) {
      set({ isProcessing: false })
      return
    }

    const step = workflowSteps[currentStep]
    const nextStep = workflowSteps[currentStep + 1]

    // Update current node status and add first action
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        data: node.id === step.agent
          ? {
              ...node.data,
              status: 'processing',
              currentTask: step.task,
              progress: 0,
              actionLog: step.actions,
            }
          : node.data,
      })),
    }))

    // Add agent message to chat
    addMessage({
      role: 'assistant',
      content: `${step.task}...`,
    })

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      set((state) => ({
        nodes: state.nodes.map((node) => ({
          ...node,
          data: node.id === step.agent
            ? {
                ...node.data,
                progress: Math.min(((node.data.progress || 0) + 10), 100),
                currentTask: step.actions[Math.floor((node.data.progress || 0) / 25)],
            }
            : node.data,
        })),
      }))
    }, step.duration / 10)

    // Complete current step and move to next
    setTimeout(() => {
      clearInterval(progressInterval)
      
      // Add completion message
      addMessage({
        role: 'assistant',
        content: `Completed: ${step.task}`,
      })

      // If this is the document agent, create documents
      if (step.agent === 'document-agent') {
        const documents = [
          {
            id: crypto.randomUUID(),
            name: 'Project Requirements.md',
            type: 'file',
            status: 'approved',
            lastModified: Date.now(),
            content: '# Project Requirements\n\n...',
          },
          {
            id: crypto.randomUUID(),
            name: 'Technical Specifications.md',
            type: 'file',
            status: 'approved',
            lastModified: Date.now(),
            content: '# Technical Specifications\n\n...',
          },
          {
            id: crypto.randomUUID(),
            name: 'Compliance Report.md',
            type: 'file',
            status: 'approved',
            lastModified: Date.now(),
            content: '# Compliance Report\n\n...',
          },
          {
            id: crypto.randomUUID(),
            name: 'Cost Analysis.md',
            type: 'file',
            status: 'approved',
            lastModified: Date.now(),
            content: '# Cost Analysis\n\n...',
          },
        ]

        documents.forEach(doc => addDocument(doc))
      }
      
      set((state) => ({
        nodes: state.nodes.map((node) => ({
          ...node,
          data: node.id === step.agent
            ? {
                ...node.data,
                status: 'complete',
                currentTask: undefined,
                progress: undefined,
            }
            : node.data,
        })),
        edges: state.edges.map((edge) => ({
          ...edge,
          data: {
            ...edge.data,
            status: edge.source === step.agent && nextStep && edge.target === nextStep.agent
              ? 'active'
              : edge.data?.status,
          },
        })),
        currentStep: currentStep + 1,
      }))

      get().processNextStep()
    }, step.duration)
  },
}))