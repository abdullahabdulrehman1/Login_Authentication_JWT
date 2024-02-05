import express from "express";
import { Router } from "express";

import { isAdmin, requireSignin } from "../middelwares/authMiddleware.js";
import {
  createCategoryController,
  updateCategoryController,
  getSingleCategoryController,
  getAllCategoryController,
  deleteCategoryController
} from "../controller/categoryController.js";
const router = express.Router();
router.post(
  "/create-category",
  requireSignin,
  isAdmin,
  createCategoryController
);
//update category
router.put(
  "/update-category",
  requireSignin,
  isAdmin,
  updateCategoryController
);
router.get("/getcategory", requireSignin, isAdmin, getAllCategoryController);
router.get(
  "/getsinglecategory",
  requireSignin,
  isAdmin,
  getSingleCategoryController
);
router.delete(
  "/deletecategory",
  requireSignin,
  isAdmin,
  deleteCategoryController
);
export default router;