useEffect(() => {
  socket.on('taskUpdated', updatedTask => {
    setTasks(prev =>
      prev.map(t => t._id === updatedTask._id ? updatedTask : t)
    );
  });

  return () => {
    socket.off('taskUpdated');
  };
}, []);

const handleStatusChange = async (taskId, newStatus) => {
  try {
    const res = await axios.patch(`http://localhost:5000/tasks/${taskId}`, { status: newStatus });
    setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    socket.emit('taskUpdated', res.data);
  } catch (err) {
    console.error('Failed to update task status:', err);
  }
};


  

