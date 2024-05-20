import { useState, useEffect, useRef } from 'react';


export default function Home() {
  const [urls, setUrls] = useState(['']);
  const [logs, setLogs] = useState({});
  const [isValidUrls, setIsValidUrls] = useState([true]);
  const [postDetails, setPostDetails] = useState({});
  const [error, setError] = useState({});
  const intervalRefs = useRef({});

  const validateUrl = (url) => url.includes('.com');

  const checkPostStatus = async (url, index) => {
    if (!validateUrl(url)) {
      setIsValidUrls((prev) => {
        const newIsValidUrls = [...prev];
        newIsValidUrls[index] = false;
        return newIsValidUrls;
      });
      setPostDetails((prev) => {
        const newPostDetails = { ...prev };
        delete newPostDetails[url];
        return newPostDetails;
      });
      return false;
    }

    setIsValidUrls((prev) => {
      const newIsValidUrls = [...prev];
      newIsValidUrls[index] = true;
      return newIsValidUrls;
    });

    try {
      const response = await fetch('/api/fetch-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.status === 'error') {
        setPostDetails((prev) => {
          const newPostDetails = { ...prev };
          delete newPostDetails[url];
          return newPostDetails;
        });
        setError((prev) => ({ ...prev, [url]: data.message }));
        return false;
      } else {
        setPostDetails((prev) => ({ ...prev, [url]: data }));
        setError((prev) => ({ ...prev, [url]: '' }));
        return !data.is_deleted;
      }
    } catch (error) {
      console.error('Error checking post status:', error);
      setPostDetails((prev) => {
        const newPostDetails = { ...prev };
        delete newPostDetails[url];
        return newPostDetails;
      });
      setError((prev) => ({ ...prev, [url]: 'Failed to check post status' }));
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    urls.forEach((url, index) => {
      const isPostAvailable = checkPostStatus(url, index);
      if (!isPostAvailable) {
        alert(`The post at ${url} is either invalid or has been taken down.`);
        return;
      }

      setLogs((prev) => ({ ...prev, [url]: 'Monitoring started...\n' }));

      // Clear any existing interval for the URL
      if (intervalRefs.current[url]) {
        clearInterval(intervalRefs.current[url]);
      }

      // Set up a new interval to check the post status periodically
      intervalRefs.current[url] = setInterval(async () => {
        const isPostAvailable = await checkPostStatus(url, index);
        if (!isPostAvailable) {
          setLogs((prev) => ({
            ...prev,
            [url]: (prev[url] || '') + 'The post has been deleted or removed by a moderator.\n',
          }));
          clearInterval(intervalRefs.current[url]);
        }
      }, 10000); // Check every 10 seconds
    });
  };

  const handleUrlChange = (index, value) => {
    setUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  const addUrlField = () => {
    setUrls((prev) => [...prev, '']);
    setIsValidUrls((prev) => [...prev, true]);
  };

  useEffect(() => {
    return () => {
      Object.keys(intervalRefs.current).forEach((url) => {
        clearInterval(intervalRefs.current[url]);
      });
    };
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>Michigan Content Monitor</h1>
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <img src="/logo.png" alt="Logo" width={200} height={200} className="logo" />
        <form onSubmit={handleSubmit}>
          {urls.map((url, index) => (
            <div key={index}>
              <label htmlFor={`url-${index}`}>Enter URL:</label>
              <input
                type="text"
                id={`url-${index}`}
                name={`url-${index}`}
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                required
                className={isValidUrls[index] ? '' : 'invalid'}
              />
            </div>
          ))}
          <button type="button" onClick={addUrlField}>Add URL</button>
          <button type="submit">Start Monitoring</button>
        </form>
        {urls.map((url, index) => (
          <div key={index}>
            <div id="log">
              <pre>{logs[url]}</pre>
            </div>
            {postDetails[url] && (
              <div className="post-details">
                <h2>Post Details for {url}</h2>
                <p><strong>Title:</strong> {postDetails[url].title}</p>
                <p><strong>Author:</strong> {postDetails[url].author}</p>
                <p><strong>Created:</strong> {new Date(postDetails[url].created_utc * 1000).toLocaleString()}</p>
                <p><strong>Subreddit:</strong> {postDetails[url].subreddit}</p>
                <p><strong>Status:</strong> {postDetails[url].is_deleted ? 'Deleted or Removed by a Moderator' : 'Available'}</p>
              </div>
            )}
            {error[url] && <div className="error">{error[url]}</div>}
            {!isValidUrls[index] && <div className="error">Invalid URL. Please enter a valid post URL.</div>}
          </div>
        ))}
      </main>
      <footer className="footer">
        <p>&copy; 2024 Michigan Content Monitor. All rights reserved.</p>
      </footer>
    </div>
  );
}
