FROM python:3.10.13-slim-bookworm

RUN apt-get update && apt-get install --yes make bash-completion

WORKDIR /app/dev/

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

STOPSIGNAL SIGKILL
CMD sleep infinity
