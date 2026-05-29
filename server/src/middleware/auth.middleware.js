import jwt, { decode } from 'jsonwebtoken'
import userModel from '../models/user.model.js';

// export const protectRoutes = async (req, res, next) => {
//     try {
//         console.log("COOKIES:", req.cookies); // DEBUG
//         const token  = req.cookies.token;
//         if(!token){
//             return res.json({
//                 success:false,
//                 message:"Not Authorized"
//             })
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         console.log("DECODED TOKEN:", decoded);
//         const user = await userModel.findById(decoded.userId).select("-password")
//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Not Authorized"
//             })
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         console.log(error.message);
//         return res.status(409).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
export const protectRoutes = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await userModel
            .findById(decoded.userId)
            .select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("AUTH ERROR:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};