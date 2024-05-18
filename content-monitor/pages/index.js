import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [log, setLog] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [postDetails, setPostDetails] = useState(null);
  const [error, setError] = useState('');

  const validateUrl = (url) => url.includes('.com');

  const checkPostStatus = async (url) => {
    if (!validateUrl(url)) {
      setIsValidUrl(false);
      setPostDetails(null);
      return false;
    }

    setIsValidUrl(true);

    try {
      const response = await fetch('/api/fetch-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.status === 'error') {
        setPostDetails(null);
        setError(data.message);
        return false;
      } else {
        setPostDetails(data);
        setError('');
        return !data.is_deleted;
      }
    } catch (error) {
      console.error('Error checking post status:', error);
      setPostDetails(null);
      setError('Failed to check post status');
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

  useEffect(() => {
    const eventSource = new EventSource('/api/log-stream');
    eventSource.onmessage = function(event) {
      setLog((prevLog) => prevLog + event.data + '\n');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="container">
      <h1>Content Monitor</h1>
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
      {postDetails && (
        <div>
          <h2>Post Details</h2>
          <p>Title: {postDetails.title}</p>
          <p>Author: {postDetails.author}</p>
          <p>Created: {new Date(postDetails.created_utc * 1000).toLocaleString()}</p>
          <p>Upvotes: {postDetails.upvotes}</p>
          <p>Comments: {postDetails.comments}</p>
          <p>Views: {postDetails.views}</p>
          <p>Status: {postDetails.is_deleted ? 'Deleted' : 'Available'}</p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!isValidUrl && <div style={{ color: 'red' }}>Invalid URL. Please enter a valid post URL.</div>}
    </div>
  );
}
