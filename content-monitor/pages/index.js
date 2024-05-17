import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [log, setLog] = useState('');
    const [isValidUrl, setIsValidUrl] = useState(true);
    const [postStatus, setPostStatus] = useState('');

    const validateUrl = (url) => {
        return url.includes('.com');
    };

    const checkPostStatus = async (url) => {
        if (!validateUrl(url)) {
            setIsValidUrl(false);
            setPostStatus('');
            return false;
        }

        setIsValidUrl(true);
        const isReddit = url.includes('reddit.com');
        const fetchUrl = isReddit ? `${url}.json` : url;

        try {
            const response = await fetch(fetchUrl);
            if (response.status === 404) {
                setPostStatus('Post has been taken down.');
                return false;
            } else if (response.status === 200) {
                if (isReddit) {
                    const data = await response.json();
                    if (data.length === 0) {
                        setPostStatus('Post has been taken down.');
                        return false;
                    } else {
                        setPostStatus('Post is available.');
                        return true;
                    }
                } else {
                    setPostStatus('Post is available.');
                    return true;
                }
            } else {
                setPostStatus('Error fetching post.');
                return false;
            }
        } catch (error) {
            setPostStatus('Error fetching post.');
            console.error('Error fetching post:', error);
            return false;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const isPostAvailable = await checkPostStatus(url);
        if (!isPostAvailable) {
            alert('The post is either invalid or has been taken down.');
            return;
        }

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
            {/* Add the image here */}
            <img src="/logo.png" alt="Logo" width="200" />
            <form onSubmit={handleSubmit}>
                <label htmlFor="url">Enter URL:</label>
                <input
                    type="text"
                    id="url"
                    name="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    style={{ borderColor: isValidUrl ? 'black' : 'red' }}
                />
                <button type="submit">Start Monitoring</button>
            </form>
            <div id="log">
                <pre>{log}</pre>
            </div>
            {postStatus && <div>{postStatus}</div>}
            {!isValidUrl && <div style={{ color: 'red' }}>Invalid URL. Please enter a valid post URL.</div>}
        </div>
    );
}
