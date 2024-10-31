'use client'

import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { FileText, HardHat, Scale, Calculator } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const agentIcons = {
  document: FileText,
  technical: HardHat,
  compliance: Scale,
  cost: Calculator,
}

interface AgentNodeProps {
  data: {
    name: string
    description: string
    type: keyof typeof agentIcons
    status: 'idle' | 'processing' | 'complete' | 'error'
    currentTask?: string
    progress?: number
    error?: string
    actionLog?: string[]
  }
}

function AgentNodeComponent({ data }: AgentNodeProps) {
  const [showDetails, setShowDetails] = useState(false)
  const Icon = agentIcons[data.type]
  const isProcessing = data.status === 'processing'
  const isError = data.status === 'error'
  const isComplete = data.status === 'complete'

  return (
    <>
      <div 
        className={cn(
          'rounded-lg border bg-card p-4 shadow-sm cursor-pointer',
          'w-[280px] select-none',
          isError && 'border-destructive',
          isComplete && 'border-green-500'
        )}
        onClick={() => setShowDetails(true)}
      >
        <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
        
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-full p-2',
            'bg-muted text-muted-foreground',
            isProcessing && 'animate-pulse bg-blue-100 text-blue-500 dark:bg-blue-900',
            isError && 'bg-red-100 text-red-500 dark:bg-red-900',
            isComplete && 'bg-green-100 text-green-500 dark:bg-green-900'
          )}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              {data.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {data.description}
            </p>
          </div>
        </div>

        {isProcessing && data.currentTask && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">{data.currentTask}</p>
            <Progress value={data.progress} className="h-1" />
          </div>
        )}

        {isError && data.error && (
          <p className="mt-2 text-xs text-destructive">{data.error}</p>
        )}

        <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {data.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <div className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isProcessing && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100',
                isError && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100',
                isComplete && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100',
                !isProcessing && !isError && !isComplete && 'bg-muted text-muted-foreground'
              )}>
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </div>
            </div>

            {data.actionLog && data.actionLog.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Action Log</h4>
                <div className="space-y-2">
                  {data.actionLog.map((action, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isProcessing && data.currentTask && (
              <div>
                <h4 className="font-semibold mb-2">Current Task</h4>
                <p className="text-sm">{data.currentTask}</p>
                <Progress value={data.progress} className="h-1 mt-2" />
              </div>
            )}

            {isError && data.error && (
              <div>
                <h4 className="font-semibold mb-2 text-destructive">Error</h4>
                <p className="text-sm text-destructive">{data.error}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const AgentNode = memo(AgentNodeComponent)