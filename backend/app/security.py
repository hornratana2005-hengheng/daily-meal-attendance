import hashlib
import hmac
import secrets


_PASSWORD_ITERATIONS = 600_000
_DUMMY_SALT = "mealtrack-login-timing"
_DUMMY_PASSWORD_HASH = hashlib.pbkdf2_hmac(
    "sha256",
    b"not-a-real-password",
    _DUMMY_SALT.encode(),
    _PASSWORD_ITERATIONS,
).hex()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt.encode(),
        _PASSWORD_ITERATIONS,
    ).hex()
    return f"pbkdf2_sha256${_PASSWORD_ITERATIONS}${salt}${password_hash}"


def verify_password(password: str, encoded_hash: str | None) -> bool:
    if encoded_hash is None:
        salt = _DUMMY_SALT
        expected_hash = _DUMMY_PASSWORD_HASH
        iterations = _PASSWORD_ITERATIONS
    else:
        try:
            algorithm, raw_iterations, salt, expected_hash = encoded_hash.split("$")
            if algorithm != "pbkdf2_sha256":
                return False
            iterations = int(raw_iterations)
        except (ValueError, TypeError):
            return False

    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt.encode(),
        iterations,
    ).hex()
    return hmac.compare_digest(actual_hash, expected_hash) and encoded_hash is not None


def create_access_token() -> str:
    return secrets.token_urlsafe(32)


def hash_access_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
