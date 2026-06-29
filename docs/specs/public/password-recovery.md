# Password Recovery
role: public
url: /passwordrecovery

- Guest can view the password recovery form — email input and submit button visible
- Guest can request a password recovery email with a registered email — success message shown
- Guest cannot request recovery with an email not registered in the system — error message shown
- Guest cannot submit the recovery form with an empty email field — validation error shown
- Guest cannot submit with an invalid email format — validation error shown
- Guest can navigate back to the login page from the recovery form — login page loads
