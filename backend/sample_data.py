import sqlite3
import random

def add_sample_donors():
    # Connect to existing SQLite database
    conn = sqlite3.connect('bloodbank.db')
    cursor = conn.cursor()
    
    # Indian Names Data
    first_names_male = [
        'Aman', 'Rahul', 'Raj', 'Sanjay', 'Vikram', 'Arun', 'Suresh', 'Rohit', 'Amit', 'Vivek',
        'Ravi', 'Manoj', 'Deepak', 'Sunil', 'Ankit', 'Pankaj', 'Nitin', 'Ramesh', 'Sandeep', 'Alok',
        'Vijay', 'Rajesh', 'Dinesh', 'Mohan', 'Karan', 'Rajan', 'Sachin', 'Gaurav', 'Abhishek', 'Prashant'
    ]
    
    first_names_female = [
        'Priya', 'Neha', 'Anita', 'Pooja', 'Sneha', 'Kavita', 'Sunita', 'Ritu', 'Meera', 'Anjali',
        'Rani', 'Sonia', 'Poonam', 'Madhu', 'Kiran', 'Sarita', 'Nisha', 'Swati', 'Jyoti', 'Shweta',
        'Monika', 'Divya', 'Rashmi', 'Shilpa', 'Preeti', 'Annu', 'Babita', 'Chanda', 'Deepa', 'Geeta'
    ]
    
    last_names = [
        'Kumar', 'Sharma', 'Verma', 'Singh', 'Yadav', 'Gupta', 'Jha', 'Roy', 'Das', 'Mishra',
        'Pandey', 'Tiwari', 'Patel', 'Shah', 'Reddy', 'Mehta', 'Choudhary', 'Malhotra', 'Saxena', 'Aggarwal'
    ]
    
    # Bihar Cities (125 donors)
    bihar_cities = [
        'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai', 
        'Katihar', 'Munger', 'Chapra', 'Sasaram', 'Hajipur', 'Siwan', 'Motihari', 'Nawada', 'Bagaha',
        'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad', 'Lakhisarai',
        'Madhubani', 'Samastipur', 'Vaishali', 'Bhabua', 'Supaul', 'Madhepura'
    ]
    
    # Uttar Pradesh Cities (125 donors)
    up_cities = [
        'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Allahabad', 'Ghaziabad', 'Aligarh',
        'Moradabad', 'Saharanpur', 'Gorakhpur', 'Faizabad', 'Bareilly', 'Mathura', 'Shahjahanpur',
        'Firozabad', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Rampur',
        'Jaunpur', 'Bahraich', 'Muzaffarnagar', 'Banda', 'Sitapur', 'Lalitpur', 'Unnao'
    ]
    
    # Punjab Cities (100 donors)
    punjab_cities = [
        'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Moga', 'Firozpur',
        'Sangrur', 'Barnala', 'Faridkot', 'Fatehgarh', 'Muktsar', 'Gurdaspur', 'Kapurthala', 'Tarn Taran',
        'Mohali', 'Rupnagar', 'Ajitgarh', 'Malerkotla', 'Khanna', 'Phagwara', 'Abohar', 'Batala'
    ]
    
    # Delhi Areas (100 donors)
    delhi_areas = [
        'Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini', 'Pitampura', 'Janakpuri', 'Laxmi Nagar',
        'Rajouri Garden', 'Saket', 'Hauz Khas', 'Malviya Nagar', 'Vasant Kunj', 'Shalimar Bagh',
        'Model Town', 'Kirti Nagar', 'Patel Nagar', 'Shahdara', 'Mayur Vihar', 'Preet Vihar',
        'Sarita Vihar', 'Safdarjung', 'Chanakyapuri', 'Civil Lines', 'Kashmere Gate'
    ]
    
    # Other States Cities (50 donors)
    other_states_cities = {
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman'],
        'Karnataka': ['Bengaluru', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'],
        'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
        'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
        'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Malappuram']
    }
    
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    
    donors_created = 0
    
    print("🚀 Adding 500 donors to database...")
    print("📊 Distribution: 450 (Bihar/UP/Delhi/Punjab) + 50 (Other States)")
    print("=" * 60)
    
    # 450 donors for Bihar, UP, Delhi, Punjab
    for i in range(450):
        if i < 125:  # Bihar - 125 donors
            state = 'Bihar'
            city = random.choice(bihar_cities)
        elif i < 250:  # UP - 125 donors
            state = 'Uttar Pradesh' 
            city = random.choice(up_cities)
        elif i < 350:  # Punjab - 100 donors
            state = 'Punjab'
            city = random.choice(punjab_cities)
        else:  # Delhi - 100 donors
            state = 'Delhi'
            city = random.choice(delhi_areas)
        
        # Generate donor data
        gender = random.choice(['Male', 'Female'])
        if gender == 'Male':
            first_name = random.choice(first_names_male)
        else:
            first_name = random.choice(first_names_female)
        
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}{i+1000}@lifestream.org"
        mobile = f"+91 {random.randint(7000000000, 9999999999)}"
        age = random.randint(18, 65)
        blood_group = random.choice(blood_groups)
        address = f"{random.randint(1, 999)}, {city}, {state}"
        
        try:
            # Create user
            cursor.execute('''
                INSERT INTO users (email, password, full_name, user_type)
                VALUES (?, ?, ?, ?)
            ''', (email, 'Password123', full_name, 'user'))
            
            user_id = cursor.lastrowid
            
            # Create donor
            cursor.execute('''
                INSERT INTO donors (user_id, full_name, age, gender, mobile, email, address, city, state, blood_group)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, full_name, age, gender, mobile, email, address, city, state, blood_group))
            
            donors_created += 1
            
            # Progress show karein
            if (i + 1) % 50 == 0:
                print(f"✅ Added {i + 1}/450 donors from Bihar/UP/Delhi/Punjab...")
                
        except sqlite3.IntegrityError:
            continue
        except Exception as e:
            print(f"❌ Error at donor {i + 1}: {e}")
            continue
    
    # 50 donors for other states
    for i in range(50):
        # Random state select karein
        state = random.choice(list(other_states_cities.keys()))
        city = random.choice(other_states_cities[state])
        
        # Generate donor data
        gender = random.choice(['Male', 'Female'])
        if gender == 'Male':
            first_name = random.choice(first_names_male)
        else:
            first_name = random.choice(first_names_female)
        
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}{i+1500}@lifestream.org"
        mobile = f"+91 {random.randint(7000000000, 9999999999)}"
        age = random.randint(18, 65)
        blood_group = random.choice(blood_groups)
        address = f"{random.randint(1, 999)}, {city}, {state}"
        
        try:
            # Create user
            cursor.execute('''
                INSERT INTO users (email, password, full_name, user_type)
                VALUES (?, ?, ?, ?)
            ''', (email, 'Password123', full_name, 'user'))
            
            user_id = cursor.lastrowid
            
            # Create donor
            cursor.execute('''
                INSERT INTO donors (user_id, full_name, age, gender, mobile, email, address, city, state, blood_group)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, full_name, age, gender, mobile, email, address, city, state, blood_group))
            
            donors_created += 1
            
            if (i + 1) % 10 == 0:
                print(f"✅ Added {i + 1}/50 donors from other states...")
                
        except sqlite3.IntegrityError:
            continue
        except Exception as e:
            print(f"❌ Error at donor {i + 1}: {e}")
            continue
    
    conn.commit()
    
    # Final statistics
    print("\n" + "=" * 60)
    print("📊 FINAL DATABASE STATISTICS:")
    print("=" * 60)
    
    # Total donors
    cursor.execute("SELECT COUNT(*) FROM donors")
    total_donors = cursor.fetchone()[0]
    print(f"🎯 Total Donors in Database: {total_donors}")
    
    # State-wise distribution
    cursor.execute("SELECT state, COUNT(*) FROM donors GROUP BY state ORDER BY COUNT(*) DESC")
    print("\n🏛️  State-wise Distribution:")
    for state, count in cursor.fetchall():
        print(f"  {state}: {count} donors")
    
    # Blood group distribution
    cursor.execute("SELECT blood_group, COUNT(*) FROM donors GROUP BY blood_group")
    print("\n🩸 Blood Group Distribution:")
    for bg, count in cursor.fetchall():
        print(f"  {bg}: {count} donors")
    
    # City samples from main states
    print("\n🏙️  Sample Cities from Main States:")
    main_states = ['Bihar', 'Uttar Pradesh', 'Punjab', 'Delhi']
    for state in main_states:
        cursor.execute("SELECT DISTINCT city FROM donors WHERE state = ? LIMIT 3", (state,))
        cities = [row[0] for row in cursor.fetchall()]
        print(f"  {state}: {', '.join(cities)}")
    
    conn.close()
    
    print(f"\n🎉 SUCCESSFULLY ADDED {donors_created} NEW DONORS!")
    print("💡 You can now search for donors on the search page!")

if __name__ == "__main__":
    print("🚀 Adding sample donors to existing SQLite database...")
    add_sample_donors()