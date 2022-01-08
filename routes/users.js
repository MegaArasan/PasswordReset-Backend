import {
  genpassword,
  getuser,
  createUser,
  alteruser,
  getUser,
  updateUser,
} from "../helperfunction.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get((req, res) => {
  res.send({ Mdg: "Server is up and start running" });
});

router.route("/signup").post(async (request, response) => {
  const { name, email, phoneno, password, confirmpassword } = request.body;
  const userfromDB = await getuser(email);
  // console.log(userfromDB);
  if (userfromDB) {
    response.status(401).send({ message: "email already exists" });
    return;
  }
  const hashedpassword = await genpassword(password);
  const user = await createUser({
    name,
    email,
    phoneno,
    password: hashedpassword,
    confirmpassword: hashedpassword,
  });
  response.status(200).send({ Msg: "user created successfully" });
});

router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;
  const userfromDB = await getuser(email);
  // console.log(userfromDB);
  if (!userfromDB) {
    response.send({ message: "Invalid Credentials" });
    return;
  }
  const storedpassword = userfromDB.password;
  // console.log(storedpassword);
  const ispasswordmatch = await bcrypt.compare(password, storedpassword);
  // console.log(ispasswordmatch);
  if (ispasswordmatch) {
    const token = Jwt.sign({ id: userfromDB._id }, process.env.secret_key);
    res.status(200).send({ Msg: "successful login", token: token });
  } else {
    res.status(401).send({ Msg: "Invalid Credentials" });
  }
});

router.route("/forgotpassword").post(async (req, res) => {
  const { email } = req.body;
  const userfromDB = await getuser(email);
  if (!userfromDB) {
    // console.error("Mail not registered");
    res.status(403).send({ Msg: "Mail is not registered" });
  }
  const token = Jwt.sign({ id: userfromDB._id }, process.env.secret_key);
  const update = await alteruser({ email, token });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.my_gmail}`,
      pass: `${process.env.my_pass}`,
    },
  });

  const link = `http://localhost:3000/forgotpassword/verify/${token}`;
  const mailoptions = {
    from: "userbase@gmail.com",
    to: email,
    subject: "Link to reset password",
    html: `<p>Please click on the following link or paste this in your browser to complete the process of reset password</p>
      <a href=${link} target=_blank>Click to reset password</a>`,
  };

  transporter.sendMail(mailoptions, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent: " + res.response);
    }
  });
  res.send({ Msg: "recovery mail sent" });
});

router.route("/forgotpassword/verify").get(auth, async (req, res) => {
  return res.status(200).send({ Message: "token matched" });
});

router.route("/resetpassword").post(async (req, res) => {
  const { password, confirmpassword, token } = req.body;
  // console.log(token);
  const data = await getUser({ confirmpassword: token });
  // console.log(data);
  // the data is not there in the DB return an error msg
  if (!data) {
    return res.status(401).send({ Message: "Invalid credentials" });
  }
  const { email } = data;
  // console.log(email);

  const hashedpassword = await genpassword(password);
  const user = await updateUser({
    email: email,
    password: hashedpassword,
    confirmpassword: confirmpassword,
  });
  const result = await getuser({ email });
  res.send(user);
});

export const userRouter = router;
