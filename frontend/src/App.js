import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Theme configurations based on source
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
    emoji: '🌈'
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
    emoji: '🔮'
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
    emoji: '⚙️'
  }
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

  // Detect source from URL and set theme
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || 'novaverse';
    
    if (THEMES[source]) {
      setTheme(source);
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
      setCurrentPage('dashboard');
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
    } catch (error) {
      alert('Failed to generate AI insight');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (speechSupported && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
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
      <div className={`min-h-screen ${currentTheme.colors.bg} flex items-center justify-center p-4`}>
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl animate-pulse">{currentTheme.emoji}</div>
            <h1 className="text-4xl font-bold text-white">Welcome to</h1>
            <div className={`text-6xl font-extrabold bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
              {currentTheme.name}
            </div>
            <p className={`text-xl ${currentTheme.colors.accent}`}>
              {currentTheme.description}
            </p>
          </div>

          <div className="space-y-6 bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <p className="text-white">
              Enter your cosmic identifier to begin your journey through the productivity galaxy:
            </p>
            
            <input
              type="text"
              placeholder="Your space name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50"
            />
            
            <button
              onClick={() => name.trim() && createUser(name.trim())}
              disabled={!name.trim() || loading}
              className={`w-full py-3 px-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Initializing...' : 'Enter SourceSpace'}
            </button>
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

    return (
      <div className={`min-h-screen ${currentTheme.colors.bg} p-4`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white text-center">Cosmic Logbook</h1>
          
          {/* New Entry Form */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Entry title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50"
              />
              
              <textarea
                placeholder="What cosmic insights did you discover today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50 resize-none"
              />
              
              <div className="flex items-center space-x-4">
                <label className="text-white">Cosmic Mood:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="flex-1"
                />
                <span className={`${currentTheme.colors.accent} font-semibold`}>{mood}/10</span>
              </div>
              
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || loading}
                className={`w-full py-3 px-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
              >
                {loading ? 'Saving...' : 'Log Entry'}
              </button>
            </form>
          </div>

          {/* Recent Entries */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Recent Transmissions</h2>
            {journalEntries.map((entry) => (
              <div key={entry.entry_id} className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`${currentTheme.colors.accent} text-sm`}>
                      Mood: {entry.mood}/10
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
    );
  };

  // Dashboard Page
  const DashboardPage = () => {
    const commonHabits = ['Exercise', 'Meditate', 'Read', 'Code', 'Write', 'Study'];

    return (
      <div className={`min-h-screen ${currentTheme.colors.bg} p-4`}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Galaxy Dashboard</h1>
            <p className={`${currentTheme.colors.accent} mt-2`}>
              Welcome back, {user?.name}! Your cosmic journey continues...
            </p>
          </div>

          {/* Stats Grid */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-white">{dashboardData.total_entries}</div>
                <div className={`${currentTheme.colors.accent} text-sm`}>Total Logs</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-white">{dashboardData.avg_mood}</div>
                <div className={`${currentTheme.colors.accent} text-sm`}>Avg Mood</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-white">{dashboardData.completion_rate}%</div>
                <div className={`${currentTheme.colors.accent} text-sm`}>Completion Rate</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-white">{dashboardData.streak_days}</div>
                <div className={`${currentTheme.colors.accent} text-sm`}>Streak Days</div>
              </div>
            </div>
          )}

          {/* Habit Tracker */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Daily Habits</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonHabits.map((habit) => {
                const completed = habits.some(h => 
                  h.habit_name === habit && 
                  h.completed && 
                  new Date(h.date).toDateString() === new Date().toDateString()
                );
                
                return (
                  <button
                    key={habit}
                    onClick={() => !completed && toggleHabit(habit)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      completed 
                        ? `bg-gradient-to-r ${currentTheme.colors.primary} text-white` 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
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
              className={`p-6 bg-gradient-to-r ${currentTheme.colors.secondary} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
            >
              📝 New Journal Entry
            </button>
            
            <button
              onClick={() => setCurrentPage('insights')}
              className={`p-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
            >
              🔮 Get AI Insights
            </button>
          </div>
        </div>
      </div>
    );
  };

  // AI Insights Page
  const InsightsPage = () => {
    return (
      <div className={`min-h-screen ${currentTheme.colors.bg} p-4`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white text-center">Cosmic Intelligence</h1>
          
          {/* Generate Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => generateAIInsight('story')}
              disabled={loading}
              className={`p-6 bg-gradient-to-r ${currentTheme.colors.primary} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Generating...' : '📖 Generate Story'}
            </button>
            
            <button
              onClick={() => generateAIInsight('analysis')}
              disabled={loading}
              className={`p-6 bg-gradient-to-r ${currentTheme.colors.secondary} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Analyzing...' : '🔍 Get Analysis'}
            </button>
          </div>

          {/* Current Insight */}
          {aiInsight && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  {aiInsight.type === 'story' ? 'Cosmic Story' : 'AI Analysis'}
                </h2>
                {speechSupported && (
                  <button
                    onClick={() => speakText(aiInsight.content)}
                    className={`px-4 py-2 bg-gradient-to-r ${currentTheme.colors.accent} bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors`}
                  >
                    🔊 Listen
                  </button>
                )}
              </div>
              
              <div className="text-white/90 leading-relaxed">
                {aiInsight.content}
              </div>
              
              <div className={`text-sm ${currentTheme.colors.accent}`}>
                Generated {new Date(aiInsight.generated_at).toLocaleString()}
              </div>
            </div>
          )}
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
      <nav className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id 
                    ? `bg-gradient-to-r ${currentTheme.colors.primary} text-white` 
                    : 'text-white/70 hover:text-white'
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
    <div className="relative">
      {renderPage()}
      <Navigation />
    </div>
  );
};

export default SourceSpace;