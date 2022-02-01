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

