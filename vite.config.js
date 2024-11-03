import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  define: {
    global: {},
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5000', // Replace this with your Socket.IO server URL
        // target: 'https://f0k6j112-5000.inc1.devtunnels.ms', // Replace this with your Socket.IO server URL
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support for Socket.IO
      },
    },
  },
});
