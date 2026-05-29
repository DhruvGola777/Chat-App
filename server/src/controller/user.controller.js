import { generateToken } from '../config/utils.js';
import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

export async function signup(req, res) {
    console.log(req.body)
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "Missing details" })
        }
        const isUserAlreadyExits = await userModel.findOne({ email })
        if (isUserAlreadyExits) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        })

        const token = generateToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        const safeUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            bio: user.bio,
            profilePic: user.profilePic
        };
        return res.status(201).json({
            success: true,
            user: safeUser,
            token,
            message: "User created successfully"
        });

    } catch (error) {
        console.log(error.message);
        return res.status(409).json({ success: false, message: error.message })
    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or username"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            })
        }
        const token = generateToken(user._id)

        const safeUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            bio: user.bio,
            profilePic: user.profilePic
        };
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: safeUser,
            token
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
export async function checkAuth(req, res) {
    res.json({ success: true, user: req.user })
}
export async function updateProfile(req, res) {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if (!profilePic) {
            updatedUser = await userModel.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await userModel.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }
        return res.status(200).json({ success: true, user: updatedUser })
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({ success: false, message: error.message })
    }
}
export async function logout(req, res) {
    const token = req.cookies.token;
    res.clearCookie("token", token)
    return res.status(200).json({
        success: true,
        message: "user logged out successfully"
    })
}