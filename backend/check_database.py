import sqlite3

def check_database():
    conn = sqlite3.connect('bloodbank.db')
    cursor = conn.cursor()
    
    # Total donors
    cursor.execute("SELECT COUNT(*) FROM donors")
    total_donors = cursor.fetchone()[0]
    print(f"📊 Total Donors: {total_donors}")
    
    # Blood group distribution
    cursor.execute("SELECT blood_group, COUNT(*) FROM donors GROUP BY blood_group")
    print("\n🩸 Blood Group Distribution:")
    for bg, count in cursor.fetchall():
        print(f"  {bg}: {count} donors")
    
    # City distribution
    cursor.execute("SELECT city, COUNT(*) FROM donors GROUP BY city")
    print("\n🏙️  City Distribution:")
    for city, count in cursor.fetchall():
        print(f"  {city}: {count} donors")
    
    # Show some sample donors
    cursor.execute("SELECT full_name, blood_group, city FROM donors LIMIT 10")
    print("\n👥 Sample Donors:")
    for name, bg, city in cursor.fetchall():
        print(f"  {name} - {bg} - {city}")
    
    conn.close()

if __name__ == "__main__":
    check_database()