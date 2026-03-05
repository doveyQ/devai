import sqlite3
import logging
import os

logger = logging.getLogger(__name__)

_DB_PATH = os.path.join(os.path.dirname(__file__), "git.db")

class GitDB:
    def __init__(self):
        self.conn = sqlite3.connect(_DB_PATH)
        self.cursor = self.conn.cursor()

    def close(self):
        self.conn.close()

    def execute(self, query, params=()):
        self.cursor.execute(query, params)
        self.conn.commit()
        return self.cursor

    def fetchall(self, query, params=()):
        self.cursor.execute(query, params)
        return self.cursor.fetchall()

    def fetchone(self, query, params=()):
        self.cursor.execute(query, params)
        return self.cursor.fetchone()

    def create_tables(self):
        self.execute("""
            CREATE TABLE IF NOT EXISTS issues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number INTEGER NOT NULL,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                state TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                closed_at TEXT NOT NULL,
                labels TEXT NOT NULL,
                assignee TEXT NOT NULL,
                author TEXT NOT NULL,
                url TEXT NOT NULL,
                comments INTEGER NOT NULL,
            ),
            CREATE TABLE IF NOT EXISTS pull_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number INTEGER NOT NULL,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                state TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                closed_at TEXT NOT NULL,
                labels TEXT NOT NULL,
                assignee TEXT NOT NULL,
                author TEXT NOT NULL,
                url TEXT NOT NULL,
                comments INTEGER NOT NULL,
            ),
            CREATE TABLE IF NOT EXISTS commits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sha TEXT NOT NULL,
                message TEXT NOT NULL,
                author TEXT NOT NULL,
                date TEXT NOT NULL
            ),
            CREATE TABLE IF NOT EXISTS audit_log (
                timestamp TEXT NOT NULL,
                tool_called TEXT NOT NULL,
                tokens_used INTEGER NOT NULL,
                response TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)