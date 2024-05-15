import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [log, setLog] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('/api/start-monitoring', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (response.ok) {
            setLog('Monitoring started...\n');
            const eventSource = new EventSource('/api/log-stream');
            eventSource.onmessage = function(event) {
                setLog((prevLog) => prevLog + event.data + '\n');
            };
        } else {
            alert('Failed to start monitoring');
        }
    };

    return (
        <div className="container">
            <h1>Content Monitor</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="url">Enter URL:</label>
                <input
                    type="text"
                    id="url"
                    name="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <button type="submit">Start Monitoring</button>
            </form>
            <div id="log">
                <pre>{log}</pre>
            </div>
        </div>
    );
}
