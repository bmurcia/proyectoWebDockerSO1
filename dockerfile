FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    gcc g++ curl gnupg2 unixodbc-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql17 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5000
CMD ["python", "app.py"]