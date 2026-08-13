import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import { app } from "./app.js"

app.get('/', () => {
    
})

dotenv.config({path: './.env'})
connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port: http://localhost:${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log('Mongodb connection failed!', err)
})

