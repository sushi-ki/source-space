import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Enhanced theme configurations with background images
const THEMES = {
  novaverse: {
    name: 'NovaVerse',
    description: 'Artistic & Colorful Galaxy',
    colors: {
      primary: 'from-purple-600 via-pink-500 to-orange-400',
      secondary: 'from-blue-500 to-purple-600',
      accent: 'text-pink-300',
      bg: 'bg-gradient-to-br from-purple-900 via-black to-pink-900'
    },
    bgImage: 'https://images.unsplash.com/photo-1538000677000-58185907348e',
    emoji: '🌈',
    particles: 'rainbow'
  },
  echoverse: {
    name: 'EchoVerse', 
    description: 'Community-Focused Cosmos',
    colors: {
      primary: 'from-cyan-400 via-blue-500 to-purple-600',
      secondary: 'from-green-400 to-blue-500',
      accent: 'text-cyan-300',
      bg: 'bg-gradient-to-br from-blue-900 via-black to-cyan-900'
    },
    bgImage: 'https://images.unsplash.com/photo-1533698215883-e2edc689fef5',
    emoji: '🔮',
    particles: 'cyan'
  },
  logiverse: {
    name: 'LogiVerse',
    description: 'Data-Driven Universe', 
    colors: {
      primary: 'from-gray-400 via-blue-400 to-cyan-300',
      secondary: 'from-slate-500 to-blue-400',
      accent: 'text-blue-300',
      bg: 'bg-gradient-to-br from-slate-800 via-black to-blue-900'
    },
    bgImage: 'https://images.pexels.com/photos/1969119/pexels-photo-1969119.jpeg',
    emoji: '⚙️',
    particles: 'blue'
  }
};

// Animated stars component
const AnimatedStars = ({ theme }) => {
  const [stars, setStars] = useState([]);
  
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-twinkle opacity-70"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </div>
  );
};

// Floating particles component
const FloatingParticles = ({ theme }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 30;
    
    // Color schemes based on theme
    const colors = {
      rainbow: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
      cyan: ['#00d4ff', '#0099cc', '#006699', '#003d66'],
      blue: ['#4169e1', '#1e90ff', '#00bfff', '#87ceeb']
    };
    
    const themeColors = colors[THEMES[theme]?.particles] || colors.blue;
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        alpha: Math.random() * 0.5 + 0.3
      });
    }
    
    let animationFrame;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
        
        // Create connections between nearby particles
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = particle.color;
              ctx.globalAlpha = 0.1;
              ctx.stroke();
            }
          }
        });
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

