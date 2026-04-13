#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class TheWomenAPITester:
    def __init__(self, base_url="https://her-fusion.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_endpoint(self, name, method, endpoint, expected_status, data=None, headers=None, use_auth=True):
        """Test a single API endpoint"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Use session cookies for authenticated requests
        request_kwargs = {}
        if headers:
            request_kwargs['headers'] = headers
        if not use_auth:
            # Create a new session without cookies for unauthenticated tests
            temp_session = requests.Session()
            session_to_use = temp_session
        else:
            session_to_use = self.session
        
        try:
            if method == 'GET':
                response = session_to_use.get(url, **request_kwargs)
            elif method == 'POST':
                response = session_to_use.post(url, json=data, **request_kwargs)
            elif method == 'PUT':
                response = session_to_use.put(url, json=data, **request_kwargs)
            elif method == 'DELETE':
                response = session_to_use.delete(url, **request_kwargs)
            
            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:100]}"
            
            self.log_test(name, success, details if not success else "")
            return success, response.json() if success and response.content else {}
            
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.test_api_endpoint(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@thewomen.com", "password": "Admin@123"}
        )
        
        if success:
            # Store cookies for subsequent requests
            self.session.cookies.update(self.session.cookies)
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{int(datetime.now().timestamp())}@test.com"
        success, response = self.test_api_endpoint(
            "User Registration",
            "POST", 
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test User",
                "phone": "9876543210"
            }
        )
        return success

    def test_products_endpoints(self):
        """Test product-related endpoints"""
        # Test get all products
        self.test_api_endpoint("Get All Products", "GET", "products", 200)
        
        # Test get featured products
        self.test_api_endpoint("Get Featured Products", "GET", "products/featured/list", 200)
        
        # Test get new arrivals
        self.test_api_endpoint("Get New Arrivals", "GET", "products/new-arrivals/list", 200)
        
        # Test get categories
        self.test_api_endpoint("Get Categories", "GET", "categories", 200)

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token and not self.test_admin_login():
            self.log_test("Admin Endpoints", False, "Admin login failed")
            return
        
        # Test admin dashboard stats
        self.test_api_endpoint("Admin Dashboard Stats", "GET", "admin/dashboard/stats", 200)
        
        # Test admin products
        self.test_api_endpoint("Admin Get Products", "GET", "admin/products", 200)
        
        # Test admin orders
        self.test_api_endpoint("Admin Get Orders", "GET", "admin/orders", 200)
        
        # Test admin coupons
        self.test_api_endpoint("Admin Get Coupons", "GET", "admin/coupons", 200)

    def test_cart_endpoints_without_auth(self):
        """Test cart endpoints without authentication (should fail)"""
        self.test_api_endpoint("Get Cart (No Auth)", "GET", "cart", 401, use_auth=False)
        
        self.test_api_endpoint("Add to Cart (No Auth)", "POST", "cart/add", 401, 
                             data={"product_id": "test", "quantity": 1, "size": "M"}, use_auth=False)

    def test_wishlist_endpoints_without_auth(self):
        """Test wishlist endpoints without authentication (should fail)"""
        self.test_api_endpoint("Get Wishlist (No Auth)", "GET", "wishlist", 401, use_auth=False)

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting The Women E-commerce API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic endpoints
        print("\n📋 Testing Basic Endpoints...")
        self.test_products_endpoints()
        
        # Test authentication
        print("\n🔐 Testing Authentication...")
        self.test_admin_login()
        self.test_user_registration()
        
        # Test protected endpoints without auth
        print("\n🚫 Testing Protected Endpoints (No Auth)...")
        self.test_cart_endpoints_without_auth()
        self.test_wishlist_endpoints_without_auth()
        
        # Test admin endpoints
        print("\n👑 Testing Admin Endpoints...")
        self.test_admin_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = TheWomenAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())