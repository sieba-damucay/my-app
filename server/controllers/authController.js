import db from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



const SECRET_KEY = "secret123";

const login = (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email=?", [email], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length === 0)
        return res.status(401).json({ error: "User not found" });

        const user = rows[0];
        if (!bcrypt.compareSync(password, user.password_hash))
        return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.user_id, role: user.role }, SECRET_KEY, {
        expiresIn: "1h",
        });
        res.json({ message: "Login success", token, user });
    });
};

export default { login };
