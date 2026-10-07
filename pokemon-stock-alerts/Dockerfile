FROM python:3.12-slim

# Build with --build-arg WITH_BROWSER=1 to support `render: true` watches (adds ~400 MB).
ARG WITH_BROWSER=0

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt \
 && if [ "$WITH_BROWSER" = "1" ]; then \
      pip install playwright && playwright install --with-deps chromium; \
    fi

COPY pokealert ./pokealert

# config.yaml is mounted at /app/config.yaml; state lives in /app/data.
VOLUME ["/app/data"]
ENTRYPOINT ["python", "-m", "pokealert", "-c", "/app/config.yaml"]
CMD ["run"]
