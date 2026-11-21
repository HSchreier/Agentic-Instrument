FROM python:3.10-slim

WORKDIR /app

# Install MIDI-related system packages
RUN apt-get update && apt-get install -y \
    libasound2-dev \
    alsa-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY rhythm_wolf/ ./rhythm_wolf/
COPY cli.py .

# Make CLI executable
RUN chmod +x cli.py

ENTRYPOINT ["python", "cli.py"]
CMD ["--help"]
