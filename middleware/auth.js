import Jwt from "jsonwebtoken";

export const auth = (request, response, next) => {
  try {
    const token = request.header(`x-auth-token`);
    Jwt.verify(token, process.env.secret_key);
    next();
  } catch (err) {
    response.status(401).send({ error: err.message });
  }
};
