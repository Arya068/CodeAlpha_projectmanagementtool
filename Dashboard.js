
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { socket } from '../socket';
import TaskCard from '../components/TaskCard';

export default function Dashboard({ project }) {
  const [columns, setColumns] = useState({
    todo: { name: 'To Do', tasks: [] },
    'in-progress': { name: 'In Progress', tasks: [] },
    done: { name: 'Done', tasks: [] }
  });

  // Fetch and organize tasks
  useEffect(() => {
    axios.get(`http://localhost:5000/tasks/${project._id}`).then(res => {
      const grouped = { todo: [], 'in-progress': [], done: [] };
      res.data.forEach(task => grouped[task.status].push(task));
      setColumns({
        todo: { name: 'To Do', tasks: grouped.todo },
        'in-progress': { name: 'In Progress', tasks: grouped['in-progress'] },
        done: { name: 'Done', tasks: grouped.done }
      });
    });

    socket.on('taskUpdated', updatedTask => {
      setColumns(prev => {
        const newCols = { ...prev };
        Object.keys(newCols).forEach(col => {
          newCols[col].tasks = newCols[col].tasks.filter(t => t._id !== updatedTask._id);
        });
        newCols[updatedTask.status].tasks.push(updatedTask);
        return newCols;
      });
    });

    return () => {
      socket.off('taskUpdated');
    };
  }, [project._id]);

  // Handle drag logic
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    movedTask.status = destination.droppableId;
    destCol.tasks.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    try {
      const res = await axios.patch(`http://localhost:5000/tasks/${movedTask._id}`, {
        status: movedTask.status
      });
      socket.emit('taskUpdated', res.data);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  flex: 1,
                  background: '#f4f4f4',
                  padding: '10px',
                  borderRadius: '8px',
                  minHeight: '300px'
                }}
              >
                <h3>{column.name}</h3>
                {column.tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          marginBottom: '8px',
                          ...provided.draggableProps.style
                        }}
                      >
                        <TaskCard
                          task={task}
                          onEdit={() => {
                            console.log('Edit task:', task);
                            // Optionally open modal or set context
                          }}
                          onToggleDone={() => {
                            const newStatus = task.status === 'done' ? 'todo' : 'done';
                            axios.patch(`http://localhost:5000/tasks/${task._id}`, { status: newStatus })
                              .then(res => socket.emit('taskUpdated', res.data))
                              .catch(err => console.error('Failed to toggle status:', err));
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
}
