from passlib.context import CryptContext
from datetime import timedelta , datetime
from jose import jwt


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hasHPassword(password:str) -> str :
    return pwd_context\
        .hash(password)


def verifyPassword(password : str , hashed : str) -> str :
    return pwd_context\
        .verify(password , hashed)


def accessToken(data : dict , exp_delta : timedelta | None = None):
    encode = data.copy()
    expiretime = datetime.utcnow() + (exp_delta or timedelta(minutes=30))
    encode.update({"exp":expiretime})
    print({"encode":encode})
    return jwt.encode(encode, "super-secret-key", algorithm="HS256")



def decodeToken(token : str):
    return jwt.decode(token, "super-secret-key" , algorithms="HS256")