const SourceSpace = () => {
  const [currentPage, setCurrentPage] = useState('portal');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('novaverse');
  const [loading, setLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [habits, setHabits] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detect source from URL and set theme
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || 'novaverse';
    
    console.log('Source detected:', source); // Debug log
    
    if (THEMES[source]) {
      setTheme(source);
    } else {
      console.log('Invalid source, using default novaverse');
      setTheme('novaverse');
    }
    
    // Check for speech synthesis support
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  // API functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const createUser = async (name) => {
    setLoading(true);
    try {
      const userData = {
        source: theme,
        name: name
      };
      
      const result = await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      const newUser = { ...userData, user_id: result.user_id };
      setUser(newUser);
      localStorage.setItem('sourcespace_user', JSON.stringify(newUser));
      
      // Add smooth transition
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 500);
    } catch (error) {
      alert('Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      // Load journal entries
      const entries = await apiCall(`/journal/${userId}`);
      setJournalEntries(entries);
      
      // Load habits
      const userHabits = await apiCall(`/habits/${userId}`);
      setHabits(userHabits);
      
      // Load dashboard data
      const dashboard = await apiCall(`/dashboard/${userId}`);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const createJournalEntry = async (title, content, mood) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const entryData = {
        user_id: user.user_id,
        title,
        content,
        mood: parseInt(mood)
      };
      
      await apiCall('/journal', {
        method: 'POST',
        body: JSON.stringify(entryData)
      });
      
      // Refresh data
      await loadUserData(user.user_id);
      
      // Show success animation
      const successEl = document.createElement('div');
      successEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 animate-bounce';
      successEl.textContent = '✨ Journal entry saved!';
      document.body.appendChild(successEl);
      setTimeout(() => document.body.removeChild(successEl), 3000);
      
    } catch (error) {
      alert('Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitName) => {
    if (!user) return;
    
    try {
      const habitData = {
        user_id: user.user_id,
        habit_name: habitName,
        completed: true
      };
      
      await apiCall('/habits', {
        method: 'POST',
        body: JSON.stringify(habitData)
      });
      
      // Refresh data
      await loadUserData(user.user_id);
      
      // Show celebration animation
      const celebrationEl = document.createElement('div');
      celebrationEl.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl z-50 animate-ping';
      celebrationEl.textContent = '🎉';
      document.body.appendChild(celebrationEl);
      setTimeout(() => document.body.removeChild(celebrationEl), 2000);
      
    } catch (error) {
      alert('Failed to update habit');
    }
  };

  const generateAIInsight = async (type = 'story') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await apiCall('/insights/generate', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.user_id,
          type: type
        })
      });
      
      setAiInsight(result.insight);
      
      // Auto-play if speech is supported and user prefers it
      if (speechSupported && result.insight?.content) {
        setTimeout(() => {
          speakText(result.insight.content);
        }, 1000);
      }
      
    } catch (error) {
      alert('Failed to generate AI insight');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (speechSupported && text) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Load saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sourcespace_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setTheme(userData.source);
      setCurrentPage('dashboard');
      loadUserData(userData.user_id);
    }
  }, []);

  const currentTheme = THEMES[theme];

  // Portal Page (Source Detection & Onboarding)
  const PortalPage = () => {
    const [name, setName] = useState('');

    return (
      <div 
        className={`min-h-screen relative overflow-hidden`}
        style={{
          backgroundImage: `url(${currentTheme.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Animated Background Elements */}
        <AnimatedStars theme={theme} />
        <FloatingParticles theme={theme} />
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70 z-10" />
        
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-4 animate-fade-in">
              <div className="text-6xl animate-pulse-glow">{currentTheme.emoji}</div>
              <h1 className="text-4xl font-bold text-white glow-text">Welcome to</h1>
              <div className={`text-6xl font-extrabold bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent glow-text`}>
                {currentTheme.name}
              </div>
              <p className={`text-xl ${currentTheme.colors.accent} animate-fade-in-delay`}>
                {currentTheme.description}
              </p>
            </div>

            <div className="space-y-6 bg-black/50 backdrop-blur-lg rounded-lg p-6 border border-white/20 cosmic-card">
              <p className="text-white animate-fade-in-delay-2">
                Enter your cosmic identifier to begin your journey through the productivity galaxy:
              </p>
              
              <input
                type="text"
                placeholder="Your space name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:bg-white/20 transition-all duration-300 cosmic-input"
                onKeyPress={(e) => e.key === 'Enter' && name.trim() && createUser(name.trim())}
              />
              
              <button
                onClick={() => name.trim() && createUser(name.trim())}
                disabled={!name.trim() || loading}
                className={`w-full py-3 px-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 cosmic-button relative overflow-hidden`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner" />
                    <span>Initializing...</span>
                  </div>
                ) : (
                  'Enter SourceSpace'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Journal Page
  const JournalPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState(5);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (title.trim() && content.trim()) {
        await createJournalEntry(title.trim(), content.trim(), mood);
        setTitle('');
        setContent('');
        setMood(5);
      }
    };

    const getMoodEmoji = (moodValue) => {
      const emojis = ['😢', '😞', '😐', '😊', '😄', '🤩', '🚀', '⭐', '🌟', '✨'];
      return emojis[Math.floor((moodValue - 1) / 1)] || '😊';
    };

    return (
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${currentTheme.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <AnimatedStars theme={theme} />
        <div className="absolute inset-0 bg-black/80 z-10" />
        
        <div className="relative z-20 min-h-screen p-4 pb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white text-center glow-text animate-fade-in">
              Cosmic Logbook
            </h1>
            
            {/* New Entry Form */}
            <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/20 cosmic-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Entry title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 cosmic-input"
                />
                
                <textarea
                  placeholder="What cosmic insights did you discover today?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 resize-none transition-all duration-300 cosmic-input"
                />
                
                <div className="flex items-center space-x-4">
                  <label className="text-white">Cosmic Mood:</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="flex-1 cosmic-slider"
                  />
                  <span className={`${currentTheme.colors.accent} font-semibold text-lg`}>
                    {getMoodEmoji(mood)} {mood}/10
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || loading}
                  className={`w-full py-3 px-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 cosmic-button`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    '✨ Log Entry'
                  )}
                </button>
              </form>
            </div>

            {/* Recent Entries */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white glow-text">Recent Transmissions</h2>
              {journalEntries.map((entry, index) => (
                <div 
                  key={entry.entry_id} 
                  className="bg-black/30 backdrop-blur-lg rounded-lg p-4 border border-white/10 cosmic-card animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`${currentTheme.colors.accent} text-sm`}>
                        {getMoodEmoji(entry.mood)} {entry.mood}/10
                      </span>
                      <span className="text-white/60 text-sm">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80">{entry.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Page
  const DashboardPage = () => {
    const commonHabits = ['Exercise', 'Meditate', 'Read', 'Code', 'Write', 'Study'];

    return (
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${currentTheme.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <AnimatedStars theme={theme} />
        <div className="absolute inset-0 bg-black/80 z-10" />
        
        <div className="relative z-20 min-h-screen p-4 pb-20">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white glow-text animate-fade-in">Galaxy Dashboard</h1>
              <p className={`${currentTheme.colors.accent} mt-2 animate-fade-in-delay`}>
                Welcome back, {user?.name}! Your cosmic journey continues...
              </p>
            </div>

            {/* Stats Grid */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Logs', value: dashboardData.total_entries, icon: '📝' },
                  { label: 'Avg Mood', value: dashboardData.avg_mood, icon: '😊' },
                  { label: 'Completion Rate', value: `${dashboardData.completion_rate}%`, icon: '🎯' },
                  { label: 'Streak Days', value: dashboardData.streak_days, icon: '🔥' }
                ].map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="bg-black/40 backdrop-blur-lg rounded-lg p-6 text-center border border-white/20 cosmic-card animate-fade-in hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className={`${currentTheme.colors.accent} text-sm`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Habit Tracker */}
            <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/20 cosmic-card">
              <h2 className="text-xl font-semibold text-white mb-4 glow-text">Daily Habits</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonHabits.map((habit, index) => {
                  const completed = habits.some(h => 
                    h.habit_name === habit && 
                    h.completed && 
                    new Date(h.date).toDateString() === new Date().toDateString()
                  );
                  
                  return (
                    <button
                      key={habit}
                      onClick={() => !completed && toggleHabit(habit)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 cosmic-button ${
                        completed 
                          ? `bg-gradient-to-r ${currentTheme.colors.primary} text-white scale-105` 
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-105'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {completed ? '✓ ' : ''}{habit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentPage('journal')}
                className={`p-6 bg-gradient-to-r ${currentTheme.colors.secondary} text-white font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 cosmic-button`}
              >
                📝 New Journal Entry
              </button>
              
              <button
                onClick={() => setCurrentPage('insights')}
                className={`p-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 cosmic-button`}
              >
                🔮 Get AI Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI Insights Page
  const InsightsPage = () => {
    return (
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${currentTheme.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <AnimatedStars theme={theme} />
        <div className="absolute inset-0 bg-black/80 z-10" />
        
        <div className="relative z-20 min-h-screen p-4 pb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white text-center glow-text animate-fade-in">
              Cosmic Intelligence
            </h1>
            
            {/* Generate Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => generateAIInsight('story')}
                disabled={loading}
                className={`p-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 cosmic-button`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  '📖 Generate Story'
                )}
              </button>
              
              <button
                onClick={() => generateAIInsight('analysis')}
                disabled={loading}
                className={`p-6 bg-gradient-to-r ${currentTheme.colors.secondary} text-white font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 cosmic-button`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  '🔍 Get Analysis'
                )}
              </button>
            </div>

            {/* Current Insight */}
            {aiInsight && (
              <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/20 space-y-4 cosmic-card animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white glow-text">
                    {aiInsight.type === 'story' ? '🌌 Cosmic Story' : '🔍 AI Analysis'}
                  </h2>
                  {speechSupported && (
                    <div className="flex space-x-2">
                      {isPlaying ? (
                        <button
                          onClick={stopSpeech}
                          className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cosmic-button`}
                        >
                          ⏹️ Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => speakText(aiInsight.content)}
                          className={`px-4 py-2 bg-gradient-to-r ${currentTheme.colors.accent} bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors cosmic-button`}
                        >
                          🔊 Listen
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-white/90 leading-relaxed text-lg">
                  {aiInsight.content}
                </div>
                
                <div className={`text-sm ${currentTheme.colors.accent} flex items-center space-x-2`}>
                  <span>✨ Generated {new Date(aiInsight.generated_at).toLocaleString()}</span>
                  {isPlaying && <span className="animate-pulse">🎵 Playing...</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Navigation
  const Navigation = () => {
    if (currentPage === 'portal') return null;

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '🌌' },
      { id: 'journal', label: 'Journal', icon: '📝' },
      { id: 'insights', label: 'Insights', icon: '🔮' },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-lg border-t border-white/20 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-300 cosmic-button ${
                  currentPage === item.id 
                    ? `bg-gradient-to-r ${currentTheme.colors.primary} text-white scale-110` 
                    : 'text-white/70 hover:text-white hover:scale-105'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    );
  };

  // Main Render
  const renderPage = () => {
    if (!user && currentPage !== 'portal') {
      return <PortalPage />;
    }

    switch (currentPage) {
      case 'portal':
        return <PortalPage />;
      case 'journal':
        return <JournalPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'insights':
        return <InsightsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="relative overflow-hidden">
      {renderPage()}
      <Navigation />
    </div>
  );
};

export default SourceSpace;