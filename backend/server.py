from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
from datetime import datetime, timedelta
import asyncio
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="SourceSpace API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.sourcespace

# Gemini API configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Pydantic models
class UserProfile(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str  # novaverse, echoverse, logiverse
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JournalEntry(BaseModel):
    entry_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    content: str
    mood: int  # 1-10 scale
    date: datetime = Field(default_factory=datetime.utcnow)

class HabitEntry(BaseModel):
    habit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    habit_name: str
    completed: bool = False
    date: datetime = Field(default_factory=datetime.utcnow)

class AIInsight(BaseModel):
    insight_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    insight_type: str  # story, motivation, analysis
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions
async def generate_sci_fi_content(prompt: str, content_type: str = "story") -> str:
    """Generate sci-fi themed content using Gemini API directly"""
    try:
        if content_type == "story":
            system_context = """You are a sci-fi storyteller for SourceSpace, a galactic productivity app. 
            Create short, inspiring sci-fi stories (100-150 words) that motivate users based on their activities. 
            Use space themes, cosmic metaphors, and futuristic elements. Keep it uplifting and actionable."""
        else:
            system_context = """You are an AI mentor from the future helping users optimize their productivity. 
            Provide brief, insightful analysis (50-75 words) with sci-fi metaphors. 
            Focus on patterns, growth, and cosmic perspective on their journey."""
        
        full_prompt = f"{system_context}\n\nUser context: {prompt}"
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.8,
                "topK": 40,
                "maxOutputTokens": 500
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        content = result["candidates"][0]["content"]["parts"][0]["text"]
                        return content.strip()
                    else:
                        return "The cosmic networks are processing your request. Try again in a moment."
                else:
                    error_text = await response.text()
                    print(f"Gemini API Error: {response.status} - {error_text}")
                    return "The cosmic networks are experiencing interference. Try again later."
                    
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return f"The cosmic networks are experiencing interference. Try again later."

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "online", "service": "SourceSpace API"}

@app.post("/api/users")
async def create_user(profile: UserProfile):
    """Create a new user profile"""
    try:
        profile_dict = profile.dict()
        await db.users.insert_one(profile_dict)
        return {"success": True, "user_id": profile.user_id, "source": profile.source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    """Get user profile"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user['_id'] = str(user['_id'])
    return user

@app.post("/api/journal")
async def create_journal_entry(entry: JournalEntry):
    """Create a new journal entry"""
    try:
        entry_dict = entry.dict()
        await db.journal_entries.insert_one(entry_dict)
        return {"success": True, "entry_id": entry.entry_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/journal/{user_id}")
async def get_journal_entries(user_id: str, limit: int = 10):
    """Get user's journal entries"""
    entries = await db.journal_entries.find(
        {"user_id": user_id}
    ).sort("date", -1).limit(limit).to_list(length=limit)
    
    for entry in entries:
        entry['_id'] = str(entry['_id'])
    return entries

@app.post("/api/habits")
async def create_habit_entry(habit: HabitEntry):
    """Create or update a habit entry"""
    try:
        habit_dict = habit.dict()
        await db.habit_entries.insert_one(habit_dict)
        return {"success": True, "habit_id": habit.habit_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/habits/{user_id}")
async def get_habits(user_id: str):
    """Get user's habit entries"""
    habits = await db.habit_entries.find(
        {"user_id": user_id}
    ).sort("date", -1).to_list(length=50)
    
    for habit in habits:
        habit['_id'] = str(habit['_id'])
    return habits

@app.post("/api/insights/generate")
async def generate_insight(request: Dict[str, Any]):
    """Generate AI insight based on user activity"""
    try:
        user_id = request.get("user_id")
        insight_type = request.get("type", "story")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")
        
        # Get recent user activity
        recent_entries = await db.journal_entries.find(
            {"user_id": user_id}
        ).sort("date", -1).limit(3).to_list(length=3)
        
        recent_habits = await db.habit_entries.find(
            {"user_id": user_id}
        ).sort("date", -1).limit(5).to_list(length=5)
        
        # Create context prompt
        if recent_entries or recent_habits:
            context = "Based on the user's recent activity:\n"
            
            if recent_entries:
                context += "Recent journal entries:\n"
                for entry in recent_entries:
                    context += f"- {entry['title']}: {entry['content'][:100]}... (Mood: {entry['mood']}/10)\n"
            
            if recent_habits:
                completed_habits = [h for h in recent_habits if h['completed']]
                context += f"\nCompleted {len(completed_habits)} out of {len(recent_habits)} recent habits.\n"
            
            if insight_type == "story":
                prompt = f"{context}\nCreate an inspiring sci-fi story that reflects their journey and motivates continued growth."
            else:
                prompt = f"{context}\nProvide insightful analysis with cosmic perspective on their progress and patterns."
        else:
            if insight_type == "story":
                prompt = "Create an inspiring sci-fi story about beginning a new journey in the cosmos of productivity."
            else:
                prompt = "Provide motivation for starting a new productivity journey in the galaxy of self-improvement."
        
        # Generate content
        ai_content = await generate_sci_fi_content(prompt, insight_type)
        
        # Save insight
        insight = AIInsight(
            user_id=user_id,
            content=ai_content,
            insight_type=insight_type
        )
        
        insight_dict = insight.dict()
        await db.ai_insights.insert_one(insight_dict)
        
        return {
            "success": True,
            "insight": {
                "content": ai_content,
                "type": insight_type,
                "generated_at": insight.generated_at.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights/{user_id}")
async def get_insights(user_id: str, limit: int = 5):
    """Get user's AI insights"""
    insights = await db.ai_insights.find(
        {"user_id": user_id}
    ).sort("generated_at", -1).limit(limit).to_list(length=limit)
    
    for insight in insights:
        insight['_id'] = str(insight['_id'])
    return insights

@app.get("/api/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Get dashboard analytics data"""
    try:
        # Get stats for last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Journal stats
        total_entries = await db.journal_entries.count_documents({"user_id": user_id})
        recent_entries = await db.journal_entries.count_documents({
            "user_id": user_id,
            "date": {"$gte": thirty_days_ago}
        })
        
        # Mood average
        mood_pipeline = [
            {"$match": {"user_id": user_id, "date": {"$gte": thirty_days_ago}}},
            {"$group": {"_id": None, "avg_mood": {"$avg": "$mood"}}}
        ]
        mood_result = await db.journal_entries.aggregate(mood_pipeline).to_list(length=1)
        avg_mood = mood_result[0]["avg_mood"] if mood_result else 5.0
        
        # Habit completion rate
        total_habits = await db.habit_entries.count_documents({
            "user_id": user_id,
            "date": {"$gte": thirty_days_ago}
        })
        completed_habits = await db.habit_entries.count_documents({
            "user_id": user_id,
            "date": {"$gte": thirty_days_ago},
            "completed": True
        })
        
        completion_rate = (completed_habits / total_habits * 100) if total_habits > 0 else 0
        
        return {
            "total_entries": total_entries,
            "recent_entries": recent_entries,
            "avg_mood": round(avg_mood, 1),
            "completion_rate": round(completion_rate, 1),
            "total_habits": total_habits,
            "completed_habits": completed_habits,
            "streak_days": recent_entries  # Simplified streak calculation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)