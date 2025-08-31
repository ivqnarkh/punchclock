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

//verify auth status
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

//return current user
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

//create punch route
app.post('/api/me/punches', isAuth, async (req, res) => {
    try {
        const userId = req.session.user.id
        const username = req.session.user.username

        //isolate into transaction
        const punch = await prisma.$transaction(async (tx) => {
            const recent = await tx.punch.findFirst({
                where: { userid: userId },
                orderBy: { punchedAt: 'desc' },
                select: { type: true },
            })

            //determine next punch type
            const nextType = recent?.type === 'IN' ? 'OUT' : 'IN'

            const { location } = req.body

            //create punch in db
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
            })

            return created
        });

        return res.status(200).json({ punch })
    } catch (error) {
        return res.status(503).json({ error: "Failed creating punch", error})
    }
})

//employee return punches
app.get('/api/punches', isAuth, async (req, res) => {
    try {

        //parse query params 
        let effectiveUID = req.session.user.id

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
            return res.status(400).json({ error: "Fill required fields" })
        }

        //check for existing username
        const exists = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (exists) {
            return res.status(409).json({ error: "Username already exists" })
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
        return res.status(503).json({ error: "Failed registering user" })
    }
})

//calculate hours worked
app.get('/api/hoursWorked', isAuth, async (req, res) => {
    try {
        let userId = req.session.user.id

        //if admin select userid based on query params
        if (req.session.user.role === 'ADMIN' && req.query.userId) {
        userId = Number(req.query.userId)
        if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" })
        }

        //get date filters from request
        const { startDate, endDate } = req.query
        let start = startDate ? new Date(startDate) : null
        let end = endDate ? new Date(endDate) : null

        if (start && isNaN(start.getTime())) {
            return res.status(400).json({ error: "Invalid startDate" })
        }

        if (end && isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid endDate" })
        }

        //clamp dates to be inclusive of days selected, convert local time to UTC
        const dateFilter = {}
        if (start) dateFilter.gte = start
        if (end) {
            const day = end.getUTCDate()
            const month = end.getUTCMonth()
            const year = end.getUTCFullYear()
            end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))
            dateFilter.lte = end
        }

        //get punches from db based on time filter
        const punches = await prisma.punch.findMany({
        where: {
            userid: userId,
            punchedAt: Object.keys(dateFilter).length ? dateFilter : undefined,
        },
        orderBy: { punchedAt: 'asc' },
        select: { type: true, punchedAt: true }
        })

        let totalSeconds = 0
        let inTime = null

        //loop through punches and pair each in with out, calculate difference
        for (const punch of punches) {
        if (punch.type === PunchType.IN) {
            inTime = punch.punchedAt
        } else if (punch.type === PunchType.OUT && inTime) {
            totalSeconds += (punch.punchedAt.getTime() - inTime.getTime()) / 1000
            inTime = null
        }
        }

        //convert to hours and return
        const hoursWorked = +(totalSeconds / 3600).toFixed(2)
        return res.status(200).json({ hoursWorked })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Failed to calculate hours worked" })
    }
})

//get list of employees
app.get('/api/employees', isAuth, requireRole("ADMIN"), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: "USER"
            },
            select: {
                id: true, username: true
            }
        })

        return res.status(200).json({ users })
    } catch (error) {
        return res.status(400).json({ error: "Failed to retrieve hours worked"})
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
