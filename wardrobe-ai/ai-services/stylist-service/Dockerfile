FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    STYLIST_MOCK=false \
    MAX_IMAGE_SIZE_MB=10 \
    EMBEDDING_SIZE=512

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
# CPU-only PyTorch avoids ~1GB CUDA wheels and flaky hash checks on transitive deps
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    grep -vE '^(torch|torchvision)' requirements.txt > requirements.no-torch.txt && \
    pip install --no-cache-dir -r requirements.no-torch.txt

# Pre-download MobileNetV2 weights at build time
RUN python -c "from torchvision import models; models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)"

# Pre-download U-2-Net model for rembg background removal
RUN python -c "from rembg import new_session; new_session('u2net')"

COPY app ./app

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
