
import yagmail

def send_email(subject,text):
    user = 'info.uthere@gmail.com'
    app_password = 'xopbvvadizfkfyxt' # a token for gmail
    to = 'info.uthere@gmail.com'
    content = [text]

    with yagmail.SMTP(user, app_password) as yag:
        yag.send(to, subject, content)
        print('Sent email successfully')