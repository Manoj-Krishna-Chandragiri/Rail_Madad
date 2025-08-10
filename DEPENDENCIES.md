# Package Dependencies Documentation

## Frontend Dependencies (package.json)

### Production Dependencies

#### Core React Framework
- **react**: ^18.2.0 - Core React library
- **react-dom**: ^18.2.0 - React DOM rendering
- **react-router-dom**: ^6.22.2 - Client-side routing

#### HTTP Client & API Integration
- **axios**: ^1.7.9 - Promise-based HTTP client
- **firebase**: ^11.2.0 - Firebase SDK for authentication and database

#### UI Components & Styling
- **lucide-react**: ^0.344.0 - Beautiful & consistent icon library
- **tailwindcss-animate**: ^1.0.7 - Animation utilities for Tailwind CSS

#### Charts & Data Visualization
- **chart.js**: ^4.4.0 - Simple yet flexible JavaScript charting
- **react-chartjs-2**: ^5.2.0 - React wrapper for Chart.js
- **apexcharts**: ^4.7.0 - Modern charting library
- **react-apexcharts**: ^1.7.0 - React wrapper for ApexCharts

#### Development & Build Tools
- **@types/node**: ^20.11.24 - TypeScript definitions for Node.js
- **cloudinary**: ^2.5.1 - Image and video management service

### Development Dependencies

#### TypeScript & React Types
- **@types/react**: ^18.2.56 - TypeScript definitions for React
- **@types/react-dom**: ^18.2.19 - TypeScript definitions for React DOM
- **typescript**: ^5.2.2 - TypeScript compiler

#### Build Tools
- **vite**: ^5.1.4 - Fast build tool and development server
- **@vitejs/plugin-react**: ^4.2.1 - Vite plugin for React support

#### Linting & Code Quality
- **eslint**: ^8.56.0 - JavaScript/TypeScript linter
- **@typescript-eslint/eslint-plugin**: ^7.0.2 - ESLint plugin for TypeScript
- **@typescript-eslint/parser**: ^7.0.2 - ESLint parser for TypeScript
- **eslint-plugin-react-hooks**: ^4.6.0 - ESLint rules for React Hooks
- **eslint-plugin-react-refresh**: ^0.4.5 - ESLint plugin for React Refresh

#### CSS Processing
- **tailwindcss**: ^3.4.17 - Utility-first CSS framework
- **autoprefixer**: ^10.4.20 - PostCSS plugin to add vendor prefixes
- **postcss**: ^8.5.1 - CSS transformation tool

## Backend Dependencies (requirements.txt)

### Core Django Framework
- **Django**: 5.1.5 - High-level Python web framework
- **djangorestframework**: 3.15.2 - Powerful and flexible toolkit for building Web APIs

### Security & CORS
- **django-cors-headers**: 4.6.0 - Django app for handling Cross-Origin Resource Sharing
- **whitenoise**: >=6.0.0 - Simplified static file serving for Python web apps

### Authentication & Firebase
- **firebase-admin**: 6.7.0 - Firebase Admin Python SDK

### Environment & Configuration
- **python-dotenv**: 1.0.1 - Load environment variables from .env file

### Image Processing
- **Pillow**: 11.1.0 - Python Imaging Library (PIL Fork)

### HTTP & Database
- **requests**: 2.31.0 - HTTP library for Python
- **mysqlclient**: 2.2.4 - MySQL database connector for Python

### Production Server
- **gunicorn**: 23.0.0 - Python WSGI HTTP Server for UNIX

## Key Features Enabled by Dependencies

### Frontend Capabilities
1. **Modern React Development**: TypeScript support with React 18 features
2. **Responsive Design**: Tailwind CSS with custom animations
3. **Data Visualization**: Multiple chart libraries for analytics dashboards
4. **Real-time Communication**: Firebase integration for authentication and real-time updates
5. **Icon System**: Comprehensive Lucide React icon library
6. **Fast Development**: Vite for instant hot module replacement
7. **Code Quality**: ESLint with TypeScript rules and React-specific linting

### Backend Capabilities
1. **RESTful API**: Django REST Framework for robust API development
2. **Authentication**: Firebase Admin SDK for secure user management
3. **File Handling**: Pillow for image processing and media management
4. **Database Support**: MySQL integration with fallback options
5. **Production Ready**: Gunicorn WSGI server with WhiteNoise static file serving
6. **Security**: CORS handling and environment variable management
7. **Scalability**: Django's ORM and middleware system for enterprise applications

## Development Workflow Support

### Frontend Development
- **Hot Reload**: Vite provides instant feedback during development
- **Type Safety**: TypeScript ensures code reliability and better developer experience
- **Component Development**: React with modern hooks and context patterns
- **Styling**: Utility-first CSS with Tailwind for rapid UI development

### Backend Development
- **API Development**: Django REST Framework serializers and viewsets
- **Database Migrations**: Django's built-in migration system
- **Authentication**: Firebase integration for modern auth flows
- **Media Handling**: Robust file upload and processing capabilities

## Production Deployment

### Frontend Optimization
- **Bundle Optimization**: Vite's rollup-based bundling for optimal performance
- **Tree Shaking**: Automatic removal of unused code
- **CSS Optimization**: PostCSS with autoprefixer for browser compatibility
- **Type Checking**: TypeScript compilation ensures runtime safety

### Backend Scaling
- **WSGI Server**: Gunicorn for handling multiple concurrent requests
- **Static Files**: WhiteNoise for efficient static file serving
- **Database**: MySQL for production-grade data persistence
- **Security**: Environment-based configuration for sensitive data

This dependency structure ensures a modern, scalable, and maintainable full-stack application suitable for enterprise deployment.
