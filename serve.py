#!/usr/bin/env python3
"""
Simple HTTP server to serve the T4J Calculator locally.
This helps avoid browser security restrictions with local files.

Usage: python serve.py
Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to prevent caching issues
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def serve():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 T4J Calculator server starting...")
        print(f"📱 Open in browser: http://localhost:{PORT}")
        print(f"📄 FAQ page: http://localhost:{PORT}/FAQ.html")
        print(f"🛑 Press Ctrl+C to stop the server")
        
        # Try to open browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n✅ Server stopped.")

if __name__ == "__main__":
    serve()

