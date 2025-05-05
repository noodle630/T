import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core'; // ✅ Tauri v2 path

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await invoke<string>('ask_gpt', { input: { prompt: input } });
      setResponse(result);
    } catch (err) {
      setResponse('Error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🧠 T – GPT Agent</h1>
      <p>Ask me anything:</p>
      <textarea
        rows={3}
        value={input}
        placeholder="e.g. Summarize the article I just copied..."
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%' }}
      />
      <br />
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask T'}
      </button>

      {response && (
        <div style={{ marginTop: 20 }}>
          <h3>T says:</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
