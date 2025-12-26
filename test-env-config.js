// Test script to verify environment variables are properly configured
console.log("=== Rail Madad Environment Configuration Test ===\n");

// Test Frontend Environment Variables
console.log("Frontend Environment Variables:");
console.log("- VITE_API_BASE_URL:", process.env.VITE_API_BASE_URL || "NOT SET");
console.log("- VITE_FIREBASE_API_KEY:", process.env.VITE_FIREBASE_API_KEY ? "***CONFIGURED***" : "NOT SET");
console.log("- VITE_FIREBASE_PROJECT_ID:", process.env.VITE_FIREBASE_PROJECT_ID || "NOT SET");
console.log("- VITE_FIREBASE_AUTH_DOMAIN:", process.env.VITE_FIREBASE_AUTH_DOMAIN || "NOT SET");
console.log("- VITE_FIREBASE_STORAGE_BUCKET:", process.env.VITE_FIREBASE_STORAGE_BUCKET || "NOT SET");
console.log("- VITE_FIREBASE_MESSAGING_SENDER_ID:", process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "NOT SET");
console.log("- VITE_FIREBASE_APP_ID:", process.env.VITE_FIREBASE_APP_ID || "NOT SET");

console.log("\nBackend Environment Variables:");
console.log("- DJANGO_SECRET_KEY:", process.env.DJANGO_SECRET_KEY ? "***CONFIGURED***" : "NOT SET");
console.log("- DJANGO_DEBUG:", process.env.DJANGO_DEBUG || "NOT SET");
console.log("- DJANGO_ALLOWED_HOSTS:", process.env.DJANGO_ALLOWED_HOSTS || "NOT SET");
console.log("- USE_SQLITE:", process.env.USE_SQLITE || "NOT SET");
console.log("- MYSQL_DATABASE:", process.env.MYSQL_DATABASE || "NOT SET");
console.log("- MYSQL_HOST:", process.env.MYSQL_HOST || "NOT SET");
console.log("- MYSQL_USER:", process.env.MYSQL_USER || "NOT SET");
console.log("- MYSQL_PASSWORD:", process.env.MYSQL_PASSWORD ? "***CONFIGURED***" : "NOT SET");
console.log("- MYSQL_PORT:", process.env.MYSQL_PORT || "NOT SET");
console.log("- PORT:", process.env.PORT || "NOT SET");

console.log("\n=== Environment Configuration Test Complete ===");
