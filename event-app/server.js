require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3047;

app.listen(PORT, () => {
  console.log(`✅ Backend demarre sur le port ${PORT}`);
});
