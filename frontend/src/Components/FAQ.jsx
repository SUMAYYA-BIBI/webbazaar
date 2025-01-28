import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './FAQ.css';

const FAQ = () => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Connect to Socket.IO server with proper configuration
    const newSocket = io('http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
      setError('');
      // Join the FAQ room
      newSocket.emit('join_faq_room', 'faq_public');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Connection error: ' + err.message);
      setIsConnected(false);
    });

    newSocket.on('question_answered', (data) => {
      console.log('Received answer:', data);
      setMessages(prev => [...prev, {
        question: data.question,
        answer: data.answer,
        timestamp: new Date(data.timestamp)
      }]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && socket && isConnected) {
      console.log('Sending question:', question);
      socket.emit('faq_question', { question });
      setMessages(prev => [...prev, {
        question,
        status: 'pending',
        timestamp: new Date()
      }]);
      setQuestion('');
    }
  };

  return (
    <div className="faq-container">
      <h2>Frequently Asked Questions</h2>
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <div className="question">
              <strong>Q:</strong> {msg.question}
            </div>
            {msg.answer ? (
              <div className="answer">
                <strong>A:</strong> {msg.answer}
              </div>
            ) : (
              <div className="pending">Waiting for response...</div>
            )}
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="question-input"
          disabled={!isConnected}
        />
        <button type="submit" className="submit-button" disabled={!isConnected || !question.trim()}>
          Ask Question
        </button>
      </form>
    </div>
  );
};

export default FAQ;
