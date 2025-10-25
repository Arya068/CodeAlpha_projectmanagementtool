export default function TaskCard({ task, onEdit, onToggleDone }) {
  return (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '4px' }}>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onToggleDone}>
          {task.status === 'done' ? 'Undo' : 'Mark Done'}
        </button>
      </div>
    </div>
  );
}
