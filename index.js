"use strict";
const axios = require("axios");
const fs = require("fs");
const { Pool } = require("pg");

// path - https://storage.yandexcloud.net/cloud-certs/CA.pem
const pathToCert = "./certs/CA.pem";

const config = {
    connectionString:
        "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(pathToCert).toString(),
    },
};

const pool = new Pool(config);

async function createTable() {
    const query = `
    CREATE TABLE IF NOT EXISTS dmitr1y_s (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data JSONB NOT NULL
    );`;

    try {
        await pool.query(query);
        console.log("Table dmitr1y_s created or already exists");
    } catch (err) {
        console.error("Error creating table", err.message);
    }
}

async function saveCharacter(character) {
    const query = "INSERT INTO dmitr1y_s(name, data) VALUES($1, $2)";
    const values = [character.name, character];

    try {
        await pool.query(query, values);
        console.log(`Character inserted: ${character.name}`);
    } catch (err) {
        console.error("Error in inserting character", err.message);
    }
}

async function fetchAndSaveCharacters() {
    try {
        await createTable();
        const response = await axios.get(
            "https://rickandmortyapi.com/api/character",
        );
        const characters = response.data.results;
        for (const character of characters) {
            saveCharacter(character);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

fetchAndSaveCharacters();

//If you need to delete a table, you can use the following query:
/*
async function dropTable() {
    try {
        await pool.query('DROP TABLE IF EXISTS dmitr1y_s;'); 
        console.log('Table dmitr1y_s dropped successfully.');
    } catch (err) {
        console.error('Error: ', err.stack);
    } finally {
        await pool.end(); 
    }
}

dropTable(); */
