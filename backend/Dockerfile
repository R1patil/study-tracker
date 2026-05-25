FROM python:3.11-slim
WORKDIR /app

# Install curl and ca-certificates to download the Coral CLI binary
RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install native Coral CLI and make it globally executable
RUN curl -fsSL https://withcoral.com/install.sh | sh && \
    cp /root/.local/bin/coral /app/coral && \
    chmod 755 /app/coral

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]