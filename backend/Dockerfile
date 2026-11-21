FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for MIDI
RUN apt-get update && apt-get install -y \
    libasound2-dev \
    alsa-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt /app/backend/

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy Python modules (rhythm_wolf package)
COPY rhythm_wolf /app/rhythm_wolf/

# Copy backend code
COPY backend /app/backend/

# Expose API port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
