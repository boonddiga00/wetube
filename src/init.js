import "regenerator-runtime";
import "dotenv/config"
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = "3000";

const handleListening = () => console.log("Sever is Listening on https://wetube-clone-yjkax.run.goorm.io/");
app.listen(PORT, handleListening);