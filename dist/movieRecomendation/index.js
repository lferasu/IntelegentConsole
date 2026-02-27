"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const utils_1 = require("./utils");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default();
const loadMovieVectors = async () => {
    const movieVectorsPath = (0, path_1.join)(__dirname, "movieVectors.json");
    try {
        const fileContents = await (0, promises_1.readFile)(movieVectorsPath, "utf-8");
        return JSON.parse(fileContents);
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        await (0, utils_1.createEmbeddingAndSave)();
        const fileContents = await (0, promises_1.readFile)(movieVectorsPath, "utf-8");
        return JSON.parse(fileContents);
    }
};
async function main() {
    const movieVectors = await loadMovieVectors();
    console.log("Welcome to the Movie Recommendation System!");
    console.log("Please enter a movie title or description to get recommendations:");
    process.stdin.addListener('data', async (input) => {
        const trimmedInput = input.toString().trim();
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: trimmedInput
        });
        const inputEmbedding = response.data[0].embedding;
        const similarMovies = (0, utils_1.findClosestMovies)(inputEmbedding, movieVectors, 2);
        console.log("Top Movie Recommendations:");
        similarMovies.forEach((movie, index) => {
            console.log(`${index + 1}. ${movie.title} (Similarity: ${movie.similarity.toFixed(2)})`);
        });
    });
}
main();
