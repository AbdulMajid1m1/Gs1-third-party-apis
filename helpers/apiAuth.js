import HttpStatus from 'http-status';
import jwtHelper from '../helpers/jwt_Token.js';

const checkAuthentication = async (req, res, next) => {
  try {
    const token = getToken(req) // function to retrieve the token from header|query|body

    let verifiedToken = await jwtHelper.verifyToken(token); // Check whether JWT token is valid or not 
    // if verify token is valid then save the token in req object
    req.token = verifiedToken;
    return next();

  } catch (error) {
    return res.status(401).json({ // If JWT token is not valid, return error message
      message: 'Invalid Token.',
      https: HttpStatus.UNAUTHORIZED,
    });
  }
  // return next(); // remove this line after uncommenting above code
};

const getToken = (req) => {
  let token = '';
  let authorization = req.headers.authorization || req.headers['authorization'] || req.query.token;

  // Accepts token from browser cookies as well
  if (req.cookies && req.cookies.token) {
    authorization = req.cookies.token;
  }

  // Retrieve token from HTTP-only cookie
  if (!authorization && req.cookies && req.cookies.accessToken) {
    authorization = req.cookies.accessToken;
  }

  if (!authorization) {
    throw new Error('Token is not provided.');
  }

  const parts = authorization.split(' ');
  if (parts.length === 2) {
    if (!(/^Bearer$/i.test(parts[0]))) {
      throw new Error('Token is not properly formatted.');
    }
    token = parts[1];
  }
  else {
    token = authorization;
  }

  return token;
};

export {
  checkAuthentication,
};
