import bcrypt from "bcrypt";
import { client } from "./index.js";

async function genpassword(password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashpassword = await bcrypt.hash(password, salt);
  //   console.log(hashpassword);
  return hashpassword;
}

async function getuser(email) {
  return client.db("resetpassword").collection("users").findOne({ email });
}

async function alteruser({ email, token }) {
  return client
    .db("resetpassword")
    .collection("users")
    .updateOne({ email }, { $set: { confirmpassword: token } });
}

async function getUser({ confirmpassword: token }) {
  return client
    .db("resetpassword")
    .collection("users")
    .findOne({ confirmpassword: token });
}

async function createUser(data) {
  return await client.db("resetpassword").collection("users").insertOne(data);
}

async function updateUser({
  email: email,
  password: hashedpassword,
  confirmpassword: confirmpassword,
}) {
  return await client
    .db("resetpassword")
    .collection("users")
    .updateOne(
      { email: email },
      { $set: { password: hashedpassword, confirmpassword: confirmpassword } }
    );
}

export { genpassword, getuser, createUser, alteruser, getUser, updateUser };
