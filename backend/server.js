const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')
const { PrismaClient, PunchType } = require('@prisma/client')
const prisma = new PrismaClient()

const isProd = process.env.NODE_ENV === 'production'
const app = express()
const PORT = 3000

if (isProd) {
    app.set('trust proxy', 1)
}

app.use(express.urlencoded({ extended: true}))
app.use(express.json())

app.use(session({
    secret: 'keyboard-cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
        sameSite: 'lax',
        secure: false
        }
}))

function isAuth (req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized"})
    } else {
        next()
    }
}

//verify required role is present
function requireRole (role) {
    return (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Session not found"})
    }
    if (req.session.user.role !== role) {
        return res.status(403).json({ error: "Forbidden"})
    }
    next()
}}

app.get('/api/me', isAuth, (req, res) => {
    const user = req.session.user
    return res.status(200).json({ data: {
        id: user.id,
        role: user.role,
        username: user.username
    }})
})

//login api endpoint
app.post('/api/login', async (req, res) => {

    //validate user login
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(401).json({ error: "Username and password are required."})
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true, username: true, passwordHash: true, role: true }
    })

    if (!user) {
        return res.status(400).send({ error: "Invalid username or password"})
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
        return res.status(400).send({ error: "Invalid username or password"})
    }

    //generate cookie for successful login
    req.session.regenerate(function (err) {
        if (err) {
            return res.status(500).send({ error: "Internal server error"})
        }

        req.session.user = { id: user.id, username: user.username, role: user.role }

        req.session.save(function (err) {
            if (err) return next(err)
            console.log('user: ' + req.session.user.username)
        
            return res.status(200).send({
                "success": true,
                message: "success"
            })
        })
    })
})

//logout route
app.post('/api/logout', (req, res) => {
    if(!req.session.user) {
        return res.status(400).json({ error: "Not logged in"})
    }
    req.session.destroy(function (err) {
        if (err) {
            return res.status(500).json({ error: "Internal server error"})
        }
        res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'lax', secure: false })
        return res.status(204).json({ message: "Logged out" })
    })
})


app.post('/api/me/punches', isAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const username = req.session.user.username;

        
        const punch = await prisma.$transaction(async (tx) => {
            const recent = await tx.punch.findFirst({
                where: { userid: userId },
                orderBy: { punchedAt: 'desc' },
                select: { type: true },
            });

            const nextType = recent?.type === 'IN' ? 'OUT' : 'IN'; // ensure matches your enum literals

            const { location } = req.body;

            const created = await tx.punch.create({
                data: {
                location,
                userid: userId,
                username,
                type: nextType,
                },
                select: {
                id: true,
                type: true,
                punchedAt: true,
                location: true,
                userid: true,
                username: true,
                },
            });

            return created;
        });

        return res.status(200).json({ punch });
    } catch (error) {
        return res.status(503).json({ error: "Failed creating punch", error})
    }
})

//employee return punches
app.get('/api/punches', isAuth, async (req, res) => {
    try {

        //parse query params 
        effectiveUID = req.session.user.id

        if (req.session.user.role === "ADMIN") {
            effectiveUID = Number(req.query.userId)
        }

        const limit = Math.max(1, Math.min(parseInt(String(req.query.limit ?? '10'), 10) || 10, 100))
        const cursor = req.query.cursor ? Number(req.query.cursor) : null

        const queryArgs = {
            where: {
                userid: effectiveUID
            }, orderBy: [
                { punchedAt: 'desc' }, 
                { id: 'desc' }
            ], take: limit,
            select: {
                id: true,
                type: true,
                punchedAt: true,
                location: true
            }
        }

        if (cursor) {
            queryArgs.cursor = { id: cursor }
            queryArgs.skip = 1
        }

        //find punches
        const punches = await prisma.punch.findMany(queryArgs)

        //build return cursor
        if (punches.length === limit) {
            nextCursor = punches[punches.length - 1].id
        } else {
            nextCursor = null
        }

        return res.status(200).json({ data: punches, nextCursor })
    } catch (error) {
        console.log(error)
        return res.status(503).json({ error })
    }
})

//create new user
app.post('/api/admin/registerUser', isAuth, requireRole("ADMIN"), async (req, res) => {
    try {
        const { username, password, role } = req.body

        //validate input
        if (!username || !password || !role) {
            return res.status(400).json({ error: "Fill required fields"})
        }

        const passwordHash = await bcrypt.hash(password, 12)

        //create db entry
        const user = await prisma.user.create({
            data: {
                username: username,
                role: role,
                passwordHash: passwordHash
            }
        })

        return res.status(200).json({ user })
    } catch (error) {
        return res.status(503).json({ error: "Failed registering user"})
    }
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
