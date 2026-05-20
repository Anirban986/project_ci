# database.py
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import pool
from config import settings

# Connection pool — reuses connections instead of opening a new one per request
_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=settings.DATABASE_URL,
    cursor_factory=RealDictCursor,
)


def get_connection():
    """Borrow a connection from the pool."""
    return _pool.getconn()


def release_connection(conn):
    """Return a connection back to the pool."""
    _pool.putconn(conn)


def execute(query: str, params: tuple = ()):
    """
    Run a query that does not return rows (INSERT, UPDATE, DELETE).
    Commits automatically.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        release_connection(conn)


def fetch_one(query: str, params: tuple = ()):
    """Run a SELECT and return a single row as a dict, or None."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()
    finally:
        release_connection(conn)


def fetch_all(query: str, params: tuple = ()):
    """Run a SELECT and return all rows as a list of dicts."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()
    finally:
        release_connection(conn)