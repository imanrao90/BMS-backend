import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)

        console.log(`\n Mongodb connected: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error:", error)
        process.exit(1)
    }
}