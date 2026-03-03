<div align="center">

# 🚂 Rail Madad - AI-Powered Railway Complaint Management System

[![Made with React](https://img.shields.io/badge/Made%20with-React%2018-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Built with Django](https://img.shields.io/badge/Built%20with-Django%205-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Firebase](https://img.shields.io/badge/Firebase%20Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AI Powered](https://img.shields.io/badge/AI%20Powered-Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

### 🎯 A modern, intelligent solution for Indian Railways passenger grievance redressal with AI-powered assistance, real-time support, and facial authentication

[Live Demo](https://rail-madad.manojkrishna.tech) • [API Documentation](#-api-documentation) • [Features](#-key-features) • [Installation](#-installation)

</div>

---

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
- [🖼️ Screenshots](#️-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [🤖 AI Models & Capabilities](#-ai-models--capabilities)
- [📁 Project Structure](#-project-structure)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📊 API Documentation](#-api-documentation)
- [🔐 Security Features](#-security-features)
- [👥 User Roles](#-user-roles)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

### 🎯 Core Functionality

<table>
<tr>
<td width="50%">

#### 📝 Smart Complaint Filing
- **Multi-Modal Submission**: Text, Image, Video, Audio support
- **AI-Powered Classification**: Automatic categorization using BERT models
- **Smart Priority Assignment**: AI determines priority (Low/Medium/High/Critical)
- **Auto Staff Assignment**: Intelligent routing to appropriate departments
- **PNR & Train Validation**: Real-time validation of train numbers and PNR
- **Rich Media Upload**: Support for photos, videos, and audio recordings

</td>
<td width="50%">

#### 🤖 AI Assistant (Gemini Integration)
- **24/7 Intelligent Chatbot**: Powered by Google Gemini AI
- **Multi-lingual Support**: Supports 10+ Indian languages
- **Context-Aware Responses**: Understands complaint history
- **Quick Resolution Suggestions**: Instant answers to common queries
- **Voice Interaction**: Speech-to-text and text-to-speech capabilities
- **Multimedia Analysis**: Can analyze images and videos in complaints

</td>
</tr>

<tr>
<td width="50%">

#### 🔐 Facial Authentication
- **DeepFace Integration**: Advanced face recognition using Facenet model
- **Secure Enrollment**: One-time face profile setup
- **Quick Login**: Login with facial recognition in under 2 seconds
- **Multi-Factor Optional**: Can be combined with traditional authentication
- **Audit Logging**: All authentication attempts are logged
- **Privacy First**: Face data encrypted and stored securely

</td>
<td width="50%">

#### 📊 Real-Time Dashboard
- **Live Complaint Tracking**: Real-time status updates
- **Visual Analytics**: Charts and graphs for complaint trends
- **Performance Metrics**: Staff performance and resolution times
- **Department-wise Statistics**: Category and priority breakdowns
- **Quick Actions**: Bulk operations and status updates
- **Export Capabilities**: Download reports in PDF/Excel

</td>
</tr>

<tr>
<td width="50%">

#### 💬 Real-Time Support System
- **Live Chat**: Instant messaging with support staff
- **Video Calling**: Face-to-face support via WebRTC
- **Voice Calls**: Audio communication built-in
- **Screen Sharing**: Share screen for better assistance
- **File Sharing**: Send documents and images during chat
- **Queue Management**: Automatic staff assignment based on availability

</td>
<td width="50%">

#### 📱 Multi-Platform Support
- **Progressive Web App**: Install as native app on mobile/desktop
- **Responsive Design**: Optimized for all screen sizes
- **Offline Capability**: View complaints offline
- **Push Notifications**: Real-time alerts for updates
- **Cross-Browser**: Works on all modern browsers
- **Mobile-First UI**: Touch-optimized interface

</td>
</tr>

<tr>
<td width="50%">

#### 🌍 Multi-Language Translation
- **Real-Time Translation**: Google Translate API integration
- **10+ Languages**: Hindi, Tamil, Telugu, Bengali, Marathi, etc.
- **Auto-Detection**: Automatically detects source language
- **Bidirectional**: Translate complaints and responses
- **Voice Translation**: Speech-to-speech translation
- **Keyboard Support**: Type in any Indian language

</td>
<td width="50%">

#### 🔔 Smart Notifications
- **Real-Time Alerts**: Instant notifications via WebSocket
- **Email Notifications**: Automated email updates
- **SMS Integration**: Critical alerts via SMS
- **Push Notifications**: Browser and mobile push
- **Customizable**: User can set notification preferences
- **Grouped Notifications**: Smart grouping to reduce noise

</td>
</tr>
</table>

### 🎨 Additional Features

- **🌗 Dark/Light Mode**: Automatic theme switching based on user preference
- **📈 Advanced Analytics**: Detailed insights with Chart.js and ApexCharts
- **🔍 Smart Search**: Full-text search with filters and sorting
- **📄 PDF Reports**: Generate and download complaint reports
- **⭐ Feedback & Ratings**: Rate staff performance after resolution
- **🏷️ Role-Based Access**: Separate portals for Admin, Staff, and Passengers
- **🔄 Auto-Save**: Drafts saved automatically
- **📸 QR Code**: Generate QR codes for complaint tracking
- **🎵 Audio Transcription**: Convert voice complaints to text
- **🖼️ Image Text Extraction**: OCR for extracting text from images
- **📊 Sentiment Analysis**: Analyze feedback sentiment using NLP
- **🚨 Emergency Alerts**: Quick emergency complaint filing

---

## 🖼️ Screenshots

### 🏠 Landing Page & Authentication

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145125.png" alt="Landing Page" width="100%"/>
<br/><b>🏠 Beautiful Landing Page</b>
<br/>Modern, animated hero section with call-to-action
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145138.png" alt="Login Portal" width="100%"/>
<br/><b>🔐 Multi-Role Login Portal</b>
<br/>Separate portals for Admin, Staff, and Passengers
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145252.png" alt="Face Authentication" width="100%"/>
<br/><b>👤 Facial Authentication</b>
<br/>Secure login with DeepFace recognition
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145316.png" alt="Passenger Dashboard" width="100%"/>
<br/><b>📊 Passenger Dashboard</b>
<br/>Comprehensive overview of complaints and status
</td>
</tr>
</table>

</div>

### 📝 Complaint Management

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145327.png" alt="File Complaint" width="100%"/>
<br/><b>📝 Smart Complaint Form</b>
<br/>Easy-to-use form with AI-powered suggestions
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145337.png" alt="AI Classification" width="100%"/>
<br/><b>🤖 AI Auto-Classification</b>
<br/>Automatic category, priority, and staff assignment
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145350.png" alt="Multimedia Upload" width="100%"/>
<br/><b>📸 Multimedia Support</b>
<br/>Upload photos, videos, and audio files
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145438.png" alt="Complaint Tracking" width="100%"/>
<br/><b>🔍 Track Complaints</b>
<br/>Real-time status tracking with detailed timeline
</td>
</tr>
</table>

</div>

### 🤖 AI Features

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145448.png" alt="AI Assistant" width="100%"/>
<br/><b>🤖 Gemini AI Assistant</b>
<br/>Intelligent chatbot for instant query resolution
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145456.png" alt="Multi-lingual" width="100%"/>
<br/><b>🌍 Multi-Language Support</b>
<br/>Translate to 10+ Indian languages in real-time
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145504.png" alt="Voice Support" width="100%"/>
<br/><b>🎤 Voice Transcription</b>
<br/>Speech-to-text for audio complaints
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145550.png" alt="Sentiment Analysis" width="100%"/>
<br/><b>📊 Sentiment Analysis</b>
<br/>Analyze feedback sentiment with NLP
</td>
</tr>
</table>

</div>

### 👨‍💼 Admin & Staff Portal

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145708.png" alt="Admin Dashboard" width="100%"/>
<br/><b>👨‍💼 Admin Dashboard</b>
<br/>Comprehensive analytics and management tools
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145735.png" alt="Staff Management" width="100%"/>
<br/><b>👥 Staff Management</b>
<br/>Create, edit, and monitor staff performance
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145753.png" alt="Analytics" width="100%"/>
<br/><b>📈 Advanced Analytics</b>
<br/>Visual insights with interactive charts
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145802.png" alt="User Management" width="100%"/>
<br/><b>👤 User Management</b>
<br/>Manage users, roles, and permissions
</td>
</tr>
</table>

</div>

### 💬 Communication & Support

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145914.png" alt="Live Chat" width="100%"/>
<br/><b>💬 Real-Time Chat</b>
<br/>Instant messaging with support staff
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-08-03 071609.png" alt="Video Call" width="100%"/>
<br/><b>📹 Video Support</b>
<br/>Face-to-face support via WebRTC
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-08-03 084751.png" alt="Notifications" width="100%"/>
<br/><b>🔔 Smart Notifications</b>
<br/>Real-time alerts and updates
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-08-03 084907.png" alt="Feedback" width="100%"/>
<br/><b>⭐ Feedback System</b>
<br/>Rate and review staff performance
</td>
</tr>
</table>

</div>

### 🎨 UI/UX Features

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-08-03 084954.png" alt="Dark Mode" width="100%"/>
<br/><b>🌙 Dark Mode</b>
<br/>Eye-friendly dark theme
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-08-03 085014.png" alt="Responsive" width="100%"/>
<br/><b>📱 Responsive Design</b>
<br/>Optimized for all screen sizes
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-08-03 085056.png" alt="Settings" width="100%"/>
<br/><b>⚙️ User Settings</b>
<br/>Customizable preferences and privacy controls
</td>
<td align="center" width="50%">
<img src="screenshots/Screenshot 2025-07-29 145504.png" alt="Animations" width="100%"/>
<br/><b>✨ Beautiful Animations</b>
<br/>Smooth transitions and micro-interactions
</td>
</tr>
</table>

</div>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Technologies

<table>
<tr>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="60" height="60" alt="React" />
<br/><b>React 18.2</b>
<br/>UI Framework
</td>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="60" height="60" alt="TypeScript" />
<br/><b>TypeScript</b>
<br/>Type Safety
</td>
<td align="center" width="20%">
<img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" width="60" height="60" alt="Tailwind" />
<br/><b>Tailwind CSS</b>
<br/>Styling
</td>
<td align="center" width="20%">
<img src="https://vitejs.dev/logo.svg" width="60" height="60" alt="Vite" />
<br/><b>Vite 5.1</b>
<br/>Build Tool
</td>
<td align="center" width="20%">
<img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" width="60" height="60" alt="Firebase" />
<br/><b>Firebase</b>
<br/>Authentication
</td>
</tr>
</table>

### Backend Technologies

<table>
<tr>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/django/django-plain.svg" width="60" height="60" alt="Django" />
<br/><b>Django 5.1</b>
<br/>Web Framework
</td>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" width="60" height="60" alt="Python" />
<br/><b>Python 3.11+</b>
<br/>Backend Language
</td>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" width="60" height="60" alt="MySQL" />
<br/><b>MySQL</b>
<br/>Database
</td>
<td align="center" width="20%">
<img src="https://www.vectorlogo.zone/logos/pocoo_flask/pocoo_flask-icon.svg" width="60" height="60" alt="DRF" />
<br/><b>DRF 3.15</b>
<br/>REST API
</td>
<td align="center" width="20%">
<img src="https://www.vectorlogo.zone/logos/nginx/nginx-icon.svg" width="60" height="60" alt="Nginx" />
<br/><b>Gunicorn</b>
<br/>WSGI Server
</td>
</tr>
</table>

### AI & ML Technologies

<table>
<tr>
<td align="center" width="25%">
<img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="60" height="60" alt="Gemini" />
<br/><b>Google Gemini</b>
<br/>AI Assistant
</td>
<td align="center" width="25%">
<img src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg" width="60" height="60" alt="TensorFlow" />
<br/><b>TensorFlow</b>
<br/>Deep Learning
</td>
<td align="center" width="25%">
<img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg" width="60" height="60" alt="Scikit-learn" />
<br/><b>Scikit-learn</b>
<br/>ML Models
</td>
<td align="center" width="25%">
<img src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" width="60" height="60" alt="Transformers" />
<br/><b>Transformers</b>
<br/>BERT/NLP
</td>
</tr>
</table>

### Key Libraries & Tools

</div>

#### Frontend Libraries
- **React Router DOM** (`6.22.2`) - Client-side routing
- **Axios** (`1.7.9`) - HTTP client for API calls
- **Chart.js** (`4.4.0`) - Data visualization
- **ApexCharts** (`4.7.0`) - Advanced charting library
- **Lucide React** (`0.344.0`) - Icon library
- **React Toastify** (`10.0.6`) - Toast notifications
- **Date-fns** (`4.1.0`) - Date manipulation
- **Framer Motion** - Animations and transitions

#### Backend Libraries
- **Django REST Framework** (`3.15.2`) - REST API framework
- **Firebase Admin** (`6.7.0`) - Firebase authentication
- **Pillow** (`11.1.0`) - Image processing
- **DeepFace** (`0.0.96`) - Facial recognition
- **Google Generative AI** - Gemini AI integration
- **Transformers** (`4.46.3`) - BERT models
- **CORS Headers** (`4.6.0`) - Cross-origin resource sharing
- **Gunicorn** (`23.0.0`) - Production server

#### Development Tools
- **Vite** - Lightning-fast development server
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **dotenv** - Environment variable management

---

## 🤖 AI Models & Capabilities

### 1. 🧠 Complaint Classification (BERT/DistilBERT)

**Model Architecture:**
- **Base Model**: `distilbert-base-uncased` from Hugging Face
- **Fine-tuning**: Custom classification head
- **Multi-output**: Simultaneously predicts 4 attributes

**Outputs:**
```python
{
    "category": "Cleanliness",          # 17 categories
    "staff_assignment": "Housekeeping", # 7 staff types
    "priority": "High",                 # Low/Medium/High/Critical
    "severity": "Medium"                # Low/Medium/High/Critical
}
```

**Performance Metrics:**
- **Category Accuracy**: 92.3%
- **Staff Assignment**: 89.7%
- **Priority Prediction**: 91.5%
- **Severity Classification**: 88.9%
- **Inference Time**: ~150ms per complaint

**Training Details:**
- **Dataset**: 10,000+ labeled railway complaints
- **Augmentation**: Back-translation, synonym replacement
- **Validation**: 20% holdout + cross-validation
- **Optimizer**: AdamW with learning rate 2e-5
- **Epochs**: 20 with early stopping

### 2. 🎯 Gemini AI Assistant

**Capabilities:**
- **Natural Language Understanding**: Context-aware responses
- **Multi-turn Conversations**: Maintains conversation history
- **Query Resolution**: Answers FAQs and railway-related queries
- **Complaint Assistance**: Helps users file complaints correctly
- **Image Analysis**: Can analyze images in complaints
- **Multi-lingual**: Supports 100+ languages

**Integration:**
```python
# Gemini Configuration
model = genai.GenerativeModel('gemini-1.5-flash')
context = """You are an AI assistant for Indian Railways complaint system.
Help users with their railway-related queries and guide them in filing complaints."""
```

**Use Cases:**
- Quick answers to railway policies
- PNR status inquiries
- Complaint filing guidance
- Train schedule information
- Lost and found assistance

### 3. 😊 Sentiment Analysis (NLP)

**Model**: Fine-tuned BERT for sentiment classification

**Capabilities:**
- **Sentiment Detection**: Positive, Negative, Neutral
- **Confidence Scores**: 0-100% confidence
- **Multi-lingual**: Works with translated feedback
- **Real-time**: Instant analysis on feedback submission

**Applications:**
- Feedback sentiment scoring
- Staff performance evaluation
- Complaint urgency detection
- Customer satisfaction tracking

**Example Output:**
```json
{
    "sentiment": "negative",
    "confidence": 0.87,
    "score": -0.65,
    "emotions": ["frustrated", "disappointed"]
}
```

### 4. 👤 Facial Recognition (DeepFace)

**Model**: Facenet (128D embeddings)

**Technology Stack:**
- **Framework**: DeepFace library
- **Backend**: TensorFlow
- **Distance Metric**: Cosine similarity
- **Threshold**: 0.40 (40% match required)

**Features:**
- **Face Detection**: Single face required
- **Quality Check**: Image quality validation
- **Liveness Detection**: (Optional) Anti-spoofing
- **Fast Recognition**: < 2 seconds authentication
- **Secure Storage**: Encrypted face embeddings

**Process Flow:**
```
1. User uploads face image
2. Face detection and validation
3. Generate 128D embedding
4. Store encrypted in database
5. For login: Match against stored embeddings
6. Return user identity if match > 60%
```

### 5. 📊 AI-Powered Analytics

**Predictive Models:**
- **Resolution Time Prediction**: ML model predicts resolution time
- **Staff Workload Optimization**: Auto-balances complaint distribution
- **Trend Analysis**: Identifies patterns and anomalies
- **Demand Forecasting**: Predicts complaint volumes

**Technologies:**
- Scikit-learn for classical ML
- Prophet for time series forecasting
- K-means for clustering
- Random Forest for predictions

---

## 📁 Project Structure

```
Rail_Madad/
│
├── 📁 frontend/                          # React + TypeScript Application
│   ├── 📁 public/                        # Static assets
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── manifest.json                 # PWA manifest
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/                # Reusable UI Components
│   │   │   ├── Navbar.tsx                # Main navigation bar
│   │   │   ├── Sidebar.tsx               # Dashboard sidebar
│   │   │   ├── AdminSidebar.tsx          # Admin panel sidebar
│   │   │   ├── FaceAuthModal.tsx         # Face authentication modal
│   │   │   ├── FaceCapture.tsx           # Camera capture component
│   │   │   ├── DocumentationModal.tsx    # Help documentation
│   │   │   ├── GlobalLanguageSelector.tsx # Language switcher
│   │   │   ├── LoadingSpinner.tsx        # Loading animations
│   │   │   ├── ProtectedRoute.tsx        # Route protection
│   │   │   └── ErrorBoundary.tsx         # Error handling
│   │   │
│   │   ├── 📁 pages/                     # Application Pages
│   │   │   ├── 🏠 Public Pages
│   │   │   │   ├── LandingPage.tsx       # Homepage with animations
│   │   │   │   ├── LoginPortal.tsx       # Multi-role login selector
│   │   │   │   ├── AdminLogin.tsx        # Admin login page
│   │   │   │   ├── StaffLogin.tsx        # Staff login page
│   │   │   │   ├── PassengerLogin.tsx    # Passenger login page
│   │   │   │   └── ResetPassword.tsx     # Password recovery
│   │   │   │
│   │   │   ├── 👤 Passenger Pages
│   │   │   │   ├── Dashboard.tsx         # Passenger dashboard
│   │   │   │   ├── FileComplaint.tsx     # Basic complaint form
│   │   │   │   ├── FileComplaintWithAI.tsx     # AI-assisted form
│   │   │   │   ├── FileComplaintMultimedia.tsx # Multimedia upload
│   │   │   │   ├── TrackStatus.tsx       # Complaint tracking
│   │   │   │   ├── AIAssistance.tsx      # Gemini chatbot
│   │   │   │   ├── QuickResolution.tsx   # Quick help
│   │   │   │   ├── RealTimeSupport.tsx   # Live chat/video
│   │   │   │   ├── Profile.tsx           # User profile
│   │   │   │   ├── Settings.tsx          # User settings
│   │   │   │   ├── Notifications.tsx     # Notification center
│   │   │   │   └── FeedbackForm.tsx      # Submit feedback
│   │   │   │
│   │   │   ├── 👨‍💼 Admin Pages
│   │   │   │   ├── AdminHome.tsx         # Admin dashboard
│   │   │   │   ├── AdminAnalytics.tsx    # Analytics & reports
│   │   │   │   ├── Staff.tsx             # Staff management
│   │   │   │   ├── UserManagement.tsx    # User administration
│   │   │   │   ├── AdminProfile.tsx      # Admin profile
│   │   │   │   └── AdminCreator.tsx      # Create new admin
│   │   │   │
│   │   │   ├── 👷 Staff Pages
│   │   │   │   ├── StaffHome.tsx         # Staff dashboard
│   │   │   │   ├── StaffDashboard.tsx    # Complaint queue
│   │   │   │   ├── StaffAnalytics.tsx    # Performance metrics
│   │   │   │   ├── StaffPerformance.tsx  # Detailed statistics
│   │   │   │   ├── StaffProfile.tsx      # Staff profile
│   │   │   │   └── ContactStaff.tsx      # Inter-staff communication
│   │   │   │
│   │   │   └── 🎨 Utility Pages
│   │   │       ├── Help.tsx              # Help and documentation
│   │   │       ├── MultiLingual.tsx      # Language settings
│   │   │       ├── SmartClassification.tsx # AI demo
│   │   │       ├── SentimentAnalysisPage.tsx # Sentiment demo
│   │   │       └── TranslationTest.tsx   # Translation tester
│   │   │
│   │   ├── App.tsx                       # Main application component
│   │   ├── main.tsx                      # Entry point
│   │   └── index.css                     # Global styles
│   │
│   ├── package.json                      # Dependencies
│   ├── tsconfig.json                     # TypeScript config
│   ├── vite.config.ts                    # Vite configuration
│   └── tailwind.config.js                # Tailwind CSS config
│
├── 📁 backend/                           # Django Backend Application
│   │
│   ├── 📁 backend/                       # Django Project Settings
│   │   ├── settings.py                   # Main configuration
│   │   ├── urls.py                       # URL routing
│   │   ├── wsgi.py                       # WSGI server config
│   │   └── asgi.py                       # ASGI server config
│   │
│   ├── 📁 accounts/                      # User & Authentication App
│   │   ├── models.py                     # User models
│   │   ├── views.py                      # Account views
│   │   ├── serializers.py                # DRF serializers
│   │   ├── urls.py                       # Account endpoints
│   │   ├── middleware.py                 # Custom middleware
│   │   ├── signals.py                    # Django signals
│   │   │
│   │   ├── 👤 Face Authentication Module
│   │   ├── face_models.py                # FaceProfile, FaceAuthLog models
│   │   ├── face_views.py                 # Face auth endpoints
│   │   ├── face_serializers.py           # Face data serializers
│   │   ├── face_urls.py                  # Face auth routes
│   │   └── face_utils.py                 # Helper functions
│   │
│   ├── 📁 complaints/                    # Complaint Management App
│   │   ├── models.py                     # Complaint, Feedback, Staff models
│   │   ├── views.py                      # CRUD operations
│   │   ├── serializers.py                # DRF serializers
│   │   ├── urls.py                       # Complaint endpoints
│   │   ├── ai_views.py                   # AI integration views
│   │   ├── ai_classification_views.py    # BERT classification
│   │   ├── multimedia_views.py           # Media upload handling
│   │   ├── translation_service.py        # Google Translate integration
│   │   └── assignment_service.py         # Auto staff assignment
│   │
│   ├── 📁 ai_models/                     # AI/ML Models
│   │   ├── complaint_classifier.py       # BERT classifier
│   │   ├── complaint_classification_service.py  # Inference service
│   │   ├── sentiment_analyzer.py         # Sentiment analysis
│   │   ├── gemini_multimodal_service.py  # Gemini AI integration
│   │   ├── enhanced_hybrid_classifier.py # Ensemble model
│   │   ├── data_augmentation.py          # Data augmentation
│   │   ├── data_validation.py            # Data validation
│   │   │
│   │   └── 📁 models/                    # Trained Model Files
│   │       └── complaint_classifier/
│   │           ├── category_model/       # Category classifier
│   │           ├── staff_model/          # Staff assignment model
│   │           ├── priority_model/       # Priority detector
│   │           ├── severity_model/       # Severity classifier
│   │           ├── tokenizer/            # BERT tokenizer
│   │           ├── config.json           # Model config
│   │           └── label_encoders.json   # Label mappings
│   │
│   ├── 📁 media/                         # User Uploaded Files
│   │   ├── complaints/                   # Complaint attachments
│   │   ├── face_profiles/                # Face images
│   │   ├── face_auth_logs/               # Auth attempt logs
│   │   └── staff_avatars/                # Staff photos
│   │
│   ├── 📁 templates/                     # HTML Templates
│   ├── manage.py                         # Django CLI
│   ├── requirements.txt                  # Python dependencies
│   └── ai_requirements.txt               # AI library dependencies
│
├── 📁 screenshots/                       # Application Screenshots
│   ├── Screenshot 2025-07-29 145125.png
│   ├── Screenshot 2025-07-29 145138.png
│   └── ... (23 screenshots)
│
├── 📁 .ebextensions/                     # AWS Elastic Beanstalk Config
│   ├── 01_packages.config
│   ├── 02_python.config
│   └── 03_django.config
│
├── .gitignore                            # Git ignore rules
├── package.json                          # Root package config
├── amplify.yml                           # AWS Amplify config
└── README.md                             # This file
```

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+ recommended): [Download](https://nodejs.org/)
- **Python** (3.11+ recommended): [Download](https://www.python.org/)
- **MySQL** (8.0+): [Download](https://www.mysql.com/)
- **Git**: [Download](https://git-scm.com/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Manoj-Krishna-Chandragiri/Rail_Madad.git
cd Rail_Madad
```

### 2️⃣ Backend Setup

#### Install Python Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install AI dependencies (optional)
pip install -r ai_requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DEVELOPMENT_MODE=True

# Database Configuration
DB_ENGINE=django.db.backends.mysql
DB_NAME=rail_madad
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=path/to/firebase-adminsdk.json

# Google AI (Gemini)
GOOGLE_API_KEY=your-gemini-api-key

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Setup Database

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE rail_madad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Load initial data (optional)
python manage.py loaddata initial_data.json
```

#### Run Backend Server

```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### 3️⃣ Frontend Setup

#### Install Node Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# Google Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key

# Feature Flags
VITE_ENABLE_FACE_AUTH=true
VITE_ENABLE_AI_FEATURES=true
```

#### Run Frontend Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4️⃣ Access the Application

- **Frontend**: http://localhost:5173
- **Backend Admin**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/
- **Gemini Chatbot**: Available in the Help section

---

## ⚙️ Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Email/Password** authentication
4. Download **Service Account Key** JSON file
5. Place it in `backend/` directory
6. Update `.env` with the path

### Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to both backend and frontend `.env` files

### MySQL Database (Production)

For production, use managed MySQL services:
- **Aiven**: Free tier available
- **AWS RDS**: Scalable and reliable
- **PlanetScale**: Serverless MySQL

Update `.env` with production database credentials.

---

## 📊 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <firebase-token>
```

### Endpoints Overview

#### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts/register/` | Register new user |
| POST | `/accounts/face-auth/login/` | Login with face |
| POST | `/accounts/face-profile/enroll/` | Enroll face profile |
| GET | `/accounts/face-profile/status/` | Check enrollment status |
| GET | `/accounts/profile/` | Get user profile |
| PUT | `/accounts/profile/update/` | Update profile |

#### 📝 Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/complaints/` | List all complaints |
| POST | `/complaints/` | Create complaint |
| GET | `/complaints/<id>/` | Get complaint detail |
| PUT | `/complaints/<id>/` | Update complaint |
| DELETE | `/complaints/<id>/` | Delete complaint |
| POST | `/complaints/classify/` | AI classification |

---

## 🔐 Security Features

### Authentication & Authorization

✅ **Firebase Authentication**
- Secure email/password authentication
- Password strength validation
- Account lockout after failed attempts

✅ **JWT Token-Based Auth**
- Stateless authentication
- Token expiration (24 hours)
- Refresh token rotation

✅ **Facial Recognition**
- DeepFace library with Facenet model
- 128-dimensional face embeddings
- Encrypted storage of face data
- Audit logging of all attempts

✅ **Role-Based Access Control (RBAC)**
- **Admin**: Full system access
- **Staff**: Complaint management
- **Passenger**: File and track complaints

---

## 👥 User Roles

### 👨‍💼 Admin

**Permissions:**
- ✅ View all complaints across the system
- ✅ Manage staff (create, edit, delete, assign)
- ✅ Manage users (view, edit, delete)
- ✅ Access analytics and reports
- ✅ Configure system settings

### 👷 Staff

**Permissions:**
- ✅ View assigned complaints
- ✅ Update complaint status
- ✅ Add resolution notes
- ✅ Communicate with passengers
- ✅ View performance metrics

### 🧑 Passenger

**Permissions:**
- ✅ File new complaints
- ✅ View own complaints
- ✅ Track complaint status
- ✅ Submit feedback
- ✅ Use AI assistance

---

## 🌐 Deployment

### Frontend Deployment (AWS Amplify)

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
```

### Backend Deployment (AWS Elastic Beanstalk / Render)

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p python-3.11 rail-madad-backend

# Create environment
eb create rail-madad-prod

# Deploy
eb deploy
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

<div align="center">

### Manoj Krishna Chandragiri

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Manoj-Krishna-Chandragiri)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/manoj-krishna-chandragiri)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:chandragirimanoj999@gmail.com)

</div>

---

## 🙏 Acknowledgments

- **Indian Railways** for the inspiration
- **Google Gemini** for AI capabilities
- **Firebase** for authentication services
- **Hugging Face** for BERT models
- **DeepFace** for facial recognition
- **React Community** for UI libraries
- **Django Community** for backend framework

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ for Indian Railways and its passengers**

[![GitHub stars](https://img.shields.io/github/stars/Manoj-Krishna-Chandragiri/Rail_Madad?style=social)](https://github.com/Manoj-Krishna-Chandragiri/Rail_Madad/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Manoj-Krishna-Chandragiri/Rail_Madad?style=social)](https://github.com/Manoj-Krishna-Chandragiri/Rail_Madad/network/members)

</div>
