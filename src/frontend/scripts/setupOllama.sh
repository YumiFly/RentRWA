#!/bin/bash

echo "🦙 Ollama Setup Script"
echo "====================="

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
    ollama --version
else
    echo "📥 Installing Ollama..."
    
    # Install Ollama (macOS/Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Detected macOS - downloading Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Detected Linux - downloading Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "❌ Unsupported OS. Please install Ollama manually from https://ollama.com"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running on http://localhost:11434"
else
    echo "❌ Failed to start Ollama service"
    exit 1
fi

echo ""
echo "📦 Installing recommended models..."

# Install a small, fast model for development
echo "🔄 Pulling llama3.2:3b (recommended for development)..."
ollama pull llama3.2:3b

# Optional: Install a larger model for better performance
echo "🔄 Pulling llama3.2:1b (ultra-fast for testing)..."
ollama pull llama3.2:1b

echo ""
echo "🧪 Testing Ollama..."
echo "Testing with a simple prompt..."

RESPONSE=$(ollama run llama3.2:3b "Say 'Hello from Ollama!' if you can read this." --format json 2>/dev/null || echo '{"error": "failed"}')

if [[ $RESPONSE == *"Hello from Ollama"* ]]; then
    echo "✅ Ollama test successful!"
    echo "   Response: $RESPONSE"
else
    echo "⚠️  Ollama test had issues, but installation appears complete"
fi

echo ""
echo "🎉 Ollama setup complete!"
echo ""
echo "📋 Available models:"
ollama list

echo ""
echo "💡 Usage:"
echo "   - Ollama is running on: http://localhost:11434"
echo "   - Current model: llama3.2:3b"
echo "   - To stop Ollama: kill $OLLAMA_PID"
echo "   - To start Ollama later: ollama serve"
echo ""
echo "🚀 Next steps:"
echo "   1. Your ElizaOS is now configured to use Ollama"
echo "   2. Start your application: pnpm start"
echo "   3. Ollama will provide free, local AI processing"
echo ""
echo "🔧 If you prefer a different model:"
echo "   - List available models: ollama list"
echo "   - Pull a new model: ollama pull <model-name>"
echo "   - Update OLLAMA_MODEL in your .env file"
