from config.database import engine

try:
    conn = engine.connect()
    print("✅ Successfully connected to MySQL!")
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)
