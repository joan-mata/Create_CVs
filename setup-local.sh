#!/bin/bash

# Generador de configuración para despliegue local
echo "🚀 Configurando el entorno de CV Editor para despliegue local..."

# 1. Verificar dependencias
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado."
    exit 1
fi

# 2. Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📄 Creando archivo .env a partir de .env.example..."
    cp .env.example .env
    echo "⚠️ Por favor, revisa el archivo .env y ajusta las variables si es necesario (especialmente OLLAMA_BASE_URL)."
else
    echo "✅ El archivo .env ya existe."
fi

# 3. Levantar contenedores
echo "🐳 Levantando contenedores con Docker Compose..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

echo ""
echo "✨ ¡Instalación completada!"
echo "🌐 La aplicación estará disponible en: http://localhost:8082"
echo "🛠️  Backend API disponible en: http://localhost:8082/api"
echo "ℹ️  Asegúrate de que Ollama esté corriendo en tu máquina host si usas 'host.docker.internal'."
