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
EXPOSE 8080
CMD python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8080



# Run the Django development server
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#