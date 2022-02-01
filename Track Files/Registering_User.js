// Registration
app.post('/api/register', async (req, res) => {

    // Destructuring from the form!
    const { username, password: HashedPassword } = req.body

    // Check Username
    if (!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Username' })
    }

    // Check Password
    if (!HashedPassword || typeof HashedPassword !== 'string') {
        return res.json({
            status: 'error',
            error: 'Invalid Password'
        })
    }

    // Check Password Length
    if (HashedPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        })
    }

    // Hashing Password   
    const password = await bcrypt.hash(HashedPassword, 10)

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

