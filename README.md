# 🌌 SourceSpace

**SourceSpace** is a sci-fi-themed, source-aware productivity and journaling app that adapts its onboarding and dashboard based on how a user discovered it — via Instagram, a referral link, or a blog post. Built using **Emergent** with the power of **Gemini AI**, the app transforms habit tracking and self-reflection into a cosmic storytelling experience.

---

## 🚀 Features

✨ **Source-Aware Onboarding**  
Detects user origin through `?source=` parameters and launches them into one of three distinct "universes":
- 🌈 *NovaVerse* – for users from Instagram (creative, aesthetic interface)
- 🔮 *EchoVerse* – for users from referrals (community-driven)
- ⚙️ *LogiVerse* – for users from professional blogs (minimalist, data-centric)

🪐 **Journal & Mood Logging**  
Log your daily reflections and mood in a futuristic logbook with space-themed prompts.

🌟 **Galaxy Dashboard**  
Track habits, goals, and task completion through constellations and streak stars.

🧠 **Gemini AI Integration**  
Analyze user data (moods, habits, logs) and generate:
- Motivational sci-fi stories
- Narrative summaries
- Voice-narrated insights (optional)

🎙️ **Voice Narration (Optional Bonus)**  
Let Gemini narrate your daily space journey, giving your productivity a guided-mission feel.

---

## 🧑‍🚀 Technologies Used

| Tool | Purpose |
|------|---------|
| 🧩 **Emergent** | No-code/low-code app builder |
| 🌐 **Gemini API** | AI storytelling and insights |
| 🔥 **Firebase** | Authentication & database (optional) |
| 🎨 **FlutterFlow (Prototype base)** | UI idea prototyping |
| 📦 **DeepLinking / UTM** | Source-based flow control |

---

## 🛠️ Setup & Installation

1. Clone the repo or fork it.
2. Get a **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. In your Emergent app or code:
   - Add your Gemini API key
   - Parse the `source` from the URL to direct to the right theme
4. Customize story prompts and themes based on your needs!

---

## 🧪 Sample Gemini Prompt

```text
The user completed 3 tasks and reported feeling “focused”.  
Write a short sci-fi-themed motivational message as if they are flying closer to the “Focus Star” in their galaxy. Mention their streak and encourage them to continue the mission.


👩‍🚀 Made with love by Kirti

“The stars aren’t just out there — they’re in you. SourceSpace helps you see them.” 💫
