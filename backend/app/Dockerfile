FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps (if needed later)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency file first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Expose backend port
EXPOSE 5000

# Run backend
CMD ["python", "app.py"]
