 # Use the official Python base image with version tag
FROM python:3.9-slim
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container
ENV APP_HOME /app

WORKDIR $APP_HOME

# Copy the requirements.txt file to the container
COPY requirements.txt .
# Install OS dependencies for the requriements.txt libraries
# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libopencv-dev \
    libcairo2-dev

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project files to the container
COPY . .

# Expose the port that Django runs on
ENV PORT 8080
CMD gunicorn --bind :$PORT --workers 1 --threads 8 UthereBackend.wsgi:application



# Run the Django development server
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#
