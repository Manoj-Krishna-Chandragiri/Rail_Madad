import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Train, 
  MessageSquare, 
  BarChart2, 
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Users,
  Shield,
  Mic,
  Camera,
  Video,
  Heart,
  Brain,
  Bell,
  Lock,
  Search,
  TrendingUp,
  Award,
  Code,
  Menu,
  X,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animationLoaded, setAnimationLoaded] = useState(true); // Start with true to avoid loading screen
  const stackTriggerRef = useRef<HTMLDivElement>(null);
  const [currentCarouselSlide, setCurrentCarouselSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const totalCarouselSlides = 19; // Total number of images in the carousel
  
  // Railway image gallery
  const railwayImages = [
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838752/Screenshot_2025-08-10_204040_skrm4a.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838233/Screenshot_2025-08-10_203235_gnws2l.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838001/Screenshot_2025-07-29_145504_it7pzi.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838004/Screenshot_2025-07-29_145252_cjq6bp.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838004/Screenshot_2025-07-29_145316_ivq0an.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838006/Screenshot_2025-07-29_145327_rjfuoy.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838004/Screenshot_2025-08-10_201408_iqpymq.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838005/Screenshot_2025-07-29_145350_ade2ym.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838003/Screenshot_2025-07-29_145438_uvik2n.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838002/Screenshot_2025-08-10_201546_k5b7ab.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838001/Screenshot_2025-07-29_145456_hsifc5.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838004/Screenshot_2025-08-10_202317_nmzsre.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838002/Screenshot_2025-07-29_145708_znqa3q.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838003/Screenshot_2025-08-10_201748_hls0da.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838002/Screenshot_2025-08-10_201804_choim8.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838003/Screenshot_2025-08-10_201915_nghppr.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838003/Screenshot_2025-08-10_201926_hjxcgv.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838004/Screenshot_2025-08-10_202220_libdyj.png",
    "https://res.cloudinary.com/dbnkhibzi/image/upload/v1754838001/Screenshot_2025-07-29_145802_rswp9j.png"
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    // Auto-rotate carousel
    const carouselInterval = setInterval(() => {
      if (!isCarouselPaused) {
        setCurrentCarouselSlide((prev) => (prev + 1) % totalCarouselSlides);
      }
    }, 1500);

    // Initialize GSAP ScrollTrigger animation - Simplified for better performance
    const initGSAPAnimation = async () => {
      try {
        // Dynamically import GSAP
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        
        gsap.registerPlugin(ScrollTrigger);

        // Quick DOM ready check
        await new Promise(resolve => setTimeout(resolve, 100));

        const cards = gsap.utils.toArray(".card-wrapper");
        if (cards.length === 0) {
          setAnimationLoaded(true);
          return;
        }

        // Set initial positions - cleaner stacking
        gsap.set(cards, {
          y: (index: number) => index * 30,
          scale: (index: number) => 1 - (index * 0.03),
          rotationX: (index: number) => -index * 2,
          transformOrigin: "center center",
          zIndex: (index: number) => cards.length - index,
          opacity: 1
        });

        // Simplified animation timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".trigger",
            start: "top top",
            end: "+=200%",
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              // Update progress
              document.body.style.setProperty('--scroll-progress', self.progress.toString());
            }
          }
        });

        // Smoother card animation
        cards.forEach((card: any, index: number) => {
          if (index === 0) {
            // First card animation
            tl.to(card, {
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: 1,
              ease: "power2.out"
            }, 0);
            return;
          }

          // Sequential reveal for other cards
          tl.to(card, {
            y: -index * 15,
            scale: 0.98 - (index * 0.02),
            rotationX: -3 - (index * 2),
            duration: 1,
            ease: "power2.out"
          }, index * 0.2);
        });

        ScrollTrigger.refresh();
        setAnimationLoaded(true);

      } catch (error) {
        console.error('GSAP animation error:', error);
        setAnimationLoaded(true);
        
        // Lightweight fallback
        const style = document.createElement('style');
        style.textContent = `
          .card-wrapper {
            transition: all 0.3s ease;
          }
          .card-wrapper:hover {
            transform: translateY(-5px) scale(1.02);
          }
        `;
        document.head.appendChild(style);
      }
    };

    initGSAPAnimation();

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(carouselInterval);
      // Clean up ScrollTrigger instances
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
        ScrollTrigger.refresh();
      }).catch(() => {
        // If GSAP fails to load, add fallback CSS animation
        const style = document.createElement('style');
        style.textContent = `
          .card-wrapper {
            animation: stackCard 2s ease-in-out infinite alternate;
          }
          .card-wrapper:nth-child(2) { animation-delay: 0.5s; }
          .card-wrapper:nth-child(3) { animation-delay: 1s; }
          .card-wrapper:nth-child(4) { animation-delay: 1.5s; }
          .card-wrapper:nth-child(5) { animation-delay: 2s; }
          
          @keyframes stackCard {
            0% { transform: translateY(0) scale(1) rotateX(0deg); }
            100% { transform: translateY(-20px) scale(0.95) rotateX(-5deg); }
          }
        `;
        document.head.appendChild(style);
      });
    };
  }, []);

  // Add keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentCarouselSlide(prev => (prev === 0 ? totalCarouselSlides - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentCarouselSlide(prev => (prev === totalCarouselSlides - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalCarouselSlides]);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const features = [
    {
      icon: <MessageSquare className="h-12 w-12" />,
      title: "Smart Complaint Filing",
      description: "AI-powered categorization automatically routes your complaint to the right department for faster resolution.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Mic className="h-12 w-12" />,
      title: "Voice-to-Text Support",
      description: "File complaints using voice commands with our advanced speech recognition technology.",
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <BarChart2 className="h-12 w-12" />,
      title: "Real-time Tracking",
      description: "Track your complaint status in real-time with live updates and notifications throughout the resolution process.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Camera className="h-12 w-12" />,
      title: "AI Image Analysis",
      description: "Upload photos/videos of issues. Our AI automatically categorizes and prioritizes based on visual content.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Video className="h-12 w-12" />,
      title: "Video Call Support",
      description: "Connect with staff through HD video calls for complex issues requiring visual demonstration.",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: "Sentiment Analysis",
      description: "AI analyzes passenger feedback emotions to prioritize urgent cases and improve service quality.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Lock className="h-12 w-12" />,
      title: "Secure Authentication",
      description: "Multi-factor authentication, biometric login, and end-to-end encryption for data protection.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Bell className="h-12 w-12" />,
      title: "Smart Notifications",
      description: "Intelligent push notifications, SMS alerts, and email updates based on your preferences.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop&crop=center"
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: "AI Assistant 24/7",
      description: "Advanced chatbot with natural language processing for instant support and query resolution.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop&crop=center"
    }
  ];

  const steps = [
    { number: 1, title: "File Complaint", description: "Submit your complaint with details and evidence" },
    { number: 2, title: "Smart Classification", description: "AI automatically categorizes and prioritizes" },
    { number: 3, title: "Agent Assignment", description: "Assigned to the most suitable agent" },
    { number: 4, title: "Real-time Updates", description: "Receive notifications about progress" },
    { number: 5, title: "Resolution", description: "Quick and satisfactory resolution" }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Frequent Traveler",
      rating: 5,
      content: "My complaint about AC malfunction was resolved within 2 hours! The real-time tracking feature kept me informed throughout the process.",
      avatar: "R"
    },
    {
      name: "Priya Sharma",
      role: "Daily Commuter",
      rating: 5,
      content: "The AI assistant helped me file my complaint in Hindi. The multi-language support is excellent for passengers like me.",
      avatar: "P"
    },
    {
      name: "Amit Patel",
      role: "Business Traveler",
      rating: 5,
      content: "The video support feature saved my day when I had an urgent issue. Quick, efficient, and professional service.",
      avatar: "A"
    }
  ];

  const stats = [
    { value: "500K+", label: "Complaints Resolved" },
    { value: "95%", label: "Resolution Rate" },
    { value: "24/7", label: "Support Available" },
    { value: "10+", label: "Languages Supported" }
  ];

  const advancedFeatures = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Intelligent Search",
      description: "Find complaints instantly with AI-powered search across text, images, and metadata.",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Predictive Analytics",
      description: "Forecast complaint trends and prevent issues before they escalate.",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Advanced Security",
      description: "Blockchain-verified complaints with tamper-proof audit trails.",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Collaborative Resolution",
      description: "Multi-department coordination with real-time staff communication tools.",
      color: "from-orange-400 to-orange-600"
    }
  ];

  // Stack features with comprehensive information for landing page showcase
  const stackFeatures = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop&crop=center",
      title: "AI-Powered Smart Classification",
      subtitle: "Intelligent Complaint Processing",
      badge: "🤖 AI-Enabled",
      stats: { accuracy: "98.5%", speed: "3x faster", languages: "15+" },
      points: [
        "Automatic categorization using advanced machine learning",
        "Smart priority assignment based on severity and impact",
        "Intelligent routing to specialized railway departments",
        "Multi-language support with natural language processing"
      ]
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center",
      title: "Real-Time Tracking & Updates",
      subtitle: "Complete Transparency",
      badge: "⚡ Live Updates",
      stats: { updates: "Real-time", channels: "5+", response: "< 30s" },
      points: [
        "Live status updates throughout resolution process",
        "Multi-channel notifications via SMS, email, and app",
        "Predictive resolution time estimates",
        "Interactive progress timeline with milestones"
      ]
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&h=600&fit=crop&crop=center",
      title: "Multi-Modal Communication",
      subtitle: "Voice, Video & Chat Support",
      badge: "🎥 Premium Support",
      stats: { availability: "24/7", experts: "500+", satisfaction: "4.9/5" },
      points: [
        "Voice-to-text complaint filing with accent recognition",
        "HD video calls with certified railway specialists",
        "AI chatbot with seamless human escalation",
        "Screen sharing for visual issue demonstration"
      ]
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=center",
      title: "Advanced Analytics Dashboard",
      subtitle: "Data-Driven Insights",
      badge: "📊 Analytics Pro",
      stats: { insights: "Live", reports: "50+", accuracy: "99%" },
      points: [
        "Comprehensive sentiment analysis of feedback",
        "Predictive maintenance alerts using IoT data",
        "Customizable performance metrics dashboard",
        "Trend analysis for proactive improvements"
      ]
    }
  ];

  return (
    <div 
      className={`min-h-screen ${isDark ? 'text-white' : 'text-gray-900'} overflow-x-hidden relative`}
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dbnkhibzi/image/upload/v1751548248/Railways_Image_qxrrvn.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay with blur - reduced opacity */}
      <div 
        className="absolute inset-0 backdrop-blur-[3px]"
        style={{
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          pointerEvents: 'none'
        }}
      ></div>

      {/* Floating Background Elements - reduced opacity */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-indigo-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 md:w-48 md:h-48 bg-purple-500/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-3/4 w-16 h-16 md:w-32 md:h-32 bg-pink-500/5 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-4 md:right-10 w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Enhanced Header */}
      <header className={`fixed top-0 w-full z-50 ${isDark ? 'bg-gray-900/60' : 'bg-white/60'} backdrop-blur-sm border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all duration-300 relative`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <Train className="h-6 w-6 md:h-8 md:w-8 text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Rail Madad
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { name: 'Features', id: 'features' },
                { name: 'How It Works', id: 'how-it-works' },
                { name: 'Reviews', id: 'reviews' },
                { name: 'Contact', id: 'contact' }
              ].map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="relative hover:text-indigo-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-md px-2 py-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/login" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Login
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className={`md:hidden py-4 border-t ${isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
              <div className="flex flex-col space-y-4">
                {[
                  { name: 'Features', id: 'features' },
                  { name: 'How It Works', id: 'how-it-works' },
                  { name: 'Reviews', id: 'reviews' },
                  { name: 'Contact', id: 'contact' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left px-4 py-2 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-md"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    to="/login" 
                    className={`text-center py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-center py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className={`pt-20 pb-16 relative ${isDark ? 'bg-gradient-to-br from-gray-900/50 via-indigo-900/30 to-gray-900/50' : 'bg-gradient-to-br from-indigo-100/60 via-white/50 to-purple-100/60'}`}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-4 md:left-10 w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-8 md:right-20 w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-8 md:left-20 w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-4 md:right-10 w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="mb-6 md:mb-8">
              {/* Image Carousel */}
              <div 
                className="relative mx-auto w-full max-w-4xl h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-xl shadow-xl"
                ref={carouselRef}
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
              >
                {/* Carousel Container */}
                <div className="absolute inset-0 bg-gray-900/10"></div>
                
                {/* Carousel Images */}
                <div 
                  className="flex w-full h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentCarouselSlide * 100}%)` }}
                >
                  {/* Real railway system images */}
                  {railwayImages.map((imageUrl, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                      <div className="absolute inset-0">
                        <img 
                          src={imageUrl} 
                          alt={`Rail Madad ${index + 1}`}
                          className="w-full h-full object-fill"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
                        <p className="font-bold text-sm md:text-base">{index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 backdrop-blur-sm z-10 transition-colors duration-300"
                  onClick={() => setCurrentCarouselSlide(prev => (prev === 0 ? totalCarouselSlides - 1 : prev - 1))}
                  aria-label="Previous slide"
                >
                  <ArrowRight className="h-6 w-6 transform rotate-180" />
                </button>
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 backdrop-blur-sm z-10 transition-colors duration-300"
                  onClick={() => setCurrentCarouselSlide(prev => (prev === totalCarouselSlides - 1 ? 0 : prev + 1))}
                  aria-label="Next slide"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                  {Array.from({ length: Math.min(10, totalCarouselSlides) }).map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        currentCarouselSlide === index 
                          ? 'w-6 bg-indigo-500' 
                          : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                      onClick={() => setCurrentCarouselSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                  {totalCarouselSlides > 10 && (
                    <span className="text-white text-xs bg-black/30 px-2 rounded-full">+{totalCarouselSlides - 10}</span>
                  )}
                </div>
              </div>
            </div>

            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent px-2 py-1" style={{
                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(79, 70, 229, 0.2)',
                textShadow: '0 0 1px rgba(79, 70, 229, 0.5)',
                filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.5))'
              }}>
                Smart Railway
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent px-2 py-1" style={{
                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(168, 85, 247, 0.2)',
                marginTop: '0.75rem',
                display: 'inline-block',
                textShadow: '0 0 1px rgba(168, 85, 247, 0.5)',
                filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))'
              }}>
                Complaint Resolution
              </span>
            </h1>
            
            <p className={`text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto ${isDark ? 'text-white' : 'text-indigo-900'} ${isVisible ? 'animate-fade-in-delay-1' : 'opacity-0'} px-6 py-3 font-medium`} style={{ 
              textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.6)' : '0 1px 2px rgba(30, 64, 175, 0.4)',
              backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : 'rgba(255, 255, 255, 0.85)', 
              borderRadius: '0.5rem',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              AI-powered platform for instant complaint filing, real-time tracking, and 24/7 support. Making your railway journey smooth and hassle-free.
            </p>

            <div className={`flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 md:mb-12 px-4 ${isVisible ? 'animate-fade-in-delay-2' : 'opacity-0'}`}>
              <Link 
                to="/login" 
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <span>File a Complaint</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/track-status" 
                className={`px-6 md:px-8 py-3 md:py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
              >
                <span>Track Your Complaint</span>
                <BarChart2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>

            <div className={`flex flex-wrap justify-center items-center gap-4 md:gap-8 ${isDark ? 'text-gray-400' : 'text-gray-500'} ${isVisible ? 'animate-fade-in-delay-3' : 'opacity-0'} px-4`}>
              {[
                { icon: CheckCircle, text: "Trusted by millions", color: "text-green-500" },
                { icon: CheckCircle, text: "95% Resolution Rate", color: "text-blue-500" },
                { icon: CheckCircle, text: "24/7 AI Support", color: "text-purple-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2 group hover:scale-110 transition-transform">
                  <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color} group-hover:animate-pulse`} />
                  <span className="text-sm md:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GSAP Stack Animation Section */}
      <div className="trigger" ref={stackTriggerRef}>
        {/* Hero section for trigger */}
        <div className="hero" style={{ 
          background: isDark ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%)' : 'linear-gradient(135deg, rgba(30, 64, 175, 0.6) 0%, rgba(79, 70, 229, 0.6) 100%)',
          backdropFilter: 'blur(3px)'
        }}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-center px-6 py-3" style={{ 
            color: isDark ? '#fff' : '#1e3a8a',
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0.75rem',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(79, 70, 229, 0.3)',
            letterSpacing: '0.5px'
          }}>
            Revolutionary Railway Experience
          </h2>
          <p className={`text-lg md:text-xl lg:text-2xl text-center max-w-3xl px-6 py-4 mb-8 mx-auto`} style={{ 
            color: isDark ? '#fff' : '#1e3a8a',
            fontWeight: '700',
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(79, 70, 229, 0.3)',
            letterSpacing: '0.25px'
          }}>
            Advanced AI-powered complaint resolution system transforming how passengers interact with Indian Railways
          </p>
          <div className="text-center">
            <div className="inline-block animate-bounce bg-indigo-700 p-3 rounded-full shadow-xl border-2 border-white/20">
              <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-white transform rotate-90" />
            </div>
            <p className={`text-sm md:text-base mt-3 font-bold px-5 py-2`} style={{ 
              color: isDark ? '#fff' : '#1e3a8a',
              backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(79, 70, 229, 0.3)',
              letterSpacing: '0.25px'
            }}>Discover innovative features below</p>
          </div>
        </div>

        {/* Quick Loading Screen - Shows only briefly */}
        {!animationLoaded && (
          <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/70 via-purple-900/70 to-pink-900/70 z-30 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 mb-6 mx-auto">
                <div className="w-full h-full border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>Loading Experience</h3>
              <p className="text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Preparing features...</p>
            </div>
          </div>
        )}

        {/* Stack cards section */}
        <div className={`extra-trigger transition-opacity duration-1000 ${animationLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="card-container">
            {stackFeatures.map((feature, index) => (
              <div key={feature.id} className="card-wrapper">
                <div className={`card ${isDark ? 'bg-gray-800/70 border-gray-700/80' : 'bg-white/70 border-gray-200/80'} border-2 rounded-2xl w-full h-full overflow-hidden shadow-2xl backdrop-blur-sm`}>
                  <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center p-4 md:p-6 lg:p-8 h-full">
                    {/* Image Section */}
                    <div className={`relative ${index % 2 === 0 ? 'order-1' : 'md:order-2'}`}>
                      <img
                        src={feature.image}
                        loading="eager"
                        alt={`Rail Madad ${feature.title}`}
                        className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg md:rounded-xl shadow-lg"
                      />
                      
                      {/* Feature number overlay */}
                      <div className="absolute top-2 left-2 md:top-4 md:left-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-2xl shadow-lg">
                          {feature.id}
                        </div>
                      </div>

                      {/* Badge overlay */}
                      <div className="absolute top-2 right-2 md:top-4 md:right-4">
                        <div className="px-3 py-1 md:px-4 md:py-2 bg-black/80 text-white text-xs md:text-sm font-semibold rounded-full backdrop-blur-sm">
                          {feature.badge}
                        </div>
                      </div>

                      {/* Stats overlay */}
                      <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4">
                        <div className="grid grid-cols-3 gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-2 md:p-3">
                          {Object.entries(feature.stats).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-sm md:text-lg font-bold text-gray-900 dark:text-white" style={{ textShadow: isDark ? '0 1px 1px rgba(0,0,0,0.3)' : '0 1px 1px rgba(0,0,0,0.1)' }}>{value}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300 capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`${index % 2 === 0 ? 'order-2' : 'md:order-1'} flex flex-col justify-center`}>
                      {/* Header */}
                      <div className="mb-4 md:mb-6">
                        <div className="inline-block text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide mb-2 md:mb-3 px-3 md:px-4 py-1 md:py-2 bg-indigo-100/90 dark:bg-indigo-900/70 rounded-full">
                          {feature.subtitle}
                        </div>
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 leading-tight text-gray-900 dark:text-white" style={{ 
                          textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.6)' : '0 2px 4px rgba(30, 64, 175, 0.4)',
                          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          display: 'inline-block'
                        }}>
                          {feature.title}
                        </h3>
                      </div>

                      {/* Enhanced Points */}
                      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        {feature.points.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className={`text-sm md:text-base lg:text-lg ${isDark ? 'text-white' : 'text-gray-900'} leading-relaxed font-medium`} style={{ 
                              textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(30, 64, 175, 0.3)',
                              backgroundColor: isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem'
                            }}>
                              {point}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Enhanced CTA Button */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to="/login"
                          className="inline-flex items-center justify-center space-x-2 md:space-x-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white rounded-lg md:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 font-semibold text-sm md:text-base backdrop-blur-sm"
                        >
                          <span>Experience This Feature</span>
                          <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Link>
                        <button className="inline-flex items-center justify-center space-x-2 px-6 md:px-8 py-3 md:py-4 border-2 border-indigo-600/90 text-indigo-600 dark:text-indigo-400 rounded-lg md:rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-all duration-300 font-semibold text-sm md:text-base backdrop-blur-sm">
                          <span>Learn More</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Features Section - Remove extra spacing */}
      <section id="features" className={`py-8 md:py-12 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'} relative backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comprehensive Railway Solutions
            </h2>
            <p className={`text-lg md:text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} px-4`}>
              Experience cutting-edge technology designed for modern railway passengers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-700/70' : 'bg-white/70'} shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden relative backdrop-blur-sm border border-gray-200/20`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Feature Image */}
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-24 md:h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="text-indigo-600 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} group-hover:text-opacity-80`}>
                  {feature.description}
                </p>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Advanced Features Showcase */}
          <div className="mt-16 md:mt-20">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">Advanced Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {advancedFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-4 md:p-6 rounded-xl bg-gradient-to-r ${feature.color} text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="font-semibold mb-2 text-sm md:text-base">{feature.title}</h4>
                  <p className="text-xs md:text-sm opacity-90">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className={`text-lg md:text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} px-4`}>
              Simple steps powered by advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative group">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                  {step.title}
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm px-2`}>
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 absolute top-6 md:top-8 -right-2 md:-right-4 hidden md:block animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`py-16 md:py-20 ${isDark ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} relative overflow-hidden`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-2 md:gap-4 transform rotate-12">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 md:w-4 md:h-4 bg-white rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="group hover:scale-110 transition-transform duration-300"
              >
                <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 group-hover:animate-bounce">
                  {stat.value}
                </div>
                <div className="text-sm md:text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="reviews" className={`py-16 md:py-20 ${isDark ? 'bg-gray-800/40' : 'bg-indigo-100/30'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" style={{ 
              textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.7)' : '0 2px 4px rgba(30, 64, 175, 0.5)',
              color: isDark ? 'white' : '#1e3a8a',
              backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.6)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              display: 'inline-block'
            }}>What Our Passengers Say</h2>
            <p className={`text-lg md:text-xl ${isDark ? 'text-white' : 'text-indigo-900'} px-4 font-medium mt-2`} style={{ 
              textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.6)' : '0 1px 2px rgba(30, 64, 175, 0.4)',
              backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.6)',
              padding: '0.25rem 1rem',
              borderRadius: '0.5rem',
              display: 'inline-block'
            }}>
              Real feedback from satisfied customers
            </p>
          </div>

          {/* Featured Testimonial Carousel */}
          <div className="mb-12">
            <div className={`max-w-4xl mx-auto p-8 rounded-2xl ${isDark ? 'bg-gray-700/70' : 'bg-white/70'} shadow-2xl transform transition-all duration-500 backdrop-blur-sm border border-gray-200/20`}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className={`text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'} italic font-medium`} style={{ 
                  textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 1px rgba(0,0,0,0.2)',
                  backgroundColor: isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div>
                  <h4 className="font-semibold text-lg">{testimonials[currentTestimonial].name}</h4>
                  <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Testimonial Navigation Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-indigo-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* All Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/60' : 'bg-white/60'} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group backdrop-blur-sm border border-gray-200/20`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-4 group-hover:scale-110 transition-transform">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} group-hover:text-opacity-90`} style={{ textShadow: isDark ? '0 1px 1px rgba(0,0,0,0.2)' : 'none' }}>
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`py-16 md:py-20 ${isDark ? 'bg-gradient-to-r from-indigo-900/70 to-purple-900/70' : 'bg-gradient-to-r from-indigo-600/70 to-purple-600/70'} relative overflow-hidden backdrop-blur-sm`}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/60 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/60 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/60 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-3/4 w-12 h-12 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4" style={{ 
              textShadow: '0 2px 6px rgba(0,0,0,0.7)',
              backgroundColor: 'rgba(17, 24, 39, 0.5)',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              display: 'inline-block',
              filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))'
            }}>
              Trusted by Millions of Railway Passengers
            </h2>
            <p className="text-lg md:text-xl text-white max-w-2xl mx-auto font-medium" style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              backgroundColor: 'rgba(17, 24, 39, 0.5)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              display: 'inline-block',
              marginTop: '0.5rem'
            }}>
              See how we're transforming railway complaint resolution across India
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group transform hover:scale-110 transition-all duration-300 bg-black/40 backdrop-blur-sm p-4 rounded-xl"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-white font-medium uppercase tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {stat.label}
                </div>
                <div className="w-full h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Call-to-Action */}
          <div className="text-center mt-12 md:mt-16">
            <Link
              to="/login"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-white/80 text-indigo-600 rounded-lg font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
            >
              <span>Join Our Success Story</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Creator Credits Section */}
      <section className={`py-12 md:py-16 ${isDark ? 'bg-gray-900/60' : 'bg-white/60'} border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 md:mb-8">
              <Award className="h-12 w-12 md:h-16 md:w-16 text-indigo-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.2)' }}>Created with 💖 by</h3>
              <div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800/70' : 'bg-gray-50/70'} shadow-lg max-w-md mx-auto backdrop-blur-sm border border-gray-200/20`}>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Code className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
                  <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Manoj Krishna Chandragiri
                  </span>
                </div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Full-Stack Developer & AI Enthusiast
                </p>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mt-2`}>
                  Passionate about creating innovative solutions for India's railway system
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className={`py-12 md:py-16 ${isDark ? 'bg-gray-900/70' : 'bg-gray-900/70'} text-white relative overflow-hidden z-10`}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-2 transform -rotate-12">
            {Array.from({ length: 144 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.05}s` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="group">
              <div className="flex items-center space-x-2 mb-4">
                <Train className="h-8 w-8 text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span className="text-xl font-bold">Rail Madad</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for railway complaint resolution. Making your journey comfortable and hassle-free with cutting-edge AI technology.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 bg-gray-800/70 rounded-full flex items-center justify-center hover:bg-indigo-600/90 transition-colors transform hover:scale-110 backdrop-blur-sm"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-gray-400/90 rounded"></div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { text: "File Complaint", link: "/login" },
                  { text: "Track Status", link: "/track-status" },
                  { text: "AI Assistant", link: "/ai-assistance" },
                  { text: "Voice Support", link: "/real-time-support" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to={item.link} 
                      className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform inline-block"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">Advanced Features</h3>
              <ul className="space-y-2">
                {[
                  "Voice-to-Text Filing",
                  "AI Image Recognition", 
                  "Video Call Support",
                  "Sentiment Analysis"
                ].map((item, index) => (
                  <li key={index} className="text-gray-400 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">Contact Info</h3>
              <ul className="space-y-3">
                {[
                  { icon: Phone, text: "Helpline: 139" },
                  { icon: Mail, text: "support@railmadad.com" },
                  { icon: Globe, text: "www.railmadad.com" },
                  { icon: MapPin, text: "New Delhi, India" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 group">
                    <item.icon className="h-4 w-4 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-gray-400 group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-sm md:text-base">
              &copy; 2025 Rail Madad. All rights reserved. | 
              <a href="#" className="hover:text-white transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded">Privacy Policy</a> | 
              <a href="#" className="hover:text-white transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded">Terms of Service</a>
            </p>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              Developed with 💝 using React, TypeScript, Firebase, and cutting-edge AI technologies
            </p>
          </div>
        </div>
      </footer>
      
      {/* CSS Styles for GSAP Stack Animation */}
      <style>{`
        .trigger {
          position: relative;
          height: 300vh; /* Optimized height */
        }
        
        .hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .extra-trigger {
          position: relative;
          height: 200vh; /* Compact animation space */
        }
        
        .card-container {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          overflow: hidden;
        }
        
        .card-wrapper {
          position: absolute;
          width: 90%;
          max-width: 1000px;
          height: 75vh;
          max-height: 600px;
          transform-style: preserve-3d;
          will-change: transform;
          transition: all 0.3s ease;
        }
        
        .card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(5px);
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Simplified progress indicator */
        .scroll-progress-indicator {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          z-index: 100;
        }

        .progress-bar {
          width: 4px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          width: 100%;
          height: calc(var(--scroll-progress, 0) * 100%);
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          transition: height 0.2s ease;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .trigger { height: 250vh; }
          .extra-trigger { height: 150vh; }
          .card-wrapper {
            height: 65vh;
            width: 95%;
            max-height: 450px;
          }
          .hero { height: 85vh; padding: 1rem; }
          .scroll-progress-indicator { display: none; }
        }
        
        @media (max-width: 480px) {
          .trigger { height: 200vh; }
          .extra-trigger { height: 100vh; }
          .card-wrapper {
            height: 55vh;
            max-height: 350px;
            width: 98%;
          }
          .hero { height: 75vh; padding: 0.5rem; }
        }

        /* Smooth animations */
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced hover effects */
        .card-wrapper:hover {
          transform: scale(1.02) rotateY(2deg);
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;





