const express = require("express");
const students = require("../models/StudentData");
const Student = require("../models/studentsModel");

const studentsRouter = express.Router();

const isValidStudent = (studentobject) => {
  // validation as task
  return true;
};

const getAllStudents = async () => {
  const result = await Student.findAll();
  // TODO: Find a better way to get plain json
  return JSON.parse(JSON.stringify(result));
};

const getStudentById = async (id) => {
  const result = await Student.findByPk(id);
  // TODO: Find a better way to get plain json
  return JSON.parse(JSON.stringify(result));
};

studentsRouter
  .get("/", async (req, res) => {
    try {
      res.status(200).json({
        data: await getAllStudents()
      });
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal Server error");
    }
  })
  .post("/", async (req, res) => {
    try {
      if (req.body.firstName) {
        const result = await Student.create(req.body);
        res.status(200).json({
          message: "Student added Successfully",
          data: result.get()
        });
      } else {
        res.status(400).send("Invalid student");
      }
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  })
  .put("/", (req, res) => {
    /** Task */
  })

  /**
   * Individual student resource
   */

  .get("/:id", async (req, res) => {
    const { id } = req.params;
    const requiredStudent = await getStudentById(parseInt(id));
    if (requiredStudent) {
      res.status(200).json({ data: requiredStudent });
    } else {
      res.status(400).send("Student unavailable");
    }
  })
  .put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Student.update(req.body, {
        where: {
          id
        }
      });
      if (result.length) {
        res.status(200).json({ message: "Student Updated!" });
      } else {
        res.status(400).send("Student unavailable");
      }
    } catch (e) {
      console.error(e);
      res.status(500).send("Internal Server Error");
    }
  })
  .delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validStudent = await Student.findByPk(id);
      if (validStudent) {
        await validStudent.destroy();
        res.status(200).json({
          message: "Student has been deleted"
        });
      } else {
        res.status(400).send("Invalid Student");
      }
    } catch (e) {
      console.error(e);
      res.status(500).send("Internal Server Error");
    }
  });

module.exports = {
  studentsRouter,
  getAllStudents,
  getStudentById
};
