FROM ollama/ollama:latest
ENV OLLAMA_HOST=0.0.0.0:8080
ENV OLLAMA_KEEP_ALIVE=-1
ENV OLLAMA_NUM_PARALLEL=2
RUN ollama serve & sleep 5 && ollama pull gemma4:e2b
ENTRYPOINT ["ollama", "serve"]
