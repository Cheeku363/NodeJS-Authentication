const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('./model/user')

const app = express()
app.use(express.json())

const JWT_SECRET = 'sfdfskasj^dgk35^&%$#fijggeokgnbfirtapgk@!@*!$@220dfkvnawpjg3dgg3$*#($gdgs&'

// Connecting to local mongodb
mongoose.connect('mongodb://localhost:27017/LoginApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.use('/', express.static(path.join(__dirname, 'static')))

// Registration Route
app.post('/api/register', async (req, res) => {

    // Destructuring from the form!
    const { username, password: PlainTextPassword } = req.body

    // Check Username
    if (!username || typeof username !== 'string') {
        return res.json({
            status: 'error',
            error: 'Invalid Username'
        })
    }

    // Check Password
    if (!PlainTextPassword || typeof PlainTextPassword !== 'string') {
        return res.json({
            status: 'error',
            error: 'Invalid Password'
        })
    }

    // Check Password Length
    if (PlainTextPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        })
    }

    // Hashing Password   
    const password = await bcrypt.hash(PlainTextPassword, 10)

    // Creating User
    try {
        const response = await User.create({
            username,
            password
        })
        console.log('User Created Successfully', response);
    } catch (error) {
        if (error.code === 11000) {
            // duplicate key
            return res.json({ status: 'error', error: 'Username already in use' })
        }
        throw error;
    }
    res.json({ status: 'ok' })
})

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username }).lean()

    // Check If user valid or not
    if (!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' })
    }

    if (await bcrypt.compare(password, user.password)) {
        // the username, password combination is successful
        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, JWT_SECRET)

        return res.json({ status: 'ok', data: token })
    }

    res.json({ status: 'error', error: 'Invalid username/password' })
})

// Change Password Route
app.post('/api/change-password', async (req, res) => {
    const { token, newpassword: PlainTextPassword } = req.body

    // Check Password
    if (!PlainTextPassword || typeof PlainTextPassword !== 'string') {
        return res.json({
            status: 'error',
            error: 'Invalid Password'
        })
    }

    // Check Password Length
    if (PlainTextPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        })
    }

    try {

        // gives a decoded version of the middlepath of jwt
        const user = jwt.verify(token, JWT_SECRET)

        // ...
        const _id = user.id

        // You have to hash password again
        const password = await bcrypt.hash(PlainTextPassword, 10)

        // Update the password in Database
        await User.updateOne({ _id }, {
            $set: { password }
        })
        res.json({ status: 'ok' })
        console.log('JWT decoded:', user)

    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: ';))' })
    }
})


app.listen(1337, () => {
    console.log("server up and running!");
})