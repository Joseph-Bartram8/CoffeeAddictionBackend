import cors from "cors";
import express from "express";
import fs from "fs";
import { Pool } from 'pg';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { createBean, getBeans } from "./src/gen/beans_sql";

const app = express();
app.use(express.json());
app.use(cors())
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

const client = new Pool({ connectionString: "postgres://postgres:postgres@localhost:5432/beans" });
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
    try{
        let beans = await getBeans(client);
        res.json({ beans: beans });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e});
    }
});


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

//authenticated route

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
