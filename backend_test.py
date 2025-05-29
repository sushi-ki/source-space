
import requests
import sys
import time
import uuid
from datetime import datetime

class SourceSpaceAPITester:
    def __init__(self, base_url="https://356ec4b6-c905-4def-9c35-c1dd41048417.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.test_results = {}

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result = response.json()
                    print(f"Response: {result}")
                    self.test_results[name] = {"success": True, "data": result}
                    return success, result
                except:
                    print(f"Response: {response.text}")
                    self.test_results[name] = {"success": True, "data": response.text}
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                self.test_results[name] = {"success": False, "error": f"Expected {expected_status}, got {response.status_code}"}
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results[name] = {"success": False, "error": str(e)}
            return False, {}

    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "/health",
            200
        )

    def test_create_user(self, source="novaverse"):
        """Test user creation"""
        test_name = f"test_user_{uuid.uuid4().hex[:8]}"
        success, response = self.run_test(
            "Create User",
            "POST",
            "/users",
            200,
            data={"source": source, "name": test_name}
        )
        if success and "user_id" in response:
            self.user_id = response["user_id"]
            print(f"Created test user with ID: {self.user_id}")
        return success

    def test_get_user(self):
        """Test getting user profile"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Get User Profile",
            "GET",
            f"/users/{self.user_id}",
            200
        )

    def test_create_journal_entry(self):
        """Test creating a journal entry"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Create Journal Entry",
            "POST",
            "/journal",
            200,
            data={
                "user_id": self.user_id,
                "title": "Test Journal Entry",
                "content": "This is a test journal entry for SourceSpace testing.",
                "mood": 7
            }
        )

    def test_get_journal_entries(self):
        """Test getting journal entries"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Get Journal Entries",
            "GET",
            f"/journal/{self.user_id}",
            200
        )

    def test_create_habit(self):
        """Test creating a habit entry"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Create Habit Entry",
            "POST",
            "/habits",
            200,
            data={
                "user_id": self.user_id,
                "habit_name": "Test Habit",
                "completed": True
            }
        )

    def test_get_habits(self):
        """Test getting habits"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Get Habits",
            "GET",
            f"/habits/{self.user_id}",
            200
        )

    def test_generate_insight(self, insight_type="story"):
        """Test generating AI insight"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            f"Generate AI Insight ({insight_type})",
            "POST",
            "/insights/generate",
            200,
            data={
                "user_id": self.user_id,
                "type": insight_type
            }
        )

    def test_get_insights(self):
        """Test getting insights"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Get Insights",
            "GET",
            f"/insights/{self.user_id}",
            200
        )

    def test_get_dashboard(self):
        """Test getting dashboard data"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False
        
        return self.run_test(
            "Get Dashboard Data",
            "GET",
            f"/dashboard/{self.user_id}",
            200
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting SourceSpace API Tests")
        print(f"Backend URL: {self.base_url}")
        
        # Basic connectivity test
        self.test_health_check()
        
        # User tests
        self.test_create_user()
        if self.user_id:
            self.test_get_user()
            
            # Journal tests
            self.test_create_journal_entry()
            self.test_get_journal_entries()
            
            # Habit tests
            self.test_create_habit()
            self.test_get_habits()
            
            # Dashboard test
            self.test_get_dashboard()
            
            # AI Insight tests
            self.test_generate_insight("story")
            self.test_generate_insight("analysis")
            self.test_get_insights()
        
        # Print results
        print("\n📊 Test Results Summary:")
        print(f"Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        for name, result in self.test_results.items():
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{status} - {name}")
            if not result["success"] and "error" in result:
                print(f"    Error: {result['error']}")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    # Get backend URL from environment or use default
    backend_url = "https://356ec4b6-c905-4def-9c35-c1dd41048417.preview.emergentagent.com"
    
    # Run tests
    tester = SourceSpaceAPITester(backend_url)
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)
