// Admin Login Test Script for Browser Console
// Copy and paste this in browser console to test admin login flow

console.log('🔍 Testing Admin Login Flow...');

// Check current authentication state
function checkAuthState() {
  const state = {
    isAuthenticated: localStorage.getItem('isAuthenticated'),
    userRole: localStorage.getItem('userRole'),
    adminToken: localStorage.getItem('adminToken'),
    authToken: localStorage.getItem('authToken'),
    userEmail: localStorage.getItem('userEmail')
  };
  
  console.log('📊 Current Auth State:', state);
  return state;
}

// Test admin email check
function testAdminEmailCheck(email) {
  const adminEmails = ['adm.railmadad@gmail.com', 'admin@railmadad.in'];
  const isAdmin = adminEmails.includes(email);
  console.log(`📧 Email: ${email}, Is Admin: ${isAdmin}`);
  return isAdmin;
}

// Test routing logic
function testRoutingLogic() {
  const userRole = localStorage.getItem('userRole');
  const adminToken = localStorage.getItem('adminToken');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userEmail = localStorage.getItem('userEmail');
  
  console.log('🚦 Routing Test:');
  console.log(`  - User Role: ${userRole}`);
  console.log(`  - Has Admin Token: ${!!adminToken}`);
  console.log(`  - Is Authenticated: ${isAuthenticated}`);
  console.log(`  - User Email: ${userEmail}`);
  
  if (!isAuthenticated) {
    console.log('  → Should redirect to: /login');
    return '/login';
  }
  
  if (adminToken && userRole === 'admin') {
    console.log('  → Should redirect to: /admin-dashboard');
    return '/admin-dashboard';
  }
  
  if (userEmail === 'adm.railmadad@gmail.com') {
    console.log('  → Should redirect to: /admin-dashboard (by email)');
    return '/admin-dashboard';
  }
  
  if (userRole === 'admin') {
    console.log('  → Should redirect to: /admin-dashboard (by role)');
    return '/admin-dashboard';
  }
  
  console.log('  → Should redirect to: /user-dashboard');
  return '/user-dashboard';
}

// Test authentication service
function testAuthService() {
  if (window.authService) {
    const state = window.authService.getAuthState();
    console.log('🔐 Auth Service State:', state);
    return state;
  } else {
    console.log('⚠️  Auth Service not found in window');
    return null;
  }
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running All Authentication Tests...\n');
  
  console.log('1️⃣ Current Auth State:');
  checkAuthState();
  
  console.log('\n2️⃣ Admin Email Tests:');
  testAdminEmailCheck('adm.railmadad@gmail.com');
  testAdminEmailCheck('user@example.com');
  
  console.log('\n3️⃣ Routing Logic Test:');
  testRoutingLogic();
  
  console.log('\n4️⃣ Auth Service Test:');
  testAuthService();
  
  console.log('\n✅ Testing Complete!');
}

// Clear authentication and test fresh login
function clearAuthAndTest() {
  console.log('🧹 Clearing authentication data...');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  
  console.log('🔄 Cleared. Please login as admin and run checkAuthState() again.');
}

// Export functions to window for easy access
window.checkAuthState = checkAuthState;
window.testAdminEmailCheck = testAdminEmailCheck;
window.testRoutingLogic = testRoutingLogic;
window.testAuthService = testAuthService;
window.runAllTests = runAllTests;
window.clearAuthAndTest = clearAuthAndTest;

console.log(`
🎯 Available Test Functions:
  • checkAuthState() - Check current authentication
  • testRoutingLogic() - Test where user should be redirected
  • runAllTests() - Run complete test suite
  • clearAuthAndTest() - Clear auth and test fresh login

📝 Usage:
  1. Open browser console (F12)
  2. Run: runAllTests()
  3. If login is broken, run: clearAuthAndTest()
  4. Login as admin and test again
`);

// Auto-run tests
runAllTests();
