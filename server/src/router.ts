import express from "express";
const router = express.Router();
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import authAction from "./modules/auth/authAction";
import commentActions from "./modules/comment/commentActions";
import requestActions from "./modules/request/requestActions";
import uploads from "./modules/users/uploadsAction";
import userActions from "./modules/users/userAction";

const uploadDir = path.join(__dirname, "../../server/public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
router.use(
  "/uploads",
  express.static(uploadDir),
);
router.post("/upload-avatar/:id", upload.single("avatar"), uploads.addAvatar);

router.post("/api/login", authAction.login);
router.get("/api/me", authAction.me);
router.post("/api/logout", authAction.logout);

router.get("/api/users", userActions.browse);
router.get("/api/users/:id", userActions.read);
router.post("/api/users", authAction.hashPassword, userActions.add);
router.put("/api/users/:id", userActions.edit);
router.delete("/api/users/:id", userActions.destroy);

router.get("/api/comments/request/:request_id", commentActions.browse);
router.get("/api/comments/:id", commentActions.read);
router.post("/api/comments", commentActions.add);
router.put("/api/comments/:id", commentActions.edit);
router.delete("/api/comments/:id", commentActions.destroy);

router.get("/api/request", requestActions.browse);
router.get("/api/request/:id", requestActions.read);
router.post("/api/request", requestActions.add);

router.get(
  "/api/request/:id/isPoster",
  authAction.verifyToken,
  requestActions.isPoster,
  (req, res) => {
    // Si on atteint cette partie, c'est que l'utilisateur est bien le propriétaire.
    res.status(200).json({ message: "You are the owner of this request" });
  },
);

router.put(
  "/api/request/:id",
  authAction.verifyToken, // Vérifie que l’utilisateur est connecté
  requestActions.isPoster, // Vérifie qu’il est bien l’auteur de la Request
  requestActions.edit, // Si tout est OK, on exécute la mise à jour
);

router.delete(
  "/api/request/:id",
  authAction.verifyToken,
  requestActions.isPoster,
  requestActions.destroy,
);

/* ************************************************************************* */
export default router;
