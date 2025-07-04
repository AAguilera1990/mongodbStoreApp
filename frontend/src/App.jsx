import { useState } from 'react';
import axios from 'axios';
import AuthForm from './AuthForm';

function App() {
  const [aiPrompt, setAiPrompt] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAI = async (e) => {
    e.preventDefault();
    const prompt = aiPrompt;
    setAiPrompt('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', {
        prompt
      });

      const reply = res.data.reply;
      setChatLog(prev => [...prev, { prompt, reply }]);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { prompt, reply: 'Failed to get AI response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Ask the AI something:</h3>

      <form onSubmit={handleAI} className="flex flex-col sm:flex-row items-stretch gap-3">
        <input
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., Summarize today's entry"
          className="flex-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Ask AI
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {chatLog.map((entry, idx) => (
          <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p><span className="font-medium text-blue-600">You:</span> {entry.prompt}</p>
            <p className="mt-1"><span className="font-medium text-indigo-700">AI:</span> {entry.reply}</p>
          </div>
        ))}

        {isLoading && (
          <div className="text-sm text-gray-500 italic">Thinking...</div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => setAiPrompt("Summarize today's entry")}
          className="bg-gray-100 border px-3 py-1 rounded-full hover:bg-gray-200 transition"
        >
          Summarize
        </button>
        <button
          onClick={() => setAiPrompt("Give me insights from recent entries")}
          className="bg-gray-100 border px-3 py-1 rounded-full hover:bg-gray-200 transition"
        >
          Insights
        </button>
        <button
          onClick={() => setAiPrompt("What's a reflection question based on my recent entries?")}
          className="bg-gray-100 border px-3 py-1 rounded-full hover:bg-gray-200 transition"
        >
          Reflection Prompt
        </button>
      </div>
    </div>
  );
}

export default App;
