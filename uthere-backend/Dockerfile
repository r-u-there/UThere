 # Use the official Python base image with version tag
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the Django project files to the container
COPY UthereBackend .

# Expose the port that Django runs on
ENV PORT 8080
CMD gunicorn --bind :$PORT --workers 1 --threads 8 --preload unicodex.wsgi:application



# Run the Django development server
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#