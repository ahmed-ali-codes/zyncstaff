'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  status: string
  due_date: string | null
  employees: { first_name: string; last_name: string } | null
}

const COLUMNS = ['pending', 'in_progress', 'done', 'cancelled']

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const supabase = createClient()
  const router = useRouter()
  
  // Local state for optimistic UI updates during drag
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Sync state if initialTasks changes from server
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    // Dropped outside a column
    if (!destination) return

    // Dropped in the same column at the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStatus = destination.droppableId

    // Optimistically update UI
    const updatedTasks = tasks.map(task => 
      task.id === draggableId ? { ...task, status: newStatus } : task
    )
    setTasks(updatedTasks)

    // Persist to Supabase
    const { error } = await supabase
      .from('visa_tasks')
      .update({ status: newStatus })
      .eq('id', draggableId)

    if (error) {
      alert(`Error updating task status: ${error.message}`)
      // Revert UI on error
      setTasks(initialTasks)
    } else {
      router.refresh() // Refresh server data in background
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-4">
        <div className="grid grid-cols-4 gap-4 sm:gap-6 min-w-[900px] md:min-w-0">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter(t => t.status === status)

          return (
            <div key={status} className="flex flex-col h-full min-h-[400px] lg:min-h-[500px]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 pl-2 flex items-center justify-between">
                {status.replace('_', ' ')}
                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px]">{columnTasks.length}</span>
              </h3>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-4 rounded-2xl p-2 transition-colors max-h-[500px] overflow-y-auto ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`double-bezel-outer cursor-grab active:cursor-grabbing transition-all duration-300 ${
                              snapshot.isDragging ? 'shadow-xl scale-105 rotate-2' : 'hover:-translate-y-1'
                            }`}
                            style={provided.draggableProps.style}
                          >
                            <div className="double-bezel-inner p-5 bg-card">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
                                <button className="text-muted-foreground hover:text-foreground">
                                  <MoreVertical size={14} strokeWidth={1.5} />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-4">
                                {task.employees?.first_name} {task.employees?.last_name}
                              </p>
                              
                              {task.due_date && (
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${
                                    new Date(task.due_date) < new Date() ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-muted-foreground'
                                  }`}>
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="border border-dashed border-border/50 rounded-2xl h-24 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-semibold">No tasks</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
      </div>
    </DragDropContext>
  )
}
