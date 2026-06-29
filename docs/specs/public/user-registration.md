# User Registration
role: public
url: /register

- Guest can register with a valid email and password — account created, redirected to home page
- Guest can register with an already used email — error message shown, registration blocked
- Guest can register with a mismatched password confirmation — validation error shown inline
- Guest can register with a missing required field — validation error shown on that field
- Registered user can log in with correct credentials — redirected to home page, username shown in header
- Registered user can log in with wrong password — error message shown, stays on login page
- Logged-in user can log out — session cleared, header shows login link
