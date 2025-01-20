import { compareSync, hashSync } from "bcrypt";
import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { createBean, getBeans } from "./src/gen/beans_sql";
import {
  createUserBean,
  deleteUserBean,
  getUserBeans,
  getUserByUsername,
  incrementLoginAttempts,
  resetLoginAttempts,
  signup,
} from "./src/gen/user_sql";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Coffee Addiction API",
      version: "1.0.0",
      description: "Coffee Addiction API swagger documentation",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./app.ts"], // Path to the API docs
};

const client = new Pool({
  connectionString: "postgres://postgres:postgres@localhost:5432/beans",
});
try {
  client.connect();
} catch (e) {
  console.error(e);
  process.exit(1);
}

const swaggerSpec = swaggerJSDoc(swaggerOptions);
//write to file
fs.writeFile("./swagger.json", JSON.stringify(swaggerSpec), (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /beans:
 *   get:
 *     summary: Returns list of coffee beans
 *     description: Retrieves a list of coffee beans from the database
 *     tags:
 *       - Coffee Beans
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 beans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       beanId:
 *                         type: integer
 *                         description: Unique identifier for the coffee bean
 *                       name:
 *                         type: string
 *                         description: Name of the coffee bean
 *                       origin:
 *                         type: string
 *                         description: Country or region of origin
 *                       roastLevel:
 *                         type: string
 *                         description: Level of roast (e.g., light, medium, dark)
 *                       imageUrl:
 *                          type: string
 *                          description: URL
 *                       pricePerKg:
 *                         type: number
 *                         format: float
 *                         description: Price per kilogram of coffee beans
 *                       stockQuantity:
 *                         type: integer
 *                         description: Available quantity in stock
 *                       description:
 *                         type: string
 *                         description: Detailed description of the coffee bean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.get("/beans", async (req, res) => {
  try {
    let beans = await getBeans(client);
    res.json({ beans: beans });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
});

function generateAccessToken(user_id: number) {
  return jwt.sign({ id: user_id }, process.env.TOKEN_SECRET as string, {
    expiresIn: 3600,
  });
}

/**
 * @swagger
 * /beans:
 *   post:
 *     summary: Creates a new bean
 *     description: Creates a new bean in the database
 *     tags:
 *       - Coffee Beans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the bean
 *               origin:
 *                 type: string
 *                 description: Country or region of origin
 *               roastLevel:
 *                 type: string
 *                 description: Level of roast (e.g., light, medium, dark)
 *               pricePerKg:
 *                 type: number
 *                 format: float
 *                 description: Price per kilogram of coffee beans
 *               imageUrl:
 *                 type: string
 *                 description: URL
 *               stockQuantity:
 *                 type: integer
 *                 description: Available quantity in stock
 *               description:
 *                 type: string
 *                 description: Detailed description of the coffee bean
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bean:
 *                   type: object
 *                   properties:
 *                     bean_id:
 *                       type: integer
 *                       description: Unique identifier for the coffee bean
 *                     name:
 *                       type: string
 *                       description: Name of the coffee bean
 *                     origin:
 *                       type: string
 *                       description: Country or region of origin
 *                     roastLevel:
 *                       type: string
 *                       description: Level of roast (e.g., light, medium, dark)
 *                     pricePerKg:
 *                       type: number
 *                       format: float
 *                       description: Price per kilogram of coffee beans
 *                     imageUrl:
 *                         type: string
 *                         description: URL
 *                     stockQuantity:
 *                       type: integer
 *                       description: Available quantity in stock
 *                     description:
 *                       type: string
 *                       description: Detailed description of the coffee bean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.post("/beans", async (req, res) => {
  //validate req.body is CreateBeanArgs
  try {
    const bean = req.body;
    console.log(bean);
    const result = await createBean(client, bean);
    res.json({ bean: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Logs in a user
 *     description: Logs in a user with their email and password
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: Password of the user
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: Unique identifier for the user
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                 jwt:
 *                   type: string
 *                   description: JWT token of user
 *                 loginAttempts:
 *                   type: integer
 *                   description: Number of login attempts for the user
 *                 firstName:
 *                   type: string
 *                   description: First name of the user
 *                 lastName:
 *                   type: string
 *                   description: Last name of the user
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Date and time when the user was created
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.post("/login", async (req, res): Promise<any> => {
  const user = req.body;

  if (!user.username || !user.password) {
    return res.status(400).json({ error: "Bad request" });
  }

  const result = await getUserByUsername(client, {
    username: user.username,
  });

  if (result == null) {
    return res.status(400).json({ error: "Invalid username" });
  }

  if (result.loginAttempts > 3) {
    return res.status(400).json({ error: "Too many login attempts" });
  }

  if (!compareSync(user.password, result.passwordHash)) {
    await incrementLoginAttempts(client, {
      userId: result.userId,
    });

    return res.status(400).json({ error: "Invalid credentials" });
  } else {
    await resetLoginAttempts(client, {
      userId: result.userId,
    });
  }

  return res.json({
    ...result,
    passwordHash: undefined,
    jwt: generateAccessToken(result.userId),
  });
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Signs up a new user
 *     description: Signs up a new user with their email, password, and other details
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Desired username
 *               password:
 *                 type: string
 *                 description: Password of the user
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  jwt:
 *                    type: string
 *                    description: JSON Web Token
 *
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.post("/signup", async (req, res): Promise<any> => {
  const user = req.body;
  const hash = hashSync(user.password, 10);

  const result = await signup(client, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    passwordHash: hash,
  });

  if (result) {
    return res.json({ jwt: generateAccessToken(result.userId) });
  } else {
    return res.status(400).json({ error: "Unable to sign up user" });
  }
});

function verifyJwt(token: string | undefined): string | null {
  if (!token) {
    return null;
  }
  //trim off "Bearer "
  token = token.slice(7, token.length);
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string);
    return (decoded as { id: string }).id;
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * @swagger
 * /user/beans:
 *   get:
 *     summary: Returns list of beans owned by the user
 *     description: Retrieves a list of beans owned by the user from the database
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 beans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       beanId:
 *                         type: integer
 *                         description: Unique identifier for the coffee bean
 *                       name:
 *                         type: string
 *                         description: Name of the coffee bean
 *                       origin:
 *                         type: string
 *                         description: Country or region of origin
 *                       roastLevel:
 *                         type: string
 *                         description: Level of roast (e.g., light, medium, dark)
 *                       imageUrl:
 *                          type: string
 *                          description: URL
 *                       pricePerKg:
 *                         type: number
 *                         format: float
 *                         description: Price per kilogram of coffee beans
 *                       stockQuantity:
 *                         type: integer
 *                         description: Available quantity in stock
 *                       description:
 *                         type: string
 *                         description: Detailed description of the coffee bean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.get("/user/beans", async (req, res): Promise<any> => {
  //verify jwt
  const userId = verifyJwt(req.headers.authorization);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const beans = await getUserBeans(client, {
    userId: Number(userId),
  });

  res.json({ beans: beans });
});

/**
 * @swagger
 * /user/bean/create:
 *   post:
 *     summary: Creates a new bean owned by the user
 *     description: Creates a new bean owned by the user in the database
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the bean
 *               origin:
 *                 type: string
 *                 description: Country or region of origin
 *               roastLevel:
 *                 type: string
 *                 description: Level of roast (e.g., light, medium, dark)
 *               pricePerKg:
 *                 type: number
 *                 format: float
 *                 description: Price per kilogram of coffee beans
 *               imageUrl:
 *                 type: string
 *                 description: URL
 *               stockQuantity:
 *                 type: integer
 *                 description: Available quantity in stock
 *               description:
 *                 type: string
 *                 description: Detailed description of the coffee bean
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bean:
 *                   type: object
 *                   properties:
 *                     bean_id:
 *                       type: integer
 *                       description: Unique identifier for the coffee bean
 *                     name:
 *                       type: string
 *                       description: Name of the coffee bean
 *                     origin:
 *                       type: string
 *                       description: Country or region of origin
 *                     roastLevel:
 *                       type: string
 *                       description: Level of roast (e.g., light, medium, dark)
 *                     pricePerKg:
 *                       type: number
 *                       format: float
 *                       description: Price per kilogram of coffee beans
 *                     imageUrl:
 *                         type: string
 *                         description: URL
 *                     stockQuantity:
 *                       type: integer
 *                       description: Available quantity in stock
 *                     description:
 *                       type: string
 *                       description: Detailed description of the coffee bean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.post("/user/bean/create", async (req, res): Promise<any> => {
  //verify jwt
  const userId = verifyJwt(req.headers.authorization);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const bean = req.body;
  let result;

  try {
    result = await createUserBean(client, {
      name: bean.name,
      origin: bean.origin,
      roastLevel: bean.roastLevel,
      imageUrl: bean.imageUrl,
      pricePerKg: bean.pricePerKg,
      stockQuantity: bean.stockQuantity,
      description: bean.description,
      userId: Number(userId),
    });
  } catch (e) {
    return res.status(500).json({ error: e });
  }

  res.json({ bean: result });
});

/**
 * @swagger
 * /bean/{id}:
 *   delete:
 *     summary: Deletes a bean owned by the user
 *     description: Deletes a bean owned by the user from the database
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   description: Whether the bean was deleted successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.delete("/bean/:id", async (req, res): Promise<any> => {
  //verify jwt
  const userId = verifyJwt(req.headers.authorization);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const beanId = Number(req.params.id);

  const result = await deleteUserBean(client, {
    beanId: beanId,
    userId: Number(userId),
  });

  res.json({ result: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
