
useEffect(() => {
  socket.on('newComment', comment => {
    if (comment.task === taskId) {
       setComments(prev => [...prev, comment]);
    }
  });

  return () => {
    socket.off('newComment');
  };
}, [taskId]);

const postComment = async () => {
  try {
    await axios.post('http://localhost:5000/comments', {
      taskId,
      userId,
      content: text
    });
    setText('');
  } catch (err) {
    console.error('Failed to post comment:', err);
  }
};

