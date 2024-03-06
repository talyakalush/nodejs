import express from "express";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const router = express.Router();

async function getUserData(access_token) {
  const response = await fetch(
    ` https://googleapis.com/oauth2/v3/userinfo?access_token${access_token}`
  );
  const data = await response.json();
}

router.get("/", async function (req, res, next) {
  const code = req.query.code;

  try {
    const redirectUrl = " http://localhost:3031/oauth";
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );
    const res = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(res.tokens);

    const user = oAuth2Client.credntials;

    await getUserData(user.access_token);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
