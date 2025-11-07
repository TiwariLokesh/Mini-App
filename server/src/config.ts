import "dotenv/config";
export const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  jwtSecret: process.env.JWT_SECRET ?? "supersecretjwt",
  databasePath: process.env.DATABASE_PATH ?? "./data/data.db"
};
