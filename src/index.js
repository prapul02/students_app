const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
})
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {
  studentsRouter,
  getAllStudents,
  getStudentById
} = require("./routes/studentsRouter");
const adminRouter = require("./routes/adminRouter");
const ifEquality = require("./views/helpers/ifEquality");
const expressHbs = require("express-handlebars");

const auth = require("./middleware/auth");
const passiveAuth = require("./middleware/passiveAuth");

const app = express();

// Creating handlebars engine
const hbs = expressHbs.create({
  extname: ".hbs",
  layoutsDir: path.join(__dirname, "./views/layouts"),
  partialsDir: path.join(__dirname, "./views/partials"),
  helpers: {
    ifEquality
  }
});

// Let express know to use handlebars
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "./views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", passiveAuth, (request, response) => {
  response.status(200).render("home", {
    layout: "hero",
    title: "Home",
    isAdmin: request.jwt ? request.jwt.sub === "admin" : false
  });
});

app.get("/students", auth, async (req, res) => {
  try {
    res.status(200).render("students", {
      layout: "navigation",
      title: "Student Details",
      data: await getAllStudents()
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server error");
  }
});

app.get("/add-student", auth, (req, res) => {
  res.status(200).render("addStudents", {
    layout: "navigation",
    title: "Add Student",
    action: "/api/students",
    method: "POST"
  });
});

app.get("/edit-student/:id", auth, async (req, res) => {
  const { id } = req.params;
  const requiredStudent = await getStudentById(parseInt(id));
  if (requiredStudent) {
    res.status(200).render("addStudents.hbs", {
      layout: "navigation",
      title: "Add Student",
      student: requiredStudent,
      action: "/api/students/" + requiredStudent.id,
      method: "PUT"
    });
  } else {
    res.status(404).send("Student not found");
  }
});

app.get("/teachers", (req, res) => {
  res.send("WIP");
});

app.get("/about", (request, response) => {
  response.status(200).render("home.hbs", {
    message: "About this page"
  });
});

app.get("/adminLogin", (request, response) => {
  response.status(200).render("adminLogin.hbs", {
    layout: "login",
    title: "Admin",
    submitTarget: "/api/admin/login",
    submitMethod: "POST",
    formTitle: "Admin Login"
  });
});

app.use("/api/students", studentsRouter);

app.use("/api/admin", adminRouter);

app.get("/about", (req, res) => {
  res.status(200).send("About page");
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

app.get("*", (req, res) => {
  res.status(404).send("404 Page not found");
});

app.listen(8080, () => {
  console.log("server running");
});
