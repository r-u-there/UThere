# UThere application first initialization

A brief guide for running the project.


## To know your existing pip installer version , Use the below command

```shell
py -m pip --version
```

## To Upgrade pip installer

```shell
python -m pip install --upgrade pip
```

## 1.To create virtual environment

```shell
py -m venv <environment name>
```

## 2. We need to activate the created virtual environment

```shell
.\<environment name>\Scripts\activate
```

## 3. To install django:

```shell
py -m pip install django
```

## 4. Install requirments

```shell
pip install requirements.txt
```

### PS: In case you get an error skip this step, proceed to step 5 and install it yourself if there is any missing library Example:
```shell
pip install django-crispy-forms
```
## 5. Run application

```shell
python manage.py runserver
```

# You might get a migration error while running the runserver command if there is any unmigrated changes in models, in this case:
## 1.

```shell
python manage.py makemigrations
```

## 2. 

```shell
python manage.py migrate
```

## 3. 

```shell
python manage.py runserver
```




